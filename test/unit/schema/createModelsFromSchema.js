const test = require('tap').test
const server = require('./../../server')
const createModelsFromSchema = require('./../../../lib/schema/createModelsFromSchema').createModelsFromSchema
const sinon = require('sinon')
var ARROW
var CONNECTOR

test('### Start Arrow ###', function (t) {
  server()
    .then((inst) => {
      ARROW = inst
			CONNECTOR = ARROW.getConnector('appc.mongo')
      t.ok(ARROW, 'Arrow has been started')
      t.end()
    })
    .catch((err) => {
      t.threw(err)
    })
})

test('### createModelsFromSchema ###', sinon.test(function(t) {

	if(CONNECTOR.schema)
		const temp = CONNECTOR.schema
	
	CONNECTOR.schema = {objects: {test: "test"}}

	const createModelsFromSchemaSpy = sinon.spy(createModelsFromSchema)

	CONNECTOR.createModelsFromSchema();

	t.ok(createModelsFromSchemaSpy.returnValues)

	CONNECTOR.schema = temp
	t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
