const unirest = require('unirest');

module.exports = {
    register: function(username, password, cb) {
        unirest.post('http://localhost:8080/register')
                .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                .send({ username: username, password: password })
                .end(cb);
    },
    login: function(username, password, cb) {
        unirest.post('http://localhost:8080/login')
                .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                .send({ username: username, password: password })
                .end(cb);
    }
};
