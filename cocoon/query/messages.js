const graphql = require('graphql');
const globalState = require('../state/state.js');

const MessageType = new graphql.GraphQLObjectType({
    name: 'Message',
    description: 'This represent a Message',
    fields: () => ({
        username: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        text: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)}
    })
});

module.exports = {
    type: new graphql.GraphQLList(MessageType),
    resolve: function(root, args) {
        return globalState.get().messages || [];
    }
};
