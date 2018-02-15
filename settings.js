module.exports = {
    // the tcp port that the Node-RED web server is listening on
    uiPort: process.env.PORT || 1880,

    mqttReconnectTime: 15000,

    serialReconnectTime: 15000,

    debugMaxLength: 1000,

    flowFile: 'flows.json',

    flowFilePretty: true,

    // By default, all user data is stored in the Node-RED install directory. To
    // use a different location, the following property can be used
    userDir: './node-red/',

    nodesDir: './nodes',

    httpNodeCors: {
        origin: "*",
        methods: "GET,PUT,POST,DELETE"
    },

    httpNodeMiddleware: function(req,res,next) {
        next();
    },

    functionGlobalContext: {
        os:require('os')
    },

    logging: {
        console: {
            level: "info",
            metrics: false,
            audit: false
        }
    }
}
