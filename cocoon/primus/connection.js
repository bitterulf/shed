const graphql = require('graphql');
const sessionStore = require('../store/session');
const schema = require('../schema/schema.js');
const md5 = require('../utils/md5.js');

const users = {};

module.exports = function(primus, intentStream) {
    primus.authorize(function (req, done) {

        sessionStore.findOne({ token: req.query.token }, function(err, doc) {
            if (doc) {
                return done();
            }
            done(new Error('invalid token'));
        });

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

                spark.on('intent', function(message) {
                    message.username = spark.username;
                    intentStream.write(message);
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

                spark.subscriptions = [];

                spark.on('subscription', function(message) {
                    if (message.payload && message.id) {
                        spark.subscriptions.push(message);
                        console.log('subscription added');
                    }
                });

                spark.emit('authorized');
            }
        });
    });
}
