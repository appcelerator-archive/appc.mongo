const test = require('tap').test
const server = require('./../../server')
const fetchSchema = require('./../../../lib/schema/fetchSchema').fetchSchema
const sinon = require('sinon')
var ARROW
var CONNECTOR

const fetchSchemaSpy = sinon.spy(fetchSchema)
const cbSpy = sinon.spy();

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

test('### fetchSchema ### - No DB case', function(t) {

	if(CONNECTOR.db)
		const temp = CONNECTOR.db
	
	CONNECTOR.fetchSchema(cbSpy)

	t.ok(cbSpy.calledOnce)

	CONNECTOR.db = temp

	t.end()
})

test('### fetchSchema ###', function (t) {
	
	
	
	
	
	
	t.end()
})

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})