#!/usr/bin/env node

var subarg = require('subarg')
  , path = require('path')
  , fs = require('fs')
  , raw = process.argv

if (raw[0] === 'node') raw.shift()
raw.shift()

var argv = subarg(raw)

if (argv._.length !== 2) {
  console.log('   Lessterfy! Collect and compile .less files accompanying a browserify-based app')
  console.log('')
  console.log('Usage: lessterfy input.js output.css [options]')
  console.log('')
  console.log('Options:')
  console.log('')
  console.log("      --once, -n   : don't watch. Just run once.")
  console.log('      -p <path>    : Add to the less import path. Can be used multiple times')
  console.log('      -t transform : Add a transformer. Can be used multiple times')
  console.log('')
  process.exit(1)
}

if (argv.p && !Array.isArray(argv.p)) {
  argv.p = [argv.p]
}

var input = argv._[0]
  , output = argv._[1]
  , Watcher = require('./')

  , lpath = ['./'].concat(argv.p || [])
  , basefile = path.resolve(input)
  , basedir = path.dirname(basefile)
  , mapfile = output + '.map'

  , once = argv.once || argv.n

new Watcher(basefile, {
  filename: output,
  transform: argv.t || null,
  watch: !once,
  less: {
    path: lpath,
  },
  toCSS: {
    sourceMap: true,
    outputSourceFiles: true,
    sourceMapFilename: path.basename(mapfile),
    sourceMapOutputFilename: path.basename(mapfile),
    writeSourceMap: function (output) {
      fs.writeFileSync(mapfile, output, 'utf8')
    },
    // sourceMapRootpath: path.basename(basedir),
    sourceMapBasepath: basedir
  }
}).run()

