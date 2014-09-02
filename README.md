# Mobware MongoDB Connector

This is a Mobware connector to MongoDB.

To install:

```bash
$ mobware2 install appc.db.mongo --save
```

Use in your application:

```javascript
var MongoDB = require('appc.db.mongo'),
		connector = new MongoDB({
				url: 'mongodb://localhost/mobware'
		});
```

Now reference the connector in your model.

```javascript
var User = Mobware.createModel('user',{
		fields: {
				_id: {type:'string', required: true, primary: true},
				name: {type:'string', required: false, validator: /[a-zA-Z]{3,}/ }
		},
		connector: connector
});
```

If you want to map a specific model to a specific collection name, use metadata.  For example, to map the `user` model to the collection `users`, set it such as:

```javascript
var User = Mobware.createModel('user',{
		fields: {
				_id: {type:'string', required: true, primary: true},
				name: {type:'string', required: false, validator: /[a-zA-Z]{3,}/ }
		},
		connector: connector,
		metadata: {
				mongodb: {
						collection: 'users'
				}
		}
});
```
