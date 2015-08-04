/**
 * Returns a new instance from a MongoDB query result.
 */
exports.createInstanceFromResult = function createInstanceFromResult(Model, result) {
	var instance = Model.instance(result, true);
	instance.setPrimaryKey(String(result._id));
	return instance;
};
	