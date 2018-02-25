const graphql = require('graphql');

const ShipType = require('../types/ship.js');

module.exports = {
    type: ShipType,
    args: {
      id: {
        name: 'id',
        type: new graphql.GraphQLNonNull(graphql.GraphQLString)
     }
    },
    resolve: require('../resolver/ship.js')
};
