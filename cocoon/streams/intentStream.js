const _ = require('highland');

const intentStream = _();

intentStream.resume();

module.exports = function(cb) {
    return intentStream.each(cb);
};
