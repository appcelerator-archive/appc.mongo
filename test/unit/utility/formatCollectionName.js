const test = require('tap').test
const formatCollectionName = require('./../../../lib/utility/formatCollectionName').formatCollectionName

test('### formatCollectionName ###', function (t) {
  const collectionName = 'name'

  const name = formatCollectionName(collectionName)

  t.ok(name)
  t.equals(name, 'name')

  t.end()
})

test('### formatCollectionName ###', function (t) {
  const collectionName = 'name/test'

  const name = formatCollectionName(collectionName)

  t.ok(name)
  t.equals(name, 'test')

  t.end()
})
