// Adapted from https://github.com/Polymer/polymer-cli
const {forkStream, PolymerProject, HtmlSplitter} = require('polymer-build')
const mergeStream = require('merge-stream')
const {Transform} = require('stream')
const {transform: babelTransform} = require('babel-core')
const babelPresetES2015 = require('babel-preset-es2015')
const babelOptions = {
  presets: [babelPresetES2015.buildPreset({}, {modules: false})]
}

class JSCompileTransform extends Transform {
  constructor () {
    super({objectMode: true})
  }
  _transform (file, _encoding, callback) {
    // console.error(file.path)
    // if (/index-browserify\.js$/.test(file.path)) return
    if (file.contents && /\.js$/.test(file.path)) {
      let contents = file.contents.toString()
      contents = babelTransform(contents, babelOptions).code
      file.contents = Buffer.from(contents)
    }
    callback(null, file)
  }
}

const entrypoint = process.argv[process.argv.length - 1]
const project = new PolymerProject({entrypoint})
const sourcesStream = forkStream(project.sources())
const depsStream = forkStream(project.dependencies())
const htmlSplitter = new HtmlSplitter()

mergeStream(sourcesStream, depsStream)
  .pipe(htmlSplitter.split())
  .pipe(new JSCompileTransform())
  .pipe(htmlSplitter.rejoin())
  .pipe(project.addCustomElementsEs5Adapter())
  .pipe(project.bundler({inlineScripts: false}))
  .on('data', file => {
    if (/\.html$/.test(file.path)) process.stdout.write(file.contents)
  })
