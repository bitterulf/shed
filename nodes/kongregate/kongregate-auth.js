const unirest = require('unirest');

module.exports = function(RED) {
    function KongregateAuthNode(config) {
        RED.nodes.createNode(this,config);
        var apiKey = this.credentials['api-key'];
        var node = this;
        node.on('input', function(msg) {
            unirest.post('https://api.kongregate.com/api/authenticate.json')
                .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
                .send({
                    "api_key": apiKey,
                    "user_id": msg.payload.user_id,
                    "game_auth_token": msg.payload.game_auth_token
                })
                .end(function (response) {
                    if (response.status === 200) {
                        if (response.body.success) {
                            msg.payload = response.body;
                            node.send([ msg ]);
                        }
                        else {
                            msg.payload = new Error('something is wrong');
                            node.send([ null, msg ]);
                        }
                    }
                    else {
                        msg.payload = new Error('something is wrong');
                        node.send([ null, msg ]);
                    }
                });
        });
    }
    RED.nodes.registerType("kongregate-auth", KongregateAuthNode, {
		credentials: {
			"api-key": {type: "text"},
		}
	});
}
