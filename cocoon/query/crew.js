const graphql = require('graphql');
const globalState = require('../state/state.js');

const CrewManType = require('../types/types.js').CrewManType;

module.exports = {
    type: new graphql.GraphQLList(CrewManType),
    resolve: function(root, args) {

        return globalState.get().crew.filter(function(crewMan) {
            return crewMan.employer == root.username;
        });
    }
};
