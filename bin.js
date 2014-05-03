
var subarg = require('subarg')
  , path = require('path')
  , fs = require('fs')
  , raw = process.argv

if (raw[0] === 'node') raw.shift()
raw.shift()

var argv = subarg(raw)

if (!argv._.length) {
  console.log('Need a file')
  process.exit(1)
}

if (argv.p && !Array.isArray(argv.p)) {
  argv.p = [argv.p]
}

var output = argv.o
  , Watcher = require('./')

  , lpath = ['./'].concat(argv.p || [])
  , basefile = path.resolve(argv._[0])
  , basedir = path.dirname(basefile)
  , mapfile = argv.o + '.map'

new Watcher(basefile, {
  filename: argv.o,
  watch: true,
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

