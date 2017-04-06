const test = require('tap').test
const server = require('../../server')
const findAndModifyMethod = require('./../../../lib/methods/findAndModify').findAndModify
const sinon = require('sinon')
const errorMessage = 'error'
const findOptions = {
  order: {
    test: 'test'
  },
  where: () => { }
}
const args = () => {}
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

test('### Error collection.findAndModify - cb(err) ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()

  const getCollectionStub = this.stub(
    CONNECTOR,
    'getCollection',
    (Model) => {
      return {
        findAndModify: (options, order, doc, args, cb) => {
          cb(errorMessage)
        }
      }
    }
  )

  const translateQueryKeysStub = this.stub(
    CONNECTOR,
    'translateQueryKeys',
    (Model, options) => {
      return options
    }
  )

  const calculateQueryParamsStub = this.stub(
    CONNECTOR,
    'calculateQueryParams',
    (options) => {
      return options
    }
  )

  findAndModifyMethod.bind(CONNECTOR, Model, findOptions, {}, args, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(translateQueryKeysStub.calledOnce)
  t.ok(calculateQueryParamsStub.calledOnce)

  t.end()
}))

test('### Response collection.findAndModify ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()
  const record = {
  }

  const getCollectionStub = this.stub(
    CONNECTOR,
    'getCollection',
    (Model) => {
      return {
        findAndModify: (options, order, doc, args, cb) => {
          cb(null, record)
        }
      }
    }
  )

  const translateQueryKeysStub = this.stub(
    CONNECTOR,
    'translateQueryKeys',
    (Model, options) => {
      return options
    }
  )

  const calculateQueryParamsStub = this.stub(
    CONNECTOR,
    'calculateQueryParams',
    (options) => {
      return options
    }
  )

  findAndModifyMethod.bind(CONNECTOR, Model, findOptions, {}, {}, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(translateQueryKeysStub.calledOnce)
  t.ok(calculateQueryParamsStub.calledOnce)

  t.end()
}))

test('### createInstanceFromResult - response findAndModify method ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()
  const record = {
    value: 'Test'
  }

  const getCollectionStub = this.stub(
    CONNECTOR,
    'getCollection',
    (Model) => {
      return {
        findAndModify: (options, order, doc, args, cb) => {
          cb(null, record)
        }
      }
    }
  )

  const createInstanceFromResultStub = this.stub(
    CONNECTOR,
    'createInstanceFromResult',
    (Model, value) => {
      return record
    }
  )

  findAndModifyMethod.bind(CONNECTOR, Model, findOptions, {}, {}, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(createInstanceFromResultStub.calledOnce)

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
