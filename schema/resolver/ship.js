const shipStore = require('./store/ship.js');
const bluebird = require('bluebird');

const fetchShip = bluebird.promisify(function(id, cb) {
    shipStore.findOne({_id: id}, function(err, doc) {
        if (doc) {
            doc.id = doc._id;
            delete doc._id;
        }

        cb(err, doc);
    });
});

module.exports = function resolve(root, args) {
    return fetchShip(args.id);
};
