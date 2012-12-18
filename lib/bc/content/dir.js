var BC = require(__dirname+'/../../bc')
    ,fs = require('fs')
    ,_ = require('underscore')
    ,yaml = require('js-yaml')
    ,Page = BC.require('bc/content/page');

var FileNameMatchers = {
    defaults: /^defaults.ya?ml$/i
    ,date: /^(_?)(\d{4}-\d{2}-\d{2}(?:-\d{4})?)-([a-z0-9\-]+)\.md$/i
    ,page: /^(_?)(?:(\d+)-)?([a-z0-9-]+)\.md$/i
};

var ContentDir = BC.Base.extend({
    _path: null
    ,_parent: null
    ,_pages: null
    ,_files: null
    ,_sub_dirs: null
    ,_defaults: null
    ,constructor: function(path, parent) {
        this._path = path;
        this._parent = parent;
        this._pages = {};
        this._files = {};
        this._sub_dirs = {};
        this._defaults = _.defaults(((parent || {})._defaults || {}), (BC.Cfg.defaults || {}));
    }
    ,read: function() {
        var self = this;
        fs.readdirSync(this._path)
            .forEach(function(file){
                var path = self._path+'/'+file
                    ,stat = fs.statSync(path)
                    ,meta;

                if (stat.isDirectory()) {
                    self._sub_dirs[file] = (new ContentDir(path, self)).read();
                } else {
                    meta = self._get_meta(file);
                    if (meta.type === 'file') {
                        self._files[file] = meta;
                    } else if (meta.type === 'defaults') {
                        self._defaults = _.defaults(require(path) || {}, this._defaults);
                    } else {
                        self._pages[meta.type] = self._pages[meta.type] || [];
                        self._pages[meta.type].push(Page.factory(meta, self));
                    }
                }
            });

        // Convert dates to
        _.each(this._pages, function(pages, type){
            self._pages[type] = _.sortBy(pages, function(page){
                return page.sort_key();
            });
        });

        return this;
    }
    ,_get_meta: function(file_name) {
        var meta = {
            type: 'file'
            ,file: this._path+'/'+file_name
        };
        for (var type in FileNameMatchers) {
            var m = FileNameMatchers[type].exec(file_name);
            if (m) {
                meta.type = type;
                if (type === 'date' || type === 'page') {
                    meta.hidden = (m[1] == '_');
                    meta.sequence = m[2] || 0;
                    meta.slug = m[3];
                }
                return meta;
            }
        }
        return meta;
    }
    ,_dbg_dump: function(depth) {

        depth = Number(depth) || 0
        var indent = new Array(depth + 1).join("  ");

        console.log(indent+"[DIR] "+this._path);

        console.log(this._defaults);

        // Recursive walk
        _.each(this._sub_dirs, function(dir){
            dir._dbg_dump(depth+1);
        });

        _.each(this._files, function(meta, file){
            console.log(indent+'[Plain File] '+file.file);
        });

        _.each(this._pages, function(pages, type){
            _.each(pages, function(page){
                page._dbg_dump(depth);
            });
        });
    }
});

exports.ContentDir = ContentDir;