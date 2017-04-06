const test = require('tap').test
const server = require('../../server')
const findByIDMethod = require('./../../../lib/methods/findByID').findByID
const sinon = require('sinon')
const errorMessage = 'error'
const value = 'data'
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

test('### Collection findOne error - cb(err) ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()

  const getCollectionStub = this.stub(
    CONNECTOR,
    'getCollection',
    (Model) => {
      return {
        findOne: (query, obj, cb) => {
          cb(errorMessage)
        }
      }
    }
  )

  const createPrimaryKeyQueryStub = this.stub(
    CONNECTOR,
    'createPrimaryKeyQuery',
    (value) => {
      return {}
    }
  )

  findByIDMethod.bind(CONNECTOR, Model, value, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.ok(createPrimaryKeyQueryStub.calledOnce)

  t.end()
}))

test('### Response collection.findOne ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()
  const doc = {}

  const getCollectionStub = this.stub(
    CONNECTOR,
    'getCollection',
    (Model) => {
      return {
        findOne: (query, obj, cb) => {
          cb(null, doc)
        }
      }
    }
  )

  findByIDMethod.bind(CONNECTOR, Model, {}, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(cbSpy.calledOnce)

  t.end()
}))

test('### createPrimaryKeyQuery  response ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()

  const getCollectionStub = this.stub(
    CONNECTOR,
    'getCollection',
    (Model) => {
      return {
        findOne: (query, obj, cb) => {
          cb()
        }
      }
    }
  )

  const createPrimaryKeyQueryStub = this.stub(
    CONNECTOR,
    'createPrimaryKeyQuery',
    (value) => {
      return {}
    }
  )

  findByIDMethod.bind(CONNECTOR, Model, value, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.ok(createPrimaryKeyQueryStub.calledOnce)

  t.end()
}))

test('### Cb() - doc param ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()

  const getCollectionStub = this.stub(
    CONNECTOR,
    'getCollection',
    (Model) => {
      return {
        findOne: (query, obj, cb) => {
          cb()
        }
      }
    }
  )

  findByIDMethod.bind(CONNECTOR, Model, value, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(cbSpy.calledOnce)

  t.end()
}))

test('### createInstanceFromResult response ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()
  const instance = {}
  const getCollectionStub = this.stub(
    CONNECTOR,
    'getCollection',
    (Model) => {
      return {
        findOne: (query, obj, cb) => {
          cb(null, instance)
        }
      }
    }
  )

  const createInstanceFromResultStub = this.stub(
    CONNECTOR,
    'createInstanceFromResult',
    (Model, doc) => {
      return {}
    }
  )

  const createPrimaryKeyQueryStub = this.stub(
    CONNECTOR,
    'createPrimaryKeyQuery',
    (value) => {
      return {}
    }
  )

  findByIDMethod.bind(CONNECTOR, Model, value, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(cbSpy.calledOnce)
  t.ok(createPrimaryKeyQueryStub.calledOnce)
  t.ok(createInstanceFromResultStub.calledOnce)

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
