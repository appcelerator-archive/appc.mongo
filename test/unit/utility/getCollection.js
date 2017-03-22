const test = require('tap').test
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

test('### getCollection ###', sinon.test(function (t) {
  const model = {
    name: 'post',
    getMeta: (modelName) => {
      return 'post'
    }
  }

  if (CONNECTOR.db && CONNECTOR.db.collection) { var dbCollection = CONNECTOR.db.collection }

  CONNECTOR.db = {
    collection: (name, modelName) => {
      return name
    }
  }

  const formatCollectionNameStub = sinon.stub(
    CONNECTOR,
    'formatCollectionName',
    (model) => {
      return model
    }
  )

  const collection = CONNECTOR.getCollection(model)

  t.ok(collection)
  t.equals(collection, 'post')

  formatCollectionNameStub.restore()
  CONNECTOR.db = dbCollection

  t.end()
}))

test('### getCollection ###', sinon.test(function (t) {
  const model = {
    name: 'post',
    getMeta: (modelName) => {
      return false
    }
  }

  if (CONNECTOR.db && CONNECTOR.db.collection) { var dbCollection = CONNECTOR.db.collection }

  CONNECTOR.db = {
    collection: (name, modelName) => {
      return name
    }
  }

  const formatCollectionNameStub = sinon.stub(
    CONNECTOR,
    'formatCollectionName',
    (model) => {
      return model
    }
  )

  const collection = CONNECTOR.getCollection(model)

  t.ok(collection)
  t.equals(collection, 'post')

  formatCollectionNameStub.restore()
  CONNECTOR.db = dbCollection

  t.end()
}))

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
