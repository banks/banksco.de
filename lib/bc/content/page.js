var BC = require(__dirname+'/../../bc')
    ,_ = require('underscore')
    ,yamlFront = require('yaml-front-matter');

exports.BaseContentPage = BC.Base.extend({
    _src: null
    ,_parent: null
    ,_slug: null
    ,_props: null
    ,_content: ''
    ,constructor: function(meta, parent) {
        this._src = meta.file;
        this._slug = meta.slug;
        this._parent = parent;
        this._props = {};
    }
    ,sort_key: function() {
        // Default to sorting by file name
        return this._slug;
    }
    ,read: function() {
        var data = yamlFront.loadFront(this._src)
            ,defaults = this._parent ? this._parent.get_defaults() : {};

        this._content = data.__content;
        delete data.__content;

        // Merge attrs with defaults for this dir
        this._props = _.defaults(data, defaults);

        return this;
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