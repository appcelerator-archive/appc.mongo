var Arrow = require('arrow');

exports.model = Arrow.Model.extend('testUser', {
	fields: {
		name: {type: String, required: false, validator: /[a-zA-Z]{3,}/}
	},
	connector: 'appc.mongo',
	metadata: {
		'appc.mongo': {
			collection: 'users'
		}
	}
});
