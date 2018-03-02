const graphql = require('graphql');

module.exports = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
            messages: require('../query/messages.js'),
            users: require('../query/users.js'),
            ships: require('../query/ships.js'),
            myScore: require('../query/myScore.js')
        }
    })
});
