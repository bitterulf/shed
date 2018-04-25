const graphql = require('graphql');
const bluebird = require('bluebird');
const xray = require('x-ray')();

// npm install -g @2fd/graphdoc
// graphdoc -s ./exampleSchema.js -o ./doc/schema

const fetchWikipediaNews = bluebird.promisify(function(cb) {
    xray('https://de.wikipedia.org/wiki/Wikipedia:Hauptseite', {
      items: xray('#hauptseite-nachrichten ul li', [{
        link: 'a@href'
      }])
    })(function(err, obj) {
        cb(null, {links: obj.items});
    })
});

const LinkType = new graphql.GraphQLObjectType({
    name: 'Link',
    description: 'This represent a Link',
    fields: () => ({
        link: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)}
    })
});

const LinkListType = new graphql.GraphQLObjectType({
    name: 'LinkList',
    description: 'This represent a link list',
    fields: () => ({
        links: {
            type: new graphql.GraphQLList(LinkType)
        }
    })
});

const WikiQuery = {
    type: LinkListType,
    resolve: function(root, args) {
        return fetchWikipediaNews();
    }
};

const persons = [
    {name: 'Jim', id: 'p1', friends: ['p2', 'p3'] },
    {name: 'Joe', id: 'p2', friends: ['p1'] },
    {name: 'Bob', id: 'p3', friends: ['p1', 'p2'] }
];

const PersonType = new graphql.GraphQLObjectType({
    name: 'Person',
    description: 'This represent a Person',
    fields: () => ({
        id: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        name: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
        friends: {type: new graphql.GraphQLList(PersonType), resolve: function(root, args) {

            return root.friends.map(function(friendId) {
                return persons.find(function(person) {
                    return person.id == friendId;
                });
            })
            return [{id: 'foo', name: 'bar'}];
        } }
    })
});

const PersonsQuery = {
    type: new graphql.GraphQLList(PersonType),
    resolve: function(root, args) {
        return persons;
    }
};

const MutationResponseType = new graphql.GraphQLObjectType({
    name: 'MutationResponse',
    description: 'This represent a MutationResponse',
    fields: () => ({
        status: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
    })
});

const addPersonMutation = {
    type: MutationResponseType,
    args: {
        name: {
            name: 'name',
            type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
        id: {
            name: 'id',
            type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        },
        friends: {
            name: 'friends',
            type: new graphql.GraphQLNonNull(graphql.GraphQLList(graphql.GraphQLString))
        }
    },
    resolve: function(root, args) {
        console.log(args);
        let missingFriends = 0;

        args.friends.forEach(function(friendId) {
            const friendExists = persons.find(function(person) {
                return person.id === friendId;
            });
            if (!friendExists) {
                missingFriends++;
            }
        });

        if (missingFriends) {
            return {status: 'unknown friends'};
        }

        persons.push(args)
        return {status: 'person added'};
    }
};

const schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
            persons: PersonsQuery,
            wiki: WikiQuery,
        }
    }),
    mutation: new graphql.GraphQLObjectType({
        name: 'RootMutationType',
        fields: {
            addPerson: addPersonMutation
        }
    }),
});

module.exports = schema;
