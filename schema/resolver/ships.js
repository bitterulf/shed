const shipStore = require('./store/ship.js');
const bluebird = require('bluebird');

const fetchAllShips = bluebird.promisify(function(cb) {
    shipStore.find({}, function(err, docs) {
        if (docs) {
            docs = docs.map(function(doc) {
                doc.id = doc._id;
                delete doc._id;
                return doc;
            });
        }

        cb(err, docs);
    });
});

module.exports = function resolve(root, args) {
    return fetchAllShips();
};
