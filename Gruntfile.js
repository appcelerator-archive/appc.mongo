module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    mochaTest: {
      test: {
        src: ['test/integration/**/*.js'],
        options: {
          timeout: 30000
        }
      }
    }
  })

  grunt.registerTask('createTestData', function () {
    var done = this.async()
    var config = require('./conf/local').connectors['appc.mongo']
    var mongoURL = config.url
    var MongoDB = require('mongodb')
    var MongoClient = MongoDB.MongoClient
    MongoClient.connect(mongoURL, function didConnect (err, db) {
      if (err) {
        return console.error(err)
      }
      db.collection('super_post').insert([
        { Hello: 'world!', Foo: 2 },
        { Hello: 'sun!', Foo: 5 },
        { divergentDocument: true },
        { Hello: 'sky!', Foo: 7 },
        { Hello: 'Earth!', Foo: 1 },
        { Hello: 'birds!', Foo: 3 },
        { How: 'are you today?!', Foo: 3 }
      ])
      db.close(done)
    })
  })

  grunt.registerTask('cleanTestData', function () {
    var done = this.async()
    var config = require('./conf/local').connectors['appc.mongo']
    var mongoURL = config.url
    var MongoDB = require('mongodb')
    var MongoClient = MongoDB.MongoClient
    MongoClient.connect(mongoURL, function didConnect (err, db) {
      if (err) {
        return console.error(err)
      }
      // Let's drop the database
      db.dropDatabase(function (err) {
        if (err) {
          return console.error(err)
        }
        db.close(done)
      })
    })
  })

  // Load grunt plugins for modules.
  grunt.loadNpmTasks('grunt-mocha-test')

  grunt.registerTask('default', ['createTestData', 'mochaTest', 'cleanTestData'])
}
