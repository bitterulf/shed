const graphql = require('graphql');

const ShipType = new graphql.GraphQLObjectType({
  name: "Ship",
  description: "This represent a Ship",
  fields: () => ({
    id: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
    name: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)}
  })
});

module.exports = ShipType;
