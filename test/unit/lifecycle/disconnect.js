const test = require('tap').test
const disconnect = require('./../../../lib/lifecycle/disconnect').disconnect
const server = require('./../../server')
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

test('### disconnect ###', function (t) {
  function func (opt) { }
  const cbSpy = sinon.spy(func)

  CONNECTOR.db = {
    close: (next) => {
      return next()
    }
  }

  disconnect.apply(CONNECTOR, [cbSpy])

  t.ok(cbSpy.calledOnce)

  t.end()
})

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
