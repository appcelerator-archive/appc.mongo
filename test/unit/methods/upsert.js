const test = require('tap').test
const server = require('../../server')
const upsertMethod = require('./../../../lib/methods/upsert').upsert
const sinon = require('sinon')
const sinonTest = require('sinon-test')
const testWrap = sinonTest(sinon)
const errorMessage = 'error'
const objParams = {}
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

test('### collection.findAndModify error response ###', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()

  const getCollectionStub = this.stub(CONNECTOR, 'getCollection').callsFake((Model) => {
    return {
      findAndModify: (query, obj, document, objParams, cb) => {
        cb(errorMessage)
      }
    }
  })

  upsertMethod.bind(CONNECTOR, Model, 'id', {}, cbSpy)()

  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(errorMessage))
  t.ok(getCollectionStub.calledOnce)

  t.end()
}))

test('### collection.findAndModify response ###', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()
  const options = {}
  const results = {
    value: () => {}
  }

  const getCollectionStub = this.stub(CONNECTOR, 'getCollection').callsFake((Model) => {
    return {
      findAndModify: (query, obj, document, objParams, cb) => {
        cb(null, results)
      }
    }
  })

  const createInstanceFromResultStub = this.stub(CONNECTOR, 'createInstanceFromResult').callsFake((Model, results) => {
    return options
  })

  upsertMethod.bind(CONNECTOR, Model, 'id', objParams, cbSpy)()

  t.ok(cbSpy.calledOnce)
  t.ok(createInstanceFromResultStub.calledOnce)
  t.ok(getCollectionStub.calledOnce)

  t.end()
}))

test('### collection.insert error response ###', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()

  const getCollectionStub = this.stub(CONNECTOR, 'getCollection').callsFake((Model) => {
    return {
      insert: (document, cb) => {
        cb(errorMessage)
      }
    }
  })

  upsertMethod.bind(CONNECTOR, Model, undefined, {}, cbSpy)()

  t.ok(getCollectionStub.calledOnce)

  t.end()
}))

test('### collection.insert response ###', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()
  const options = {}
  const results = {
  }
  results.ops = 'dsad'

  const getCollectionStub = this.stub(CONNECTOR, 'getCollection').callsFake((Model) => {
    return {
      insert: (document, cb) => {
        cb(null, options)
      }
    }
  })

  upsertMethod.bind(CONNECTOR, Model, undefined, {}, cbSpy)()

  t.ok(cbSpy.calledOnce)
  t.ok(getCollectionStub.calledOnce)

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
