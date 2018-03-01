const graphql = require('graphql');
const globalState = require('../state/state.js');

const UserType = require('../types/types.js').UserType;

module.exports = {
    type: new graphql.GraphQLList(UserType),
    resolve: function(root, args) {
        return globalState.get().users || [];
    }
};
