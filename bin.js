
var subarg = require('subarg')
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
  , basefile = argv._[0]

new Watcher(basefile, {
  filename: argv.o,
  watch: true,
  less: {
    path: lpath
  }
}).run()

