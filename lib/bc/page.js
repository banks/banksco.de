var BC = require(__dirname+'/../bc')
    ,fs = require('fs')
    ,_ = require('underscore')
    ,moment = require('moment');


var BaseContentPage = BC.Base.extend({
    _src: null
    ,_parent: null
    ,_slug: null
    ,constructor: function(meta, parent) {
        this._src = meta.file;
        this._slug = meta.slug;
        this._parent = parent;
    }
    ,sort_key: function() {
        // Default to sorting by file name
        return this._slug;
    }
});

var StaticPage = BaseContentPage.extend({
    _sequence: 0
    ,constructor: function(meta, parent) {
        BaseContentPage.prototype.constructor.call(this, meta, parent);
        this._sequence = parseInt(meta.sequence, 10) || 0;
    }
    ,sort_key: function() {
        return this._sequence;
    }
    ,_dbg_dump: function(depth) {
        depth = Number(depth) || 0
        var indent = new Array(depth + 1).join("  ");
        console.log(indent+'[StaticPage] '+this._sequence+' '+this._slug);
    }
});

var DatePage = BaseContentPage.extend({
    _date: null
    ,constructor: function(meta, parent) {
        BaseContentPage.prototype.constructor.call(this, meta, parent);
        this._date = moment(meta.sequence);
    }
    ,sort_key: function() {
        // Default to sorting by date desc
        return 0 - this._date.unix();
    }
    ,_dbg_dump: function(depth) {
        depth = Number(depth) || 0
        var indent = new Array(depth + 1).join("  ");
        console.log(indent+'[DatePage] '+this._date.format()+' '+this._slug);
    }
});

exports.factory = function(meta, parent){
    switch (meta.type) {
        case 'page':
            return new StaticPage(meta, parent);
        case 'date':
            return new DatePage(meta, parent);
        default:
            throw new Error('Unknown page type');
    }
};