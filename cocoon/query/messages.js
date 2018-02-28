const graphql = require('graphql');

const MessageType = new graphql.GraphQLObjectType({
  name: "Message",
  description: "This represent a Message",
  fields: () => ({
    username: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
    text: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)}
  })
});

module.exports = function(resolver) {
    return {
        type: new graphql.GraphQLList(MessageType),
        resolve: resolver
    };
}
