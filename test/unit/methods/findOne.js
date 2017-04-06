const test = require('tap').test
const server = require('../../server')
const findOneMethod = require('./../../../lib/methods/findOne').findOne
const sinon = require('sinon')
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

test('### FindOne with console.warn ###', sinon.test(function (t) {
  const logger = CONNECTOR.logger

  const getCollectionStub = this.stub(
    CONNECTOR.findByID,
    'apply',
    () => {}
  )

  CONNECTOR.logger = false

  findOneMethod.bind(CONNECTOR)()

  t.ok(getCollectionStub.calledOnce)
  CONNECTOR.logger = logger

  t.end()
}))

test('### FindOne with logger ###', sinon.test(function (t) {
  const getCollectionStub = this.stub(
    CONNECTOR.findByID,
    'apply',
    () => { }
  )

  const loggerStub = this.stub(CONNECTOR.logger,
    'warn',
    () => { }
  )

  findOneMethod.bind(CONNECTOR)()
  t.ok(getCollectionStub.calledOnce)
  t.ok(loggerStub.calledOnce)

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
