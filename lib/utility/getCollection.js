/**
 * Returns the collection based on the Model name or metadata configuration.
 */
exports.getCollection = function getCollection(Model) {
	var name = this.formatCollectionName(Model.getMeta('collection') || Model.name),
		collection = this.db.collection(name, name);
	// Note: strict mode doesn't allow accessing the collections this way; it requires callbacks.
	return collection;
};
