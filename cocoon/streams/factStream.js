const _ = require('highland');

const factStream = _();

factStream.resume();

module.exports = function(cb) {
    return factStream.each(cb);
};
