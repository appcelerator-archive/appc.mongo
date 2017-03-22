const test = require('tap').test
const server = require('./../../server')
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

test('### createInstanceFromResult ###', function (t) {
  var key

  const post = {
    _id: '1',
    title: 'testTitle',
    content: 'testContent'
  }

  const Model = ARROW.getModel('Posts')

  const instance = CONNECTOR.createInstanceFromResult(Model, post)

  t.ok(instance)
  for (key in post) {
    t.equals(post[key], instance[key])
  }

  t.end()
})

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
