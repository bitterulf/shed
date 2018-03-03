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
                console.log('connected with', action.username);
                if (!state.users.find(function(user) { return user.username  == action.username })) {
                    state.users.push({
                        username: action.username
                    });
                    const shipId = shortid();
                    state.ships.push({id: shipId, name: 'Santa Maria', size: 'BIG', sailCooldown: 0, owner: action.username, x: 0, y: 0, route: [] });
                    state.crew.push({id: shortid(), name: 'Heinrich', type: 'sailor', employer: action.username, location: shipId});
                }
            }
            else if (action.type == 'navigate') {
                const ship  = state.ships.find(function(ship) {
                    return ship.owner == action.username && ship.id == action.ship;
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
