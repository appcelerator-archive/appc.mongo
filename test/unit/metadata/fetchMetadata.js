const test = require('tap').test
const fetchMetadata = require('./../../../lib/metadata/fetchMetadata').fetchMetadata
const sinon = require('sinon')

test('### fetchMetadata ###', function (t) {
  const nextSpy = sinon.spy()

  fetchMetadata(nextSpy)

  t.ok(nextSpy.calledOnce)

  t.end()
})
