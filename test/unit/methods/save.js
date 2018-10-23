const test = require('tap').test
const server = require('../../server')
const saveMethod = require('./../../../lib/methods/save').save
const sinon = require('sinon')
const sinonTest = require('sinon-test')
const testWrap = sinonTest(sinon)
const instance = {
  getPrimaryKey: () => {
    return 'id'
  },
  toPayload: () => {
    return 'record'
  }
}
const errorMessage = 'error'
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

test('### collection.update error response ###', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()

  const getCollectionStub = this.stub(CONNECTOR, 'getCollection').callsFake((Model) => {
    return {
      update: (query, record, cb) => {
        cb(errorMessage)
      }
    }
  })

  const createPrimaryKeyQueryStub = this.stub(CONNECTOR, 'createPrimaryKeyQuery').callsFake((instance) => {
    return instance
  })

  saveMethod.bind(CONNECTOR, Model, instance, cbSpy)()

  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(errorMessage))
  t.ok(getCollectionStub.calledOnce)
  t.ok(createPrimaryKeyQueryStub.calledOnce)

  t.end()
}))

test('### collection.update response ###', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()

  const getCollectionStub = this.stub(CONNECTOR, 'getCollection').callsFake((Model) => {
    return {
      update: (query, record, cb) => {
        cb(null, instance)
      }
    }
  })

  const createPrimaryKeyQueryStub = this.stub(CONNECTOR, 'createPrimaryKeyQuery').callsFake((instance) => {
    return instance
  })
  saveMethod.bind(CONNECTOR, Model, instance, cbSpy)()

  t.ok(cbSpy.calledOnce)
  t.ok(getCollectionStub.calledOnce)
  t.ok(createPrimaryKeyQueryStub.calledOnce)

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
