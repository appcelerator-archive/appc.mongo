const test = require('tap').test
const calculateQueryParams = require('./../../../lib/utility/calculateQueryParams').calculateQueryParams
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

test('### calculateQueryParams - options.sel ###', function (t) {
  var item

  const PKStub = sinon.stub(CONNECTOR, 'createPrimaryKeyQuery').callsFake((id) => {
    return id
  })

  const options = {
    sel: {
      test: 'test',
      test2: 'test',
      test3: 'test'
    },
    where: {
      id: 1
    },
    unsel: {
      test: 'test'
    },
    order: {
      'test': 'test',
      'test2': 'test2'
    }
  }

  const returnedOptions = calculateQueryParams.call(CONNECTOR, options)
  const selected = returnedOptions.fields
  const optionWhere = returnedOptions.where

  t.ok(selected)

  for (item in selected) {
    if (item === 'test') { t.equals(selected[item], false) } else { t.equals(selected[item], true) }
  }

  t.ok(optionWhere)
  t.equals(optionWhere, 1)

  PKStub.restore()

  t.end()
})

test('### Stop Arrow ###', function (t) {
  ARROW.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
