/*
 Welcome to the MongoDB connector!
 */
var _ = require('lodash'),
	semver = require('semver');

/**
 * Creates the MongoDB connector for Arrow.
 */
exports.create = function (Arrow) {
	if (semver.lt(Arrow.Version || '0.0.1', '1.2.53')) {
		throw new Error('This connector requires at least version 1.2.53 of Arrow; please run `appc use latest`.');
	}
	var Connector = Arrow.Connector,
		Capabilities = Connector.Capabilities;

	return Connector.extend({
		filename: module.filename,
		capabilities: [
			Capabilities.ConnectsToADataSource,
			Capabilities.ValidatesConfiguration,
			//Capabilities.ContainsModels,
			Capabilities.GeneratesModels,
			Capabilities.CanCreate,
			Capabilities.CanRetrieve,
			Capabilities.CanUpdate,
			Capabilities.CanDelete,
			//Capabilities.AuthenticatesThroughConnector
		],
		
		// Looks through a query "where" for $like and $notLike values that can be translated to $regex strings. 
		translateWhereRegex: true
	});
};
