const test = require('tap').test
const server = require('../../server')
const countMethod = require('./../../../lib/methods/count').count
var lodash = require('lodash')
const sinon = require('sinon')
const sinonTest = require('sinon-test')
const testWrap = sinonTest(sinon)
const options = { where: {} }
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

test('### Error - collection.find method ###', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()

  const lodashValuesStub = this.stub(lodash, 'isFunction').callsFake((options) => {
    return ['Some Title', 'Some Content']
  })

  const translateQueryKeysStub = this.stub(CONNECTOR, 'translateQueryKeys').callsFake((Model, options) => {
    return true
  })

  const calculateQueryParamsStub = this.stub(CONNECTOR, 'calculateQueryParams').callsFake((options) => {
    return true
  })

  const getCollectionStub = this.stub(CONNECTOR, 'getCollection').callsFake((Model) => {
    return {
      find: (options, cb) => {
        cb(errorMessage)
      }
    }
  })

  countMethod.bind(CONNECTOR, Model, options, cbSpy)()

  t.ok(lodashValuesStub.calledOnce)
  t.ok(getCollectionStub.calledOnce)
  t.ok(translateQueryKeysStub.calledOnce)
  t.ok(calculateQueryParamsStub.calledOnce)
  t.ok(cbSpy.calledOnce)

  t.end()
}))

test('### Response - collection find method ###', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()
  const result = {
    count: () => {}
  }

  const getCollectionStub = this.stub(CONNECTOR, 'getCollection').callsFake((Model) => {
    return {
      find: (options, cb) => {
        cb(null, result)
      }
    }
  })

  countMethod.bind(CONNECTOR, Model, cbSpy)()

  t.ok(getCollectionStub.calledOnce)

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
