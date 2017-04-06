const test = require('tap').test
const server = require('../../server')
const queryMethod = require('./../../../lib/methods/query').query
const sinon = require('sinon')
const errorMessage = 'error'
const options = {
  where: () => {},
  fields: () => {},
  order: 'data'
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
    .catch((errorMessage) => {
      t.threw(errorMessage)
    })
})

test('### Query collection cb error ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()
  const cursorStub = (cb) => {
    cb(errorMessage, {})
  }

  const cursorObj = {
    each: cursorStub
  }

  const translateQueryKeys = this.stub(
    CONNECTOR,
    'translateQueryKeys',
    (Model, options) => {
      return options
    }
  )

  const getCollectionStub = this.stub(
    CONNECTOR,
    'getCollection',
    (Model) => {
      return {
        find: (options, fields, obj, cb) => {
          cb(null, cursorObj)
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

  queryMethod.bind(CONNECTOR, Model, options, cbSpy)()

  t.ok(translateQueryKeys.calledOnce)
  t.ok(getCollectionStub.calledOnce)
  t.ok(createInstanceFromResultStub.calledOnce)

  t.end()
}))

test('### Query collection cb response  ###', sinon.test(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()
  const cursorStub = (cb) => {
    cb(errorMessage, null)
  }

  const cursorObj = {
    each: cursorStub
  }

  const translateQueryKeys = this.stub(
    CONNECTOR,
    'translateQueryKeys',
    (Model, options) => {
      return options
    }
  )

  const getCollectionStub = this.stub(
    CONNECTOR,
    'getCollection',
    (Model) => {
      return {
        find: (options, fields, obj, cb) => {
          cb(null, cursorObj)
        }
      }
    }
  )

  queryMethod.bind(CONNECTOR, Model, options, cbSpy)()

  t.ok(translateQueryKeys.calledOnce)
  t.ok(getCollectionStub.calledOnce)

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
