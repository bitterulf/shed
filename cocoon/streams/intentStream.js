const _ = require('highland');

const intentStream = _();

intentStream.resume();

module.exports = function() {
    return _.pipeline(
        _.filter(function(intent) {
            if (intent.type == 'message') {
                return intent.username;
            }
            else if (intent.type == 'connected') {
                return intent.username;
            }
            else if (intent.type == 'navigate') {
                return intent.username && intent.ship && intent.x && intent.y;
            }
            else if (intent.type == 'tick') {
                return intent.payload;
            }
            return false;
        })
    );
};
