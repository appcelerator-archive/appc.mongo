const test = require('tap').test
const server = require('../../server')
const distinctMethod = require('./../../../lib/methods/distinct').distinct
const sinon = require('sinon')
const errorMessage = 'error'
const field = {}
const options = {
  where: {
  }
}
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

test('### Error - collection.distinct method ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  function cb (errorMessage, data) { }
  const cbSpy = this.spy(cb)

  const getCollectionStub = this.stub(
    CONNECTOR,
    'getCollection',
    (Model) => {
      return {
        distinct: (field, options, cb) => {
          cb(errorMessage)
        }
      }
    }
  )

  distinctMethod.bind(CONNECTOR, Model, field, options, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(cbSpy.calledOnce)

  t.end()
}))

test('### Response - collection distinct method ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  function cb (errorMessage, data) { }
  const cbSpy = this.spy(cb)
  const result = {}

  const getCollectionStub = this.stub(
    CONNECTOR,
    'getCollection',
    (Model) => {
      return {
        distinct: (field, options, cb) => {
          cb(null, result)
        }
      }
    }
  )

  distinctMethod.bind(CONNECTOR, Model, field, options, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(cbSpy.calledOnce)

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
