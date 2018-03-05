const domready = require('domready');

const App = {
    view: function() {
        return m('div', [
            m('h1', {class: 'title'}, 'App'),
        ])
    }
};

domready(function () {
    m.request({
        method: 'GET',
        url: '/data.json'
    })
    .then(function(result) {
        console.log(result);
        m.mount(document.body, App);
    })
})
