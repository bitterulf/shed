const Primus = require('primus');
const http = require('http');
const _ = require('highland');
const Path = require('path');
const Hapi = require('hapi');
const unirest = require('unirest');
const shortid = require('shortid').generate;
const test = require('./test.js');

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
    const activeUser = sessions[req.query.token];

    if (activeUser) {
        return done();
    }
    done(new Error('invalid token'));
});

const streams = {};

streams.factStream = _()
    .each(function(fact) {
        primus.forEach(function (spark, id, connections) {
            if (spark.username) {
                spark.write(fact);
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
    const activeUser = sessions[spark.query.token];

    if (activeUser) {
        spark.username = activeUser;

        if (!users[activeUser]) {
            users[activeUser] = {
                username: activeUser
            };
        }

        spark.on('data', function(message) {
            streams.intentStream.write(spark.username + ': ' + message);
        });
    }
});

function testConnection() {

    test.register('bob', 'banana', function() {
        test.login('bob', 'banana', function(response) {
            const token = response.body;

            const Socket = Primus.createSocket({});

            const client = new Socket('http://localhost:8080?token=' + token);
            client.write('TesT');
            client.on('data', function(message) {
                console.log('CLIENT GOT FACT', message);
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
                    credentials[payload.username] = payload.password;

                    Object.keys(sessions).forEach(function(key) {
                        if (sessions[key] == payload.username) {
                            delete sessions[key];
                        }
                    });

                    const token = shortid();

                    sessions[token] = payload.username;
                    return reply(token);
                }
                reply('');
            }
        });

        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);

        testConnection();
    });

});
