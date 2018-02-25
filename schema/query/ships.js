const graphql = require('graphql');

const ShipType = require('../types/ship.js');

module.exports = {
    type: new graphql.GraphQLList(ShipType),
    resolve: require('../resolver/ships.js')
};
