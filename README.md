# Mobware MongoDB Connector

This is a APIBuilder connector to MongoDB.

> This software is pre-release and not yet ready for usage.  Please don't use this just yet while we're working through testing and finishing it up. Once it's ready, we'll make an announcement about it.

To install:

```bash
$ appc install appc.mongo --save
```

Use in your application:

```javascript
var MongoDB = require('appc.mongo'),
		connector = new MongoDB({
				url: 'mongodb://localhost/mobware'
		});
```

Now reference the connector in your model.

```javascript
var User = APIBuilder.createModel('user',{
		fields: {
				_id: { type: String, required: true, primary: true},
				name: { type: String, required: false, validator: /[a-zA-Z]{3,}/ }
		},
		connector: connector
});
```

If you want to map a specific model to a specific collection name, use metadata.  For example, to map the `user` model to the collection `users`, set it such as:

```javascript
var User = APIBuilder.createModel('user',{
		fields: {
				_id: { type: String, required: true, primary: true},
				name: { type: String, required: false, validator: /[a-zA-Z]{3,}/ }
		},
		connector: connector,
		metadata: {
				'appc.mongodb': {
						collection: 'users'
				}
		}
});
```

# License

This source code is licensed as part of the Appcelerator Enterprise Platform and subject to the End User License Agreement and Enterprise License and Ordering Agreement. Copyright (c) 2014 by Appcelerator, Inc. All Rights Reserved. This source code is Proprietary and Confidential to Appcelerator, Inc.
