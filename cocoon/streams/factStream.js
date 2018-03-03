const _ = require('highland');
const shortid = require('shortid').generate;
const shipSizeData = require('../types/types.js').shipSizeData;

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
                    state.ships.push({id: shipId, size: 'BIG', sailCooldown: 0, owner: action.userId, x: 0, y: 0, route: [] });
                    state.crew.push({id: shortid(), type: 'sailor', employer: action.userId, location: shipId});
                }
            }
            else if (action.type == 'navigate') {
                const ship  = state.ships.find(function(ship) {
                    return ship.owner == action.userId && ship.id == action.ship;
                });

                if (ship) {
                    if (ship.route.length == 0) {
                        ship.route.push({x: action.x, y: action.y});
                        ship.sailCooldown = 100;
                    }
                    else {
                        ship.route.push({x: action.x, y: action.y});
                    }
                }
            }
            else if (action.type == 'tick') {
                state.ships.forEach(function(ship) {
                    const shipSize = shipSizeData[ship.size];
                    if (shipSize) {
                        if (ship.route.length) {
                            const tickTime = action.payload * shipSize.speed;
                            ship.sailCooldown -= tickTime;
                            if (ship.sailCooldown <= 0) {
                                ship.sailCooldown = 0;
                                const newPos = ship.route.shift();
                                ship.x = newPos.x;
                                ship.y = newPos.y;
                            }
                        }
                    }
                });
            }

            return state;
        }),
        _.each(cb)
    );
};
