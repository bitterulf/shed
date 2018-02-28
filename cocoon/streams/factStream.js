const _ = require('highland');

module.exports = function(cb) {

    return _.pipeline(
        _.scan({ messages: [] }, function(state, action) {
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
