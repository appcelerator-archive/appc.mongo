const test = require('tap').test
const server = require('../server')
const sinon = require('sinon')
const index = require('../../lib/index').create
const semver = require('semver')
const sinonTest = require('sinon-test')
const testWrap = sinonTest(sinon)
var ARROW
var CONNECTOR

test('### Start Arrow ###', function (t) {
  server()
    .then((inst) => {
      ARROW = inst
      CONNECTOR = ARROW.getConnector('appc.mongo')
      ARROW.Connector = CONNECTOR
      ARROW.Connector.Capabilities = {}

      t.ok(ARROW, 'Arrow has been started')
      t.end()
    })
    .catch((err) => {
      t.threw(err)
    })
})

test('### Test Index.js Error Case ###', testWrap(function (t) {
  const semverLtStub = sinon.stub(semver, 'lt').callsFake(function (actualVersion, desiredVersion) {
    return true
  })

  t.throws(index.bind(CONNECTOR, ARROW),
    'This connector requires at least version 1.2.53 of Arrow please run `appc use latest`.')

  t.ok(semverLtStub.calledOnce)
  semverLtStub.restore()
  t.end()
}))

test('### Test Index.js Valid case ###', testWrap(function (t) {
  const semverLtStub = sinon.stub(semver, 'lt').callsFake(function (actualVersion, desiredVersion) {
    return false
  })

  const extendSpy = sinon.spy(CONNECTOR, 'extend')

  index.bind(CONNECTOR, ARROW)()

  t.ok(semverLtStub.calledOnce)
  t.ok(extendSpy.calledOnce)
  semverLtStub.restore()
  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
