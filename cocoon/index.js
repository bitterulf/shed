const Primus = require('primus');
const http = require('http');
const _ = require('highland');
const Path = require('path');
const Hapi = require('hapi');
const unirest = require('unirest');
const test = require('./test.js');
const factStream = require('./streams/factStream.js');
const intentStream = require('./streams/intentStream.js');

const sessionStore = require('./store/session');

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

const moddedFactStream = factStream(function(fact) {
    primus.forEach(function (spark, id, connections) {
        if (spark.username) {
            spark.write({ type: 'fact', payload: fact });
        }
    });
});

const moddedIntentStream = intentStream(function(intent) {
    moddedFactStream.write(intent);
});

primus.on('connection', function (spark) {
    sessionStore.findOne({ token: spark.query.token }, function(err, doc) {
        if (doc) {

            spark.username = doc.username;

            if (!users[spark.username]) {
                users[spark.username] = {
                    username: spark.username
                };
            }

            spark.on('data', function(message) {
                moddedIntentStream.write(spark.username + ': ' + message);
            });

            spark.write({type: 'authorized'});
        }
    });
});

function testConnection() {

    test.register('bob', 'banana', function(response) {
        test.login('bob', 'banana', function(response) {
            const token = response.body;

            const Socket = Primus.createSocket({});

            const client = new Socket('http://localhost:8080?token=' + token);

            client.on('data', function(message) {
                if (message.type == 'authorized') {
                    client.write('TesT');
                } else {
                    console.log('CLIENT GOT FACT', message);
                }
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
