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
                    state.ships.push({id: shipId, type: 'big', owner: action.userId});
                    state.crew.push({id: shortid(), type: 'sailor', employer: action.userId, location: shipId});
                }
            }

            return state;
        }),
        _.each(cb)
    );
};
