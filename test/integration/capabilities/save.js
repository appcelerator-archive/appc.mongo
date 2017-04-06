var should = require('should');

exports.save = {
	insert: {
		name: 'Dawson Toth'
	},
	update: {
		name: 'Dawson R Toth'
	},
	check: function (result) {
		should(result.id).be.ok;
		should(result.name).equal('Dawson R Toth');
	}
};
