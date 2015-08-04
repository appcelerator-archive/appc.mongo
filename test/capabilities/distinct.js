var should = require('should');

exports.distinct = {
	insert: [
		{name: 'Rick Blalock'},
		{name: 'Jeff Haynie'},
		{name: 'Jeff Haynie'},
		{name: 'Jeff Haynie'},
		{name: 'Jeff Haynie'},
		{name: 'Jeff Haynie'},
		{name: 'Chris Barber'},
		{name: 'Chris Barber'},
		{name: 'Chris Barber'},
		{name: 'Chris Barber'},
		{name: 'Nolan Wright'}
	],
	distinct: 'name',
	check: function (results) {
		should(results.length).equal(4);
		should(results).containEql('Rick Blalock');
		should(results).containEql('Jeff Haynie');
		should(results).containEql('Chris Barber');
		should(results).containEql('Nolan Wright');
	}
};
