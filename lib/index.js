/*
 Welcome to the MongoDB connector!
 */
var _ = require('lodash');

/**
 * Creates the MongoDB connector for Arrow.
 */
exports.create = function (Arrow) {
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
