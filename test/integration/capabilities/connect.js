var common = require('../common');

exports.connect = {
	goodConfig: {
		url: common.mongoURL
	},
	badConfig: {
		url: 'mongodb://255.255.255.255/arrow'
	}
};
