var should = require('should'),
	MongoDB = require('mongodb'),
	MongoClient = MongoDB.MongoClient;

// Create a test collection.
var mongoURL = require('../conf/default').connectors['appc.mongo'].url;
MongoClient.connect(mongoURL, function didConnect(err, db) {
	if (err) {
		return console.error(err);
	}
	db.collection('super_post').insert([
		{Hello: 'world!', Foo: 2},
		{Hello: 'sun!', Foo: 5},
		{divergentDocument: true},
		{Hello: 'sky!', Foo: 7},
		{Hello: 'Earth!', Foo: 1},
		{Hello: 'birds!', Foo: 3},
		{How: 'are you today?!', Foo: 3}
	], function (err) {
		if (err) {
			return console.error(err);
		}
	});
});

var Arrow = require('arrow'),
	server = new Arrow();
exports.Arrow = Arrow;
exports.server = server;
exports.connector = server.getConnector('appc.mongo');

before(function before(next) {
	server.start(function () {
		next();
	});
});

after(function after(next) {
	server.stop(next);
});
