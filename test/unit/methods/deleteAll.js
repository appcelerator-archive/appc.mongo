const test = require('tap').test
const server = require('../../server')
const deleteAllMethod = require('./../../../lib/methods/deleteAll').deleteAll
const sinon = require('sinon')
const errorMessage = 'error'
var ARROW
var CONNECTOR

test('### Start Arrow ###', function (t) {
  server()
    .then((inst) => {
      ARROW = inst
      CONNECTOR = ARROW.getConnector('appc.mongo')
      t.ok(ARROW, 'Arrow has been started')
      t.end()
    })
    .catch((err) => {
      t.threw(err)
    })
})

test('### Error collection.remove method - cb(err) ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()

  const getCollectionStub = this.stub(
    CONNECTOR,
    'getCollection',
    (Model) => {
      return {
        remove: (query, paramList, cb) => {
          cb(errorMessage)
        }
      }
    }
  )

  deleteAllMethod.bind(CONNECTOR, Model, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(cbSpy.calledOnce)

  t.end()
}))

test('### Response collection.remove  ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()
  const count = {}

  const getCollectionStub = this.stub(
    CONNECTOR,
    'getCollection',
    (Model) => {
      return {
        remove: (query, paramList, cb) => {
          cb(null, count)
        }
      }
    }
  )

  deleteAllMethod.bind(CONNECTOR, Model, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(cbSpy.calledOnce)

  t.end()
}))

test('### Error cb(err) - removed value ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()
  const count = 0

  const getCollectionStub = this.stub(
    CONNECTOR,
    'getCollection',
    (Model) => {
      return {
        remove: (query, paramList, cb) => {
          cb(null, count)
        }
      }
    }
  )

  deleteAllMethod.bind(CONNECTOR, Model, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(cbSpy.calledOnce)

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
