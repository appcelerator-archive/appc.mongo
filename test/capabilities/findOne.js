var should = require('should');

exports.findOne = {
	insert: {
		name: 'Jeff Haynie'
	},
	check: function (result) {
		should(result.id).be.ok;
		should(result.name).equal('Jeff Haynie');
	}
};
