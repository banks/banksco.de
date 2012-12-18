var BC = require(__dirname+'/../../bc')
    ,_ = require('underscore');

exports.BaseContentPage = BC.Base.extend({
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

exports.factory = function(meta, parent){
    var PageCls;
    switch (meta.type) {
        case 'page':
            PageCls = BC.require('bc/content/page/static').StaticPage;
            break;
        case 'date':
            PageCls = BC.require('bc/content/page/date').DatePage;
            break;
        default:
            throw new Error('Unknown page type');
    }
    return new PageCls(meta, parent);
};