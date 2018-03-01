const globalState = require('../state/state.js');
const graphql = require('graphql');
const schema = require('../schema/schema.js');
const md5 = require('../utils/md5.js');

module.exports = function(primus, fact) {
    globalState.set(fact);

    primus.forEach(function (spark, id, connections) {
        if (spark.username) {
            if (spark.subscriptions) {
                spark.subscriptions.forEach(function(subscription) {
                    graphql.graphql(schema, subscription.payload).then(result => {
                        const md5Hash =  md5(result.data);
                        if (subscription.md5Hash != md5Hash) {
                            spark.emit('subscriptionResponse', {
                                id: subscription.id,
                                payload: result.data,
                            });
                            subscription.md5Hash = md5Hash;
                        }
                        else {
                            console.log('subscription update dropped');
                        }
                    });
                });
            }
        }
    });
};
