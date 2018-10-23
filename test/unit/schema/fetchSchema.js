const test = require('tap').test
const fetchSchema = require('./../../../lib/schema/fetchSchema').fetchSchema
const server = require('./../../server')
const sinon = require('sinon')
const sinonTest = require('sinon-test')
const testWrap = sinonTest(sinon)
const async = require('async')
var ARROW
var CONNECTOR

const cbSpy = sinon.spy()
const nextSpy = sinon.spy()
const errMessage = new Error()

const results = [
  {
    ID: '1',
    name: 'testName',
    age: 20
  }
]

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

test('### fetchSchema - No DB case ###', function (t) {
  if (CONNECTOR.db) { var temp = CONNECTOR.db }
  CONNECTOR.db = undefined

  fetchSchema(nextSpy)

  t.ok(nextSpy.calledOnce)

  CONNECTOR.db = temp

  nextSpy.resetHistory()

  t.end()
})

test('### fetchSchema - Error case ###', testWrap(function (t) {
  const collections = [{
    collectionName: 'col',
    find: () => {
      return {
        sort: (arg) => {
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
    }
  }]

  const asyncStub = this.stub(async, 'each').callsFake((collections, forEachCB, callback) => {
    forEachCB(collections[0], cbSpy)
  })

  if (CONNECTOR.db && CONNECTOR.db.collections) { var temp = CONNECTOR.db.collections }

  CONNECTOR.db = {
    collections: (cb) => {
      cb(null, collections)
    }
  }

  fetchSchema.apply(CONNECTOR, cbSpy)

  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(errMessage))
  t.ok(asyncStub.calledOnce)

  CONNECTOR.db.collections = temp
  cbSpy.resetHistory()
  asyncStub.restore()

  t.end()
}))

test('### fetchSchema - Schema Error case ###', testWrap(function (t) {
  const collections = [{
    collectionName: 'col',
    find: () => {
      return {
        sort: (arg) => {
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
    }
  }]

  const asyncStub = this.stub(async, 'each').callsFake((collections, forEachCB, callback) => {
    callback(errMessage)
  })

  if (CONNECTOR.db && CONNECTOR.db.collections) { var temp = CONNECTOR.db.collections }

  CONNECTOR.db = {
    collections: (cb) => {
      cb(null, collections)
    }
  }

  fetchSchema.apply(CONNECTOR, [nextSpy])

  t.ok(nextSpy.calledOnce)
  t.ok(nextSpy.calledWith(errMessage))
  t.ok(asyncStub.calledOnce)

  CONNECTOR.db.collections = temp
  nextSpy.resetHistory()
  asyncStub.restore()

  t.end()
}))

test('### fetchSchema - Callback Success case ###', testWrap(function (t) {
  const collections = [{
    collectionName: 'col',
    find: () => {
      return {
        sort: (arg) => {
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
    }
  }]

  const asyncStub = this.stub(async, 'each').callsFake((collections, forEachCB, callback) => {
    callback()
  })

  if (CONNECTOR.db && CONNECTOR.db.collections) { var temp = CONNECTOR.db.collections }

  CONNECTOR.db = {
    collections: (cb) => {
      cb(null, collections)
    }
  }

  fetchSchema.apply(CONNECTOR, [nextSpy])

  t.ok(nextSpy.calledOnce)
  t.ok(asyncStub.calledOnce)

  CONNECTOR.db.collections = temp
  nextSpy.resetHistory()
  asyncStub.restore()

  t.end()
}))

test('### fetchSchema - Success case ###', testWrap(function (t) {
  const collections = [{
    collectionName: 'col',
    find: () => {
      return {
        sort: (arg) => {
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
    }
  }]

  const asyncStub = this.stub(async, 'each').callsFake((collections, forEachCB, callback) => {
    forEachCB(collections[0], cbSpy)
  })

  if (CONNECTOR.db && CONNECTOR.db.collections) { var temp = CONNECTOR.db.collections }

  CONNECTOR.db = {
    collections: (cb) => {
      cb(null, collections)
    }
  }

  fetchSchema.apply(CONNECTOR, [nextSpy])

  t.ok(cbSpy.calledOnce)
  t.ok(asyncStub.calledOnce)

  CONNECTOR.db.collections = temp
  nextSpy.resetHistory()
  asyncStub.restore()

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
