const shipStore = require('./store/ship.js');
const bluebird = require('bluebird');

const insertShip = bluebird.promisify(function(args, cb) {
    shipStore.insert(args, function(err, newDoc) {
        if (newDoc) {
            newDoc.id = newDoc._id;
            delete newDoc._id;
        }
        cb(err, newDoc);
    });
});

module.exports = function resolve(root, args) {
    return insertShip(args);
};
