
var fs = require('fs')
  , path = require('path')
  , less = require('less')
  , through = require('through')
  , mdeps = require('module-deps')
  , chokidar = require('chokidar');

module.exports = Watcher

function Watcher(basefile, options) {
  this.basefile = path.resolve(basefile)
  this.options = options
}

Watcher.prototype = {
  run: function () {
    this.time = Date.now()
    process.stdout.write('Compiling...')
    // console.log('goind', this.basefile)
    getLessNodes(this.basefile, this.regenerate.bind(this))
  },
  regenerate: function (lessData) {
    if (!lessData) {
      return console.warn('No .less files found')
    }
    new(less.Parser)(this.options.less).parse(lessData, function (err, tree) {
      if (err) {
        throw err;
      } 
      var filenames = getLessImports(tree)
      if (this.options.watch) {
        if (!this.watcher) {
          this.watcher = chokidar.watch(filenames, {persistent: true});
          this.watcher.on('change', this.run.bind(this))
        }
        this.watcher.add(filenames);
      }

      try {
        var css = tree.toCSS(this.options.toCSS);
        if (this.options.filename) {
          this.options.stream = fs.createWriteStream(this.options.filename);
        }
        this.options.stream.end(css);
        this.options.stream.on('finish', function () {
          var delta = parseInt((Date.now() - this.time)/10)/100
            , kb = parseInt(css.length / 10.24)/100
          console.log('done. Took ' + delta + 's, wrote ' + kb + 'kb. Watching ' + filenames.length + ' files')
        }.bind(this))
      } catch(e) {
        throw(e);
      }
    }.bind(this));
  }
}

function getLessNodes(basefile, done) {
  var found = {}
    , lessData = ''
  mdeps(basefile).pipe(through(function (data) {
    var file = data.id
      , ext = path.extname(file)
      , lesspath = file.slice(0, -ext.length) + '.less'
    if (found[lesspath]) return
    found[lesspath] = true
    if (['.js', '.jsx'].indexOf(ext) !== -1 && fs.existsSync(lesspath)) {
      lessData += '@import "' + lesspath + '";\n';
    }
  }, function end() {
    done(lessData)
  }))
}

function getLessImports(tree) {
  // traverse the parse tree and find all LESS filenames in this set
  var allImports = {}
    , rules = tree.rules.slice(0);

  while (rules.length > 0) {
    var rule = rules.pop();
    if (rule.root && rule.root.rules && rule.root.rules.length > 0) {
      rules = rules.concat(rule.root.rules);
    }

    if (rule.importedFilename) {
      allImports[rule.importedFilename] = true;
    }
  }

  return Object.keys(allImports).map(function(fn) {
    return path.resolve(fn);
  });
}

