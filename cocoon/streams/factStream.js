const _ = require('highland');

module.exports = function(cb) {

    return _.pipeline(
        _.scan({ messages: [],  users: [{id: 'U1', username: 'bob'}], ships: [{id: 'S1', type: 'big', owner: 'U1'}, {id: 'S2', type: 'big', owner: 'U2'}] }, function(state, action) {
            if (action.type == 'message') {
                state.messages.push({
                    username: action.username,
                    text: action.payload
                });
            }

            return state;
        }),
        _.each(cb)
    );
};
