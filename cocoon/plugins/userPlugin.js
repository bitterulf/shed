const sessionStore = require('../store/session');
const credentialsStore = require('../store/credentials');
const shortid = require('shortid').generate;

const userPlugin = {
    register: function (server, options, next) {
        server.route({
            method: 'POST',
            path: '/register',
            handler: function (request, reply) {
                const payload = request.payload;
                if (payload.username && payload.password) {
                    credentialsStore.findOne({ username: payload.username }, function(err, doc) {
                        if (!doc) {
                            credentialsStore.insert({ username: payload.username, password: payload.password }, function(err, doc) {
                                reply('user registered');
                            });
                        }
                        else {
                            reply('user exists already');
                        }
                    });
                } else {
                    reply('invalid register call');
                }
            }
        });

        server.route({
            method: 'POST',
            path: '/login',
            handler: function (request, reply) {
                const payload = request.payload;

                credentialsStore.findOne({ username: payload.username, password: payload.password }, function(err, doc) {
                    if (doc) {
                        sessionStore.remove({ username: payload.username }, { multi: true }, function (err, numRemoved) {
                            const token = shortid();

                            sessionStore.insert({ token: token, username: payload.username}, function(err, newDoc) {
                                return reply({ token: token });
                            });
                        });
                    }
                    else {
                        reply({});
                    }
                });
            }
        });

        next();
    }
};

userPlugin.register.attributes = {
    name: 'userPlugin',
    version: '1.0.0'
};

module.exports = userPlugin;
