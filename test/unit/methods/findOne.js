const test = require('tap').test
const server = require('../../server')
const findOneMethod = require('./../../../lib/methods/findOne').findOne
const sinon = require('sinon')
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

test('### FindOne with console.warn ###', testWrap(function (t) {
  const logger = CONNECTOR.logger

  const getCollectionStub = this.stub(CONNECTOR.findByID, 'apply').callsFake(() => {})

  CONNECTOR.logger = false

  findOneMethod.bind(CONNECTOR)()

  t.ok(getCollectionStub.calledOnce)
  CONNECTOR.logger = logger

  t.end()
}))

test('### FindOne with logger ###', testWrap(function (t) {
  const getCollectionStub = this.stub(CONNECTOR.findByID, 'apply').callsFake(() => { })

  const loggerStub = this.stub(CONNECTOR.logger, 'warn').callsFake(() => { })

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
