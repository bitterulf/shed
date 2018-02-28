const _ = require('highland');

const intentStream = _();

intentStream.resume();

module.exports = function(cb) {
    return _.pipeline(
        _.filter(function(intent) {
            return intent.type == 'message' && intent.username;
        }),
        _.each(cb)
    );
};
