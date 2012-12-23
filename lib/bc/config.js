var yml = require('js-yaml')
    ,fs = require('fs')
    ,path = require('path')
    ,_ = require('underscore')
    ,root_dir = path.join(__dirname, '..', '..')
    ,cfg_dir = root_dir + '/config'
    ,file_re = /^([a-z0-9_]+)\.ya?ml$/i;

var Cfg = {
    paths: {
        root: root_dir
        ,config: cfg_dir
        ,lib: root_dir + '/lib'
        ,content: root_dir + '/content'
        ,www: root_dir + '/public'
        ,template: root_dir + '/template'
    }
};

// Load all config files
fs.readdirSync(cfg_dir)
  .forEach(function(file){
    var matches = file_re.exec(file);

    if (matches) {
        Cfg[matches[1]] = Cfg[matches[1]] || {};
        _.extend(Cfg[matches[1]], require(cfg_dir+'/'+file));
    }
  });

exports.Cfg = Cfg;