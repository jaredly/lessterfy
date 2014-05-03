
var subarg = require('subarg')
  , path = require('path')
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

new Watcher(basefile, {
  filename: argv.o,
  watch: true,
  less: {
    path: lpath,
  },
  toCSS: {
    sourceMap: true,
    outputSourceFiles: true,
    sourceMapFilename: 'party.css.map',
    sourceMapOutputFilename: 'party.css.map',
    sourceMapRootpath: path.basename(basedir),
    sourceMapBasepath: basedir
  }
}).run()

