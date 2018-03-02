const graphql = require('graphql');
const globalState = require('../state/state.js');

const ShipType = require('../types/types.js').ShipType;

module.exports = {
    type: new graphql.GraphQLList(ShipType),
    resolve: function(root, args) {
        console.log('ROTOR', root, args);
        return globalState.get().ships || [];
    }
};
