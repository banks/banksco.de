var BC          = require(__dirname+'/../../bc')
    ,Path       = require('path')
    ,_          = require('underscore')
    ,View       = BC.require('bc/view').View
    ,OutputFile = BC.require('bc/content/output_file').OutputFile
    ,yamlFront  = require('yaml-front-matter');

exports.BaseContentPage = BC.Base.extend({
    _src: null
    ,_parent: null
    ,_slug: null
    ,_hidden: false
    ,_props: null
    ,_content: ''
    ,_read: false
    ,_extension: 'html'
    ,constructor: function(meta, parent) {
        this._src = meta.file;
        this._slug = meta.slug;
        this._hidden = !!meta.hidden;
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
    ,get_output_file: function() {
        var path = this._parent ? this._parent.get_path() : ''
            ,relative = Path.relative(BC.Cfg.paths.content, path)
            ,file = this._slug + '.' + this._extension;
        return Path.join(BC.Cfg.paths.www, relative, file);
    }
    ,get_url: function() {
        var output_file = this.get_output_file()
            ,rel_url = output_file.substr(BC.Cfg.paths.www.length);
        return BC.Cfg.site.base_url+rel_url;
    }
    ,generate_site_file: function() {
        this.read();

        // Build data for template
        var file = this.get_output_file()
            ,view;

        // If this is hidden page, we need to remove the site file if
        // it was publishe din the past
        if (this._hidden) {
            OutputFile.remove(file);
            return;
        }

        view = this.get_view();

        OutputFile.write(file, view.render());

        return file;
    }
    // Build some basic template properties that may be needed
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
    ,get_view: function() {
        this.read();
        var data = _.extend(this._base_props(), this._props);
        return new View(data);
    }
    ,get_parent: function() {
        return this._parent;
    }
    ,get_slug: function() {
        return this._slug;
    }
    ,is_hidden: function() {
        return this._hidden;
    }
});

exports.factory = function(meta, parent){
    var PageCls;
    switch (meta.type) {
        case 'static':
            PageCls = BC.require('bc/content/page/static').StaticPage;
            break;
        case 'rss':
            PageCls = BC.require('bc/content/page/rss').RSSPage;
            break;
        case 'date':
            PageCls = BC.require('bc/content/page/date').DatePage;
            break;
        default:
            throw new Error('Unknown page type');
    }
    return new PageCls(meta, parent);
};