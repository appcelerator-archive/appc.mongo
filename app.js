/**
 * NOTE: This file is simply for testing this connector and will not
 * be used or packaged with the actual connector when published.
 */
var APIBuilder = require('appcelerator').apibuilder,
	server = new APIBuilder();

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