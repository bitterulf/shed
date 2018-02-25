const graphql = require('graphql');

const ShipType = require('../types/ship.js');

module.exports = {
    type: ShipType,
    args: {
      name: {
        name: 'name',
        type: new graphql.GraphQLNonNull(graphql.GraphQLString)
     }
    },
    resolve: require('../resolver/createShip.js')
};
