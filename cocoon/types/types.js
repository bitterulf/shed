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
            return ships.filter(function(ship) { return ship.owner == root.username; });
        } }
    })
});

const PositionType = new graphql.GraphQLObjectType({
    name: 'Position',
    description: 'This represent a Position',
    fields: () => ({
        x: {type: new graphql.GraphQLNonNull(graphql.GraphQLInt)},
        y: {type: new graphql.GraphQLNonNull(graphql.GraphQLInt)}
    })
});

const shipSizeData = {
    'BIG': {
        value: 'BIG',
        speed: 7
    }
};

const ShipSize = new graphql.GraphQLEnumType({
  name: 'ShipSize',
  values: shipSizeData
});

const ShipType = new graphql.GraphQLObjectType({
    name: 'Ship',
    description: 'This represent a Ship',
    fields: () => ({
        id: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        name: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        owner: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        size: {
            type: ShipSize
        },
        speed: {type: new graphql.GraphQLNonNull(graphql.GraphQLInt), resolve: function(root, args) {
            if (shipSizeData[root.size]) {
                return shipSizeData[root.size].speed || 0;
            }
            return 0;
        }},
        sailCooldown: {type: new graphql.GraphQLNonNull(graphql.GraphQLInt)},
        user: {type: UserType, resolve: function(root, args){
            const user = globalState.get().users.find(function(user) {
                return user.username == root.owner;
            });
            return user;
        }},
        x: {type: new graphql.GraphQLNonNull(graphql.GraphQLInt)},
        y: {type: new graphql.GraphQLNonNull(graphql.GraphQLInt)},
        route: {type: new graphql.GraphQLList(PositionType)}
    })
});

const CrewManType = new graphql.GraphQLObjectType({
    name: 'CrewMan',
    description: 'This represent a Crew Man',
    fields: () => ({
        id: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        name: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        employer: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        location: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        type: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        user: {type: UserType, resolve: function(root, args){
            const user = globalState.get().users.find(function(user) {
                return user.username == root.employer;
            });
            return user;
        }},
        ship: {type: ShipType, resolve: function(root, args){
            const ship = globalState.get().ships.find(function(ship) {
                return ship.id == root.location;
            });
            return ship;
        }}
    })
});

module.exports = {
    UserType: UserType,
    ShipType: ShipType,
    CrewManType: CrewManType,
    shipSizeData: shipSizeData
};
