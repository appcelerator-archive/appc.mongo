var should = require('should');

exports.create = {
	insert: {
		name: 'Jon Alter'
	},
	check: function (result) {
		should(result.id).be.ok;
		should(result.name).be.ok;
	}
};
