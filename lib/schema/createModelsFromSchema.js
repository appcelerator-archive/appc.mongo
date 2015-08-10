var Arrow = require('arrow'),
	_ = require('lodash');

/**
 * Creates models from your schema (see "fetchSchema" for more information on the schema).
 */
exports.createModelsFromSchema = function createModelsFromSchema() {
	var models = {},
		objects = this.schema.objects,
		objectsKeys = Object.keys(objects);
	for (var i = 0; i < objectsKeys.length; i++) {
		var modelName = objectsKeys[i];
		models[this.pkginfo.name + '/' + modelName] = Arrow.Model.extend(this.pkginfo.name + '/' + modelName, {
			name: this.pkginfo.name + '/' + modelName,
			autogen: !!this.config.modelAutogen,
			fields: objects[modelName].fields || {},
			connector: this,
			generated: true
		});
	}
	this.models = _.defaults(this.models || {}, models);
};
