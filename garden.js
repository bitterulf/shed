const rand = require('random-seed').create('this is my seed');

const _ = require('highland');

const newUserIntent = function(username) {
    return {
        type: 'NEW_USER',
        payload: username
    };
};

const newUserFact = function(username) {
    return {
        type: 'NEW_USER',
        payload: username
    };
};

const states = {
    factState: {}
};

const factStream = _();

factStream
    .scan({ users: [] }, function(state, action) {
        if (action.type == 'NEW_USER') {
            state.users.push(action.payload);
        }

        return state;
    })
    .each(function(state) {
        states.factState = state;
        console.log('factState', states);
    });

factStream.resume();

const intentStream = _();

intentStream
    .each(function(intent) {
        if (intent.type == 'NEW_USER') {
            if (states.factState.users.indexOf(intent.payload) == -1) {
                factStream.write(newUserFact(intent.payload));
            }
        }
    });

intentStream.resume();

intentStream.write(newUserIntent('bob'));
intentStream.write(newUserIntent('bob'));
intentStream.write(newUserIntent('bob'));

