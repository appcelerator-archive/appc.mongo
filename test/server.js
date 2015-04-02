var assert = require('assert'),
	should = require('should'),
	request = require('request'),
	common = require('./common'),
	server = common.server;

describe('Server', function () {

	var auth = {
			user: server.config.apikey,
			password: ''
		},
		base = 'http://127.0.0.1:' + server.port + '/api';

	it('API-237: should return 201 when POST/Creating a record', function (next) {
		request({
			method: 'POST',
			uri: base + '/appc.mongo/super_post',
			auth: auth,
			body: {
				Hello: 'you! ' + Date.now(),
				Foo: 2
			},
			json: true
		}, function (err, response, body) {
			assert.ifError(err);
			should(response.statusCode).equal(201);
			should(response.headers.location).be.ok;
			should(body).be.not.ok;
			next();
		});
	});

	it('API-237: should return 404 when GET/Querying without results', function (next) {
		request({
			method: 'GET',
			uri: base + '/appc.mongo/super_post/query',
			auth: auth,
			qs: {
				where: {
					Hello: 'some invalid value for the field that exists no where'
				},
				skip: 10000,
				limit: 1
			}
		}, function (err, response, body) {
			assert.ifError(err);
			should(response.statusCode).equal(404);
			should(body).be.ok;
			body = JSON.parse(body);
			should(body).have.property('success', false);
			should(body).have.property('code', 404);
			should(body).have.property('message', "Not Found");
			next();
		});
	});

	it('API-374: should not return 404 when deleting all', function (next) {
		request({
			method: 'DELETE',
			uri: base + '/appc.mongo/super_post',
			auth: auth
		}, function (err, response, body) {
			assert.ifError(err);
			should(response.statusCode).equal(204);
			next();
		});
	});

});