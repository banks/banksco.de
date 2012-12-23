var BC          = require(__dirname+'/../../bc')
    ,fs         = require('fs')
    ,Path       = require('path')
    ,_          = require('underscore')
    ,View       = BC.require('bc/view').View
    ,yamlFront  = require('yaml-front-matter');

exports.BaseContentPage = BC.Base.extend({
    _src: null
    ,_parent: null
    ,_slug: null
    ,_props: null
    ,_content: ''
    ,_read: false
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
        if (this._read) {
            return;
        }

        var data = yamlFront.loadFront(this._src)
            ,defaults = this._parent ? this._parent.get_defaults() : {};

        this._content = data.__content;
        delete data.__content;

        // Merge attrs with defaults for this dir
        this._props = _.defaults(data, defaults);

        return this;
    }
    ,get_output_file: function(ext) {
        var path = this._parent ? this._parent.get_path() : ''
            ,relative = Path.relative(BC.Cfg.paths.content, path)
            ,file = this._slug + '.' + (ext || 'html');
        return Path.join(BC.Cfg.paths.www, relative, file);
    }
    ,get_url: function() {
        var output_file = this.get_output_file()
            ,rel_url = output_file.substr(BC.Cfg.paths.www.length);
        return BC.Cfg.site.base_url+rel_url;
    }
    ,write_file: function() {
        this.read();

        // Build data for template
        var view = new View(this.get_view_data())
            ,file = this.get_output_file()
            ,html = view.render()

        fs.writeFileSync(file, html, 'utf-8');
        console.log(file + ' written');
    }
    // Build some basic tmeplate properties that may be needed
    // this is designed to be overriden by subclasses if needed
    ,_base_props: function() {
        return {
            url: this.get_url()
            ,type: this.type
            ,dir: Path.relative(BC.Cfg.paths.content, this._parent.get_path())
            ,slug: this._slug
            ,raw_content: this._content
        };
    }
    ,get_view_data: function() {
        this.read();
        return _.extend(this._base_props(), this._props);
    }
    ,get_parent: function() {
        return this._parent;
    }
    ,get_slug: function() {
        return this._slug;
    }
});

exports.factory = function(meta, parent){
    var PageCls;
    switch (meta.type) {
        case 'static':
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