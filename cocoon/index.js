const Primus = require('primus');
const http = require('http');
const _ = require('highland');
const Path = require('path');
const Hapi = require('hapi');
const unirest = require('unirest');
const shortid = require('shortid').generate;
const test = require('./test.js');

const sessionStore = require('./store/session');

console.log(sessionStore);

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
const sessions = {};

const users = {};

primus.authorize(function (req, done) {

    sessionStore.findOne({ token: req.query.token }, function(err, doc) {
        if (doc) {
            return done();
        }
        done(new Error('invalid token'));
    });

});

const streams = {};

streams.factStream = _()
    .each(function(fact) {
        primus.forEach(function (spark, id, connections) {
            if (spark.username) {
                spark.write({ type: 'fact', payload: fact });
            }
        });
    });
streams.factStream.resume();

streams.intentStream = _()
    .each(function(intent) {
        console.log('got intend', intent);
        streams.factStream.write(intent);
    });

streams.intentStream.resume();

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
                streams.intentStream.write(spark.username + ': ' + message);
            });

            spark.write({type: 'authorized'});
        }
    });
});

function testConnection() {

    test.register('bob', 'banana', function() {
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
        require('inert')
    ], (err) => {

    server.start((err) => {

        server.route({
            method: 'POST',
            path: '/register',
            handler: function (request, reply) {
                const payload = request.payload;
                if (payload.username && payload.password && !credentials[payload.username]) {
                    credentials[payload.username] = payload.password;
                    return reply('user registered');
                }
                reply('user not registered');
            }
        });

        server.route({
            method: 'POST',
            path: '/login',
            handler: function (request, reply) {
                const payload = request.payload;
                console.log('UNK', request.payload);
                if (credentials[payload.username] && credentials[payload.username] == payload.password) {

                    sessionStore.remove({ username: payload.username }, { multi: true }, function (err, numRemoved) {
                        const token = shortid();

                        sessionStore.insert({ token: token, username: payload.username}, function(err, newDoc) {
                            return reply(token);
                        });
                    });

                } else {
                    reply('');
                }
            }
        });

        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);

        testConnection();
    });

});
