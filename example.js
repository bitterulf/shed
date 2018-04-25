const graphql = require('graphql');
const util = require('util');
const schema = require('./exampleSchema.js');

graphql.graphql(schema, 'mutation { addPerson(name: "stuart", id: "p4", friends: ["p1"]) { status } }').then(result => {

    console.log(util.inspect(result, false, null));

    graphql.graphql(schema, '{ persons { name, friends { name } } }').then(result => {

        console.log(util.inspect(result, false, null));

        graphql.graphql(schema, '{ wiki { links { link } } }').then(result => {

            console.log(util.inspect(result, false, null));
        });
    });
});
