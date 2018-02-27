const Primus = require('primus');
const http = require('http');
const _ = require('highland');
const Path = require('path');
const Hapi = require('hapi');

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

const users = {
    bob: {
        username: 'bob'
    }
};

const activeTokens = [
    {token: 'foo', username: 'bob'}
];

primus.authorize(function (req, done) {
    const activeUser = activeTokens.find(function(entry) {
        return entry.token == req.query.token;
    });

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
    const activeUser = activeTokens.find(function(entry) {
        return entry.token == spark.query.token;
    });

    if (activeUser && activeUser.username) {
        spark.username = activeUser.username;

        spark.on('data', function(message) {
            streams.intentStream.write(message);
        });
        // spark.write('hello '+spark.username);
    }
});

const Socket = Primus.createSocket({});

const client = new Socket('http://localhost:8080?token=foo');
client.write('TesT');
client.on('data', function(message) {
    console.log('CLIENT GOT FACT', message);
});

server.register(
    [
        require('inert')
    ], (err) => {

    server.start((err) => {

        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });

});
