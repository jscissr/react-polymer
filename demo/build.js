'use strict'

var browserify = require('browserify')
// var watchify = require('watchify')
var babelify = require('babelify').configure({presets: ['es2015', 'react']})
var fs = require('fs')
var path = require('path')
var vulcanize = require('vulcanize')

// ===== browserify =====

var client = browserify({cache: {}, packageCache: {}, fullPaths: false, debug: true})
// watchify(client)

client.on('log', function (msg) { console.log(msg) })
client.on('error', function (e) { console.error(e) })

client.add(path.join(__dirname, 'index-source.js'))

client.transform(babelify)

function update () {
  var writer = fs.createWriteStream(path.join(__dirname, 'index-browserify.js'))
  client.bundle()
    .pipe(writer)
  writer.on('finish', function () {
    console.log('done browserify')
  })
}
// client.on('update', update)
update()

// ===== vulcanize =====

function onError (err) {
  if (err) {
    console.error(err + '\n' + err.stack)
    throw err
  }
}

function doVulcanize () {
  process.chdir(__dirname)
  vulcanize.setOptions({})
  vulcanize.process('index-source.html', function (err, inlinedHtml) {
    onError(err)
    fs.writeFile(path.join(__dirname, 'index.html'), inlinedHtml, function (err) {
      onError(err)
      console.log('done vulcanize')
    })
  })
}
doVulcanize()

process.stdin.on('data', function () {
  update()
  doVulcanize()
})
