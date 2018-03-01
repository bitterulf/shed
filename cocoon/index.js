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

const sessionStore = require('./store/session');
const schema = require('./schema/schema.js');
const md5 = require('./utils/md5.js');
const factChange = require('./primus/factChange.js');

const util = require('util')

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

const moddedFactStream = factStream(function(fact) {
    factChange(primus, fact);
});

const moddedIntentStream = intentStream().pipe(moddedFactStream);

primus.plugin('emit', require('primus-emit'));

require('./primus/connection.js')(primus, moddedIntentStream);

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
                client.emit('subscription', {id: 'abc123', payload: '{ messages { text } }' });
                client.emit('subscription', {id: 'abc123', payload: '{ users { id, username, ships { id, type, user { username } } } }' });
                client.emit('subscription', {id: 'abc123', payload: '{ ships { id, type, owner, user { username } } }' });
                client.emit('intent', {type: 'message', payload: 'hello'});
                client.emit('intent', {type: 'message', payload: 'hello2'});
                client.emit('query', {id: 'abc123', payload: '{ messages { text } }', md5Hash: md5Hash });
                setTimeout(function() {
                    client.emit('query', {id: 'abc123', payload: '{ messages { text } }', md5Hash: md5Hash });
                }, 1000);
            });

            client.on('subscriptionResponse', function(message) {
                console.log('SUBSCRIPTION RESPONSE', util.inspect(message.payload, false, null));
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
