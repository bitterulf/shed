const Primus = require('primus');
const http = require('http');
const _ = require('highland');
const Path = require('path');
const Hapi = require('hapi');
const unirest = require('unirest');
const test = require('./test.js');
const factStream = require('./streams/factStream.js');
const intentStream = require('./streams/intentStream.js');
const graphql = require('graphql');
const bluebird = require('bluebird');
const crypto = require('crypto');

const sessionStore = require('./store/session');

function md5(value) {
    return crypto
        .createHash('md5')
        .update(JSON.stringify(value))
        .digest('hex');
}

const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname)
            }
        }
    }
});

server.connection({
    port: 8080
});

const primus = new Primus(server.listener, {/* options */});

const credentials = {};

const users = {};

primus.authorize(function (req, done) {

    sessionStore.findOne({ token: req.query.token }, function(err, doc) {
        if (doc) {
            return done();
        }
        done(new Error('invalid token'));
    });

});

const fetchAllMessages = bluebird.promisify(function(cb) {
    cb(null, [{
        username: 'bob',
        text: 'fake'
    }]);
});

let currentFacts;

const schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
            messages: require('./query/messages.js')(function(root, args) {
                return currentFacts.messages || [];
            })
        }
    })
});

const moddedFactStream = factStream(function(fact) {
    currentFacts = fact;

    graphql.graphql(schema, '{ messages { text } }').then(result => {
        primus.forEach(function (spark, id, connections) {
            if (spark.username) {
                spark.emit('dataChanged', result.data);
            }
        });
    });
});

const moddedIntentStream = intentStream(function(intent) {
    moddedFactStream.write(intent);
});

primus.plugin('emit', require('primus-emit'));

primus.on('connection', function (spark) {
    sessionStore.findOne({ token: spark.query.token }, function(err, doc) {
        if (doc) {

            spark.username = doc.username;

            if (!users[spark.username]) {
                users[spark.username] = {
                    username: spark.username
                };
            }

            spark.on('intent', function(message) {
                message.username = spark.username;
                moddedIntentStream.write(message);
            });

            spark.on('query', function(message) {
                graphql.graphql(schema, message.payload).then(result => {
                    const md5Hash =  md5(result.data);
                    if (!message.md5Hash || message.md5Hash != md5Hash) {
                        spark.emit('queryResponse', {
                            id: message.id,
                            payload: result.data,
                            md5Hash: md5Hash
                        });
                    }
                    else {
                        console.log('update dropped');
                    }
                });
            });

            spark.emit('authorized');
        }
    });
});

function testConnection() {

    test.register('bob', 'banana', function(response) {
        test.login('bob', 'banana', function(response) {
            const token = response.body;

            const Socket = Primus.createSocket({
                  plugin: {
                    'emit': require('primus-emit')
                  }
            });

            const client = new Socket('http://localhost:8080?token=' + token);

            let md5Hash;
            client.on('authorized', function(foo) {
                client.emit('intent', {type: 'message', payload: 'hello'});
                client.emit('intent', {type: 'message', payload: 'hello2'});
                client.emit('query', {id: 'abc123', payload: '{ messages { text } }', md5Hash: md5Hash });
                setTimeout(function() {
                    client.emit('query', {id: 'abc123', payload: '{ messages { text } }', md5Hash: md5Hash });
                }, 1000);
            });

            client.on('dataChanged', function(message) {
                console.log('CLIENT GOT DATA', message);
            });

            client.on('queryResponse', function(message) {
                console.log('QUERY RESPONSE', message);
                md5Hash = message.md5Hash;
            });
        });
    });

};

server.register(
    [
        require('inert'),
        require('./plugins/userPlugin.js')
    ], (err) => {

    server.start((err) => {


        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);

        testConnection();
    });

});
