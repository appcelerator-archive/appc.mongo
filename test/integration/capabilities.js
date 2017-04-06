var should = require('should'),
	Arrow = require('arrow'),
	common = require('./common'),
	connector = common.connector;

describe('Connector Capabilities', Arrow.Connector.generateTests(connector, module));
