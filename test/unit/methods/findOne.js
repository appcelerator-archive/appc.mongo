const test = require('tap').test
const server = require('../../server')
const findOneMethod = require('./../../../lib/methods/findOne').findOne
const sinon = require('sinon')
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

test('### FindOne with console.warn ###', sinon.test(function (t) {

  const logger = CONNECTOR.logger

  const getCollectionStub = this.stub(
    CONNECTOR.findByID,
    'apply',
    (arguments) => { }
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
    (arguments) => { }
  )
  
  const loggerStub = this.stub(CONNECTOR.logger,
    'warn',
    (CONNECTOR) => { }
  )

  findOneMethod.bind(CONNECTOR)()
  t.ok(loggerStub.calledOnce)

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
