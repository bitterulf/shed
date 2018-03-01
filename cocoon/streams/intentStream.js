const _ = require('highland');

const intentStream = _();

intentStream.resume();

module.exports = function() {
    return _.pipeline(
        _.filter(function(intent) {
            return intent.type == 'message' && intent.username;
        })
    );
};
