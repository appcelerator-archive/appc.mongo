const test = require('tap').test
const server = require('./../../server')
const sinon = require('sinon')
const blueprint = require('Arrow')
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

test('### createModelsFromSchema ###', sinon.test(function (t) {
  if (CONNECTOR.schema) { var temp = CONNECTOR.schema }

  CONNECTOR.schema = { objects: { test: 'test' } }

  const extendModelSpy = sinon.spy(blueprint.Model, 'extend')

  CONNECTOR.createModelsFromSchema()

  t.ok(extendModelSpy.calledOnce)
  t.ok(CONNECTOR.models)

  CONNECTOR.schema = temp
  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
