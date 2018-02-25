const graphql = require('graphql');
const unirest = require('unirest');
const cheerio = require('cheerio');
const bluebird = require('bluebird');


const fetchClubs = bluebird.promisify(function (cb) {
    unirest.get('https://de.wikipedia.org/wiki/Fu%C3%9Fball-Bundesliga')
    .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
    .end(function (response) {
        const clubs = [];

        const $ = cheerio.load(response.body);
        $('table').each(function(i, elem) {
            if ($(this).find('caption').length) {
                const caption = $(this).find('caption').text();
                if (caption.indexOf('Bundesligavereine') > -1) {
                    console.log($(this).find('caption').text());
                    $(this).find('tr').each(function(i, elem) {
                        $(this).find('a').each(function(i, elem) {
                            const link = $(elem).attr('href');
                            if (link.indexOf('#') != 0  && link.indexOf('/Datei:') < 0 &&  link.indexOf('/wiki/') == 0) {
                                clubs.push({ name: link.replace('/wiki/', '') });
                            }
                        });
                    });
                }
            }
        });

        cb(null, clubs);
    });
});

const fetchTrainer = bluebird.promisify(function (url, cb) {
    unirest.get(url)
    .end(function (response) {
        const Trainer = {};

        const $ = cheerio.load(response.body);
        $('b').each(function(i, elem) {
            if ($(this).text().indexOf('Trainer') > -1) {
                const link = $(this).parent().parent().find('a').attr('href');
                if (link && link.replace) {
                    Trainer.name = link.replace('/wiki/', '');
                }
            }
        });

        cb(null, Trainer);
    });
});

fetchTrainer('https://de.wikipedia.org/wiki/RB_Leipzig').then(function(result) {
    console.log(result);
});

const AuthorType = new graphql.GraphQLObjectType({
  name: "Author",
  description: "This represent an author",
  fields: () => ({
    id: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
    name: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
    twitterHandle: {type: graphql.GraphQLString}
  })
});

const PostType = new graphql.GraphQLObjectType({
  name: "Post",
  description: "This represent a Post",
  fields: () => ({
    id: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
    title: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
    body: {type: graphql.GraphQLString},
    author: {
      type: AuthorType,
      resolve: function(post) {
          console.log('posti', post);
        return {id: post.author , name: 'name', twitterHandle: 'twitter'};
      }
    }
  })
});

const TrainerType = new graphql.GraphQLObjectType({
  name: "Trainer",
  description: "This represent a Trainer",
  fields: () => ({
    name: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)}
  })
});

const ClubType = new graphql.GraphQLObjectType({
  name: "Club",
  description: "This represent a Club",
  fields: () => ({
    name: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)},
    trainer: {
        type: TrainerType,
      resolve: function(club) {
          const link = 'https://de.wikipedia.org/wiki/' + club.name;
          return fetchTrainer(link);
          console.log('clublink', link);
        return {name: 'fritz'};
      }
    }
  })
});

const InsertResultType = new graphql.GraphQLObjectType({
  name: "InsertResult",
  description: "This represent a InsertResult",
  fields: () => ({
    status: {type: new graphql.GraphQLNonNull(graphql.GraphQLString)}
  })
});

var schema = new graphql.GraphQLSchema({
  mutation: new graphql.GraphQLObjectType({
      name: 'RootMutationType',
      fields: {
        posting: {
            type: InsertResultType,
            args: {
              text: {
                name: 'text',
                type: new graphql.GraphQLNonNull(graphql.GraphQLString)
             }
            },
            resolve(root, args) {
                return { status: args.text + ' was inserted and mutated!' };
            }
        }
      }
  }),
  query: new graphql.GraphQLObjectType({
    name: 'RootQueryType',
    fields: {

        posts: {
            type: new graphql.GraphQLList(PostType),
            args: {
              itemId: {
                name: 'itemId',
                type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
             }
            },
            resolve(root, args) {

                return [{
                    id: args.itemId,
                    title: 'title',
                    body: 'whatever',
                    author: 'authorId'
                }];
            }
        },

        clubs: {
            type: new graphql.GraphQLList(ClubType),
            resolve(root, args) {
                return fetchClubs();
            }
        }
    }
  })
});

var query2 = '{ posts(itemId:1) { id, author { id, name } } }';
var query = '{ clubs { name, trainer { name } } }';
var query3 = '{ posting(text: "lol") { status } }';
var query4 = 'mutation { posting(text: "lol") { status } }';

graphql.graphql(schema, query4).then(result => {

    console.log(result);

});
