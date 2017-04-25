var path = require('path'),
	should = require('should'),
	Arrow = require('arrow'),
	MongoDB = require('mongodb'),
	MongoClient = MongoDB.MongoClient;

// Create a test collection.
var config = new (Arrow.Loader)(path.resolve(__dirname + '/../../')),
	mongoURL = config.connectors['appc.mongo'].url;

var server = new Arrow();
exports.mongoURL = mongoURL;
exports.Arrow = Arrow;
exports.server = server;
exports.connector = server.getConnector('appc.mongo');

before(function before(next) {
	this.timeout(30000);
	server.start(next);
});

after(function after(next) {
	server.stop(next);
});
