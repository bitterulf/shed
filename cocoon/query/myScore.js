const graphql = require('graphql');
const globalState = require('../state/state.js');

const ScoreType = new graphql.GraphQLObjectType({
    name: 'Score',
    description: 'This represent a Score',
    fields: () => ({
        username: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        ships: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)}
    })
});

module.exports = {
    type: ScoreType,
    resolve: function(root, args) {
        const user = globalState.get().users.find(function(user) {
            return user.username = root.username;
        });

        if (!user) {
            return {}
        }

        const myShips = globalState.get().ships.filter(function(ship) {
            return ship.owner == user.username;
        });

        return { username: root.username, ships: myShips.length };
    }
};
