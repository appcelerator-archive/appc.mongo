const test = require('tap').test
const server = require('../../server')
const findAllMethod = require('./../../../lib/methods/findAll').findAll
const sinon = require('sinon')
const sinonTest = require('sinon-test')
const testWrap = sinonTest(sinon)
const errMessage = 'error'
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

test('### findAll collection error response ###', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()

  const getCollectionStub = this.stub(CONNECTOR, 'getCollection').callsFake((Model) => {
    return {
      find: () => {
        return {
          limit: (arg) => {
            return {
              toArray: (cb) => {
                cb(errMessage)
              }
            }
          }
        }
      }
    }
  })

  findAllMethod.bind(CONNECTOR, Model, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(cbSpy.calledOnce)

  t.end()
}))

test('### findAll collection response ###', testWrap(function (t) {
  const Model = ARROW.getModel('Posts')
  const cbSpy = this.spy()
  const results = {}

  const getCollectionStub = this.stub(CONNECTOR, 'getCollection').callsFake((Model) => {
    return {
      find: () => {
        return {
          limit: (arg) => {
            return {
              toArray: (cb) => {
                cb(null, results)
              }
            }
          }
        }
      }
    }
  })

  findAllMethod.bind(CONNECTOR, Model, cbSpy)()

  t.ok(getCollectionStub.calledOnce)
  t.ok(cbSpy.calledOnce)

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
