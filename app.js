var APIBuilder = require('appcelerator').apibuilder,
	server = new APIBuilder();

//--------------------- implement authorization ---------------------//

// fetch our configured apikey
var apikey = server.get('apikey');
server.logger.info('APIKey is:', apikey);
server.authorization = function APIKeyAuthorization(req, resp, next) {
	if (!apikey) {
		return next();
	}
	if (req.headers['apikey']) {
		var key = req.headers['apikey'];
		if (key == apikey) {
			return next();
		}
	}
	resp.status(401);
	return resp.json({
		id: "com.appcelerator.api.unauthorized",
		message: "Unauthorized",
		url: ""
	});
};

var User = APIBuilder.Model.extend('user', {
	fields: {
		name: { type: String, required: false, validator: /[a-zA-Z]{3,}/ }
	},
	connector: 'appc.mongo',
	metadata: {
		'appc.mongo': {
			collection: 'users'
		}
	}
});
server.addModel(User);

server.start();