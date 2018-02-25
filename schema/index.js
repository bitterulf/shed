const graphql = require('graphql');

const schema = new graphql.GraphQLSchema({
    mutation: new graphql.GraphQLObjectType({
        name: 'RootMutationType',
        fields: {
            ship: require('./mutation/ship.js')
        }
    }),
    query: new graphql.GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
            ships: require('./query/ships.js'),
            ship: require('./query/ship.js')
        }
    })
});

module.exports = schema;
