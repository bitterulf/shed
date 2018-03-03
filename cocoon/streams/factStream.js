const _ = require('highland');
const shortid = require('shortid').generate;

module.exports = function(cb) {

    return _.pipeline(
        _.scan({ messages: [],  users: [], ships: [], crew: [] }, function(state, action) {
            if (action.type == 'message') {
                state.messages.push({
                    username: action.username,
                    text: action.payload
                });
            }
            else if (action.type == 'connected') {
                if (!state.users.find(function(user) { return user.id  == action.userId })) {
                    state.users.push({
                        username: action.username,
                        id: action.userId
                    });
                    const shipId = shortid();
                    state.ships.push({id: shipId, size: 'BIG', owner: action.userId, x: 0, y: 0, route: [] });
                    state.crew.push({id: shortid(), type: 'sailor', employer: action.userId, location: shipId});
                }
            }
            else if (action.type == 'navigate') {
                const ship  = state.ships.find(function(ship) {
                    return ship.owner == action.userId && ship.id == action.ship;
                });

                if (ship) {
                    ship.route.push({x: action.x, y: action.y});
                }
            }

            return state;
        }),
        _.each(cb)
    );
};
