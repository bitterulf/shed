const graphql = require('graphql');
const globalState = require('../state/state.js');

const UserType = new graphql.GraphQLObjectType({
    name: 'User',
    description: 'This represent a User',
    fields: () => ({
        id: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        username: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        ships: {type: new graphql.GraphQLList(ShipType), resolve: function(root, args) {
            const ships = globalState.get().ships || [];
            return ships.filter(function(ship) { return ship.owner == root.id; });
        } }
    })
});

const ShipType = new graphql.GraphQLObjectType({
    name: 'Ship',
    description: 'This represent a Ship',
    fields: () => ({
        id: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        owner: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        type: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        user: {type: UserType, resolve: function(root, args){
            const user = globalState.get().users.find(function(user) {
                return user.id == root.owner;
            });
            return user;
        }}
    })
});

module.exports = {
    UserType: UserType,
    ShipType: ShipType
};