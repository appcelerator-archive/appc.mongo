var should = require('should'),
	Arrow = require('arrow'),
	common = require('./common'),
	server = common.server,
	connector = server.getConnector('appc.mongo');

describe('Connector Capabilities', Arrow.Connector.generateTests(connector, module));
