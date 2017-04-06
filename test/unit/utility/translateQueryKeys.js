const test = require('tap').test
const server = require('./../../server')
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

test('### translateQueryKeys ###', sinon.test(function (t) {
  const model = ARROW.getModel('Posts')

  const options = {
    sel: {},
    unsel: {},
    where: {},
    order: {}
  }

  const modelSpy = sinon.spy(model, 'translateKeysForPayload')

  CONNECTOR.translateQueryKeys(model, options)

  t.equals(modelSpy.callCount, 4)

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
