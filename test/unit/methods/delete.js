const test = require('tap').test
const server = require('../../server')
const deleteMethod = require('./../../../lib/methods/delete').delete
const sinon = require('sinon')
const sinonTest = require('sinon-test')
const testWrap = sinonTest(sinon)
const errorMessage = 'error'
const instance = {
  getPrimaryKey: () => { }
}
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

test('### Error collection.remove method - cb(err) ###', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()

  const getCollectionStub = this.stub(CONNECTOR, 'getCollection').callsFake((Model) => {
    return {
      remove: (query, cb) => {
        cb(errorMessage)
      }
    }
  })

  const createPrimaryKeyQueryStub = this.stub(CONNECTOR, 'createPrimaryKeyQuery').callsFake((instance) => {
    return true
  })

  deleteMethod.bind(CONNECTOR, Model, instance, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(createPrimaryKeyQueryStub.calledOnce)
  t.ok(cbSpy.calledOnce)

  t.end()
}))

test('### Response collection.remove method  ###', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()
  const removed = {}

  const getCollectionStub = this.stub(CONNECTOR, 'getCollection').callsFake((Model) => {
    return {
      remove: (query, cb) => {
        cb(null, removed)
      }
    }
  })

  deleteMethod.bind(CONNECTOR, Model, instance, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(cbSpy.calledOnce)

  t.end()
}))

test('### Error - instance ###', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()
  const results = 1

  const getCollectionStub = this.stub(CONNECTOR, 'getCollection').callsFake((Model) => {
    return {
      remove: (query, cb) => {
        cb(null, results)
      }
    }
  })

  deleteMethod.bind(CONNECTOR, Model, instance, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(cbSpy.calledOnce)

  t.end()
}))

test('### Error query ###', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()

  const getCollectionStub = this.stub(CONNECTOR, 'getCollection').callsFake((Model) => {
    return {
      remove: (query, cb) => {
        cb(errorMessage)
      }
    }
  })

  const createPrimaryKeyQueryStub = this.stub(CONNECTOR, 'createPrimaryKeyQuery').callsFake((instance) => {
    return false
  })

  deleteMethod.bind(CONNECTOR, Model, instance, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(createPrimaryKeyQueryStub.calledOnce)
  t.ok(cbSpy.calledOnce)

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
