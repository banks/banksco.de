var _ = require('underscore')
    ,Cfg = require(__dirname + '/bc/config').Cfg;

/**
 * Simple prototype inheritance without too many bells and whistles.
 *
 * Taken from Backbone.js
 *
 * http://documentcloud.github.com/backbone/
 */
var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    if (protoProps && _.has(protoProps, 'constructor')) {
        child = protoProps.constructor;
    } else {
        child = function(){ parent.apply(this, arguments); };
    }

    _.extend(child, parent, staticProps);

    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    if (protoProps) _.extend(child.prototype, protoProps);

    child.__super__ = parent.prototype;

    return child;
};

// Make "base" class others can inherit extend method from
var Base = function(){};
Base.extend = extend;

exports.Base = Base;
exports.Cfg = Cfg;
exports.require = function(lib) {
    return require(Cfg.paths.lib+'/'+lib);
}