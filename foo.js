const graphql = require('graphql');

const schema = require('./schema')

graphql.graphql(schema, 'mutation { ship(name: "hello") { id } }').then(result => {

    const id = result.data.ship.id;

    graphql.graphql(schema, '{ ship(id: "' + id + '") { id } }').then(result => {
        console.log(result.data);
        graphql.graphql(schema, '{ ships { id, name } }').then(result => {

            console.log(result.data);
        });
    });
});
