const rand = require('random-seed').create('this is my seed');

const _ = require('highland');

const mainStream = _();

setInterval(function() {
    mainStream.write({
        type: 'increaseMoney',
        payload: rand.intBetween(1, 5)
    });
}, 1000);

mainStream
    .scan({ money: 0 }, function(state, action) {
        if (action.type == 'increaseMoney') {
            state.money += action.payload;
        }

        return state;
    })
    .each(console.log);

mainStream.resume();
