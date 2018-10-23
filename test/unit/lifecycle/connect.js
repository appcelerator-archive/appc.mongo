const test = require('tap').test
const connect = require('./../../../lib/lifecycle/connect').connect
const server = require('./../../server')
const sinon = require('sinon')
const MongoClient = require('mongodb').MongoClient
const sinonTest = require('sinon-test')
const testWrap = sinonTest(sinon)

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

test('### connect - Success case ###', testWrap(function (t) {
  const mongoData = 'Success'
  function func () { }
  const cbSpy = sinon.spy(func)
  const MongoClientStub = sinon.stub(MongoClient, 'connect').callsFake((url, cb) => {
    cb(null, mongoData)
  })

  connect.apply(CONNECTOR, [cbSpy])

  t.ok(cbSpy.calledOnce)
  t.equals(CONNECTOR.db, mongoData)

  // cbSpy.restore()
  MongoClientStub.restore()

  t.end()
}))

test('### connect - Error case ###', testWrap(function (t) {
  const errMessage = new Error()
  function func () { }
  const cbSpy = sinon.spy(func)
  const MongoClientStub = sinon.stub(MongoClient, 'connect').callsFake((url, cb) => {
    cb(errMessage)
  })

  connect.apply(CONNECTOR, [cbSpy])

  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(errMessage))

  // cbSpy.restore()
  MongoClientStub.restore()

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
