var should = require('should');

exports.query = {
	insert: [
		{name: 'Rick Blalock'},
		{name: 'Jeff Haynie'},
		{name: 'Chris Barber'},
		{name: 'Ingo Muschenetz'},
		{name: 'Nolan Wright'}
	],
	query: [
		{
			where: {name: {$like: 'Chris%'}},
			sel: {name: 1},
			order: {name: 1}
		},
		{
			where: {name: {$like: 'Chris%'}},
			order: {name: '1'}
		},
		{
			name: 'Chris Barber'
		},
		{
			where: {name: 'Chris Barber'},
			unsel: {id: 1}
		}
	],
	check: function (results) {
		should(results.length).be.above(0);
		should(results[0].name).equal('Chris Barber');
	}
};
