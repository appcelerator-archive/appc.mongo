const test = require('tap').test
const createPrimaryKeyQuery = require('./../../../lib/utility/createPrimaryKeyQuery').createPrimaryKeyQuery
const sinon = require('sinon')

test('### createPrimaryKeyQuery - Error case ###', function (t) {
  const primaryKeySpy = sinon.spy(createPrimaryKeyQuery)

  createPrimaryKeyQuery('')

  t.ok(primaryKeySpy.returnValues)
  t.equals(primaryKeySpy.returnValues.length, 0)

  t.end()
})
