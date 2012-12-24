var yml = require('js-yaml')
    ,fs = require('fs')
    ,Path = require('path')
    ,_ = require('underscore')
    ,root_dir = Path.join(__dirname, '..', '..')
    ,cfg_dir = root_dir + '/config'
    ,file_re = /^([a-z0-9_]+)(\.dev)?\.ya?ml$/i;

var Cfg = {
    paths: {
        root: root_dir
        ,config: cfg_dir
        ,lib: root_dir + '/lib'
        ,content: root_dir + '/content'
        ,www: root_dir + '/public'
        ,template: root_dir + '/template'
    }
    ,env: (process.env['BC_ENV'] == 'dev') ? 'dev' : 'prod'
};

var dev_overrides = {};

function extend_key(key, data) {
    Cfg[key] = Cfg[key] || {};
    _.extend(Cfg[key], data);
}

// Load all config files
fs.readdirSync(cfg_dir)
  .forEach(function(file){
    var matches = file_re.exec(file)
        ,path = Path.join(cfg_dir, file);

    if (matches) {
        if (matches[2]) {
            dev_overrides[matches[1]] = path;
            return;
        }
        extend_key(matches[1], require(path));
    }
  });

if (Cfg.env == 'dev') {
    _.each(dev_overrides, function(path, key){
        extend_key(key, require(path));
    });
}

exports.Cfg = Cfg;