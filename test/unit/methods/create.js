const test = require('tap').test
const server = require('../../server')
const createMethod = require('./../../../lib/methods/create').create
const sinon = require('sinon')
const errorMessage = 'error'
const instance = {}
const result = {}
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
    .catch((errorMessage) => {
      t.threw(errorMessage)
    })
})

test('### Error - collection.insert method ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()

  const instanceStub = this.stub(
    Model,
    'instance',
    (values, falseValue) => {
      return {
        toPayload: () => {
          return true
        }
      }
    }
  )

  const getCollectionStub = this.stub(
    CONNECTOR,
    'getCollection',
    (Model) => {
      return {
        insert: (payload, cb) => {
          cb(errorMessage)
        }
      }
    }
  )

  createMethod.bind(CONNECTOR, Model, instance, cbSpy)()

  t.ok(cbSpy.calledOnce)
  t.ok(instanceStub.calledOnce)
  t.ok(getCollectionStub.calledOnce)
  t.ok(cbSpy.calledWith(errorMessage))

  t.end()
}))

test('### Response - collection.find method ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()

  const getCollectionStub = this.stub(
    CONNECTOR,
    'getCollection',
    (Model) => {
      return {
        insert: (payload, cb) => {
          cb(null, result)
        }
      }
    }
  )

  createMethod.bind(CONNECTOR, Model, instance, cbSpy)()

  t.ok(cbSpy.calledOnce)
  t.ok(getCollectionStub.calledOnce)

  t.end()
}))

test('### Response - create Instance From Result ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()

  result.ops = ['data']

  const createInstanceFromResultStub = this.stub(
    CONNECTOR,
    'createInstanceFromResult',
    (Model, resuls) => {
      return true
    }
  )

  const getCollectionStub = this.stub(
    CONNECTOR,
    'getCollection',
    (Model) => {
      return {
        insert: (payload, cb) => {
          cb(null, result)
        }
      }
    }
  )

  createMethod.bind(CONNECTOR, Model, instance, cbSpy)()

  t.ok(cbSpy.calledOnce)
  t.ok(createInstanceFromResultStub.calledOnce)
  t.ok(getCollectionStub.calledOnce)
  t.ok(cbSpy.calledWith(null, true))

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
