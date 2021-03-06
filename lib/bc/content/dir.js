var BC = require(__dirname+'/../../bc')
    ,fs = require('fs')
    ,_ = require('underscore')
    ,yaml = require('js-yaml')
    ,Path = require('path')
    ,OutputFile = BC.require('bc/content/output_file').OutputFile
    ,Page = BC.require('bc/content/page');

var FileNameMatchers = {
    defaults: /^defaults.ya?ml$/i
    ,date: /^(_?)(\d{4}-\d{2}-\d{2}(?:-\d{4})?)-([a-z0-9\-]+)\.md$/i
    ,static: /^(_?)(?:(\d+)-)?([a-z0-9-]+)\.md$/i
    ,rss: /^(_?)(?:(\d+)-)?([a-z0-9-]+\.rss)$/i
};

var ContentDir = BC.Base.extend({
    _path: null
    ,_parent: null
    ,_indexes: null
    ,_pages: null
    ,_files: null
    ,_sub_dirs: null
    ,_defaults: null
    ,constructor: function(path, parent) {
        this._path = path;
        this._parent = parent;
        this._indexes = {};
        this._pages = {};
        this._files = {};
        this._sub_dirs = {};
        this._defaults = _.defaults(((parent || {})._defaults || {}), (BC.Cfg.defaults || {}));
    }
    ,read: function() {
        var self = this;
        fs.readdirSync(this._path)
            .forEach(function(file){
                var path = Path.join(self._path, file)
                    ,stat = fs.statSync(path)
                    ,meta;

                if (self.should_ignore(Path.relative(BC.Cfg.paths.content, file))) {
                    return;
                }

                if (stat.isDirectory()) {
                self._sub_dirs[file] = (new ContentDir(path, self)).read();
                } else {
                    meta = self._get_meta(file);
                    if (meta.type === 'file') {
                        self._files[file] = meta;
                    } else if (meta.type === 'defaults') {
                        self._defaults = _.defaults(require(path) || {}, this._defaults);
                    } else {
                        self._pages[meta.slug] = Page.factory(meta, self);
                        if (!meta.hidden) {
                            self._indexes[meta.type] = self._indexes[meta.type] || [];
                            self._indexes[meta.type].push(self._pages[meta.slug]);
                        }
                    }
                }                
            });

        // Convert dates to
        _.each(this._indexes, function(index, type){
            self._indexes[type] = _.sortBy(index, function(page){
                return page.sort_key();
            });
        });

        return this;
    }
    ,should_ignore: function(rel_file) {
        var ignore = (BC.Cfg.content || {}).ignore_files || [];

        for (var i=0; i < ignore.length; i++) {
            var regex = new RegExp(ignore[i].replace('.', '\\.')
                                    .replace('*', '.*'), 'i');

            if (regex.exec(rel_file)) {
                return true;
            }
        }

        return false;
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
                if (type === 'date' || type === 'static' || type === 'rss') {
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

        _.each(this._indexes, function(pages, type){
            _.each(pages, function(page){
                page._dbg_dump(depth);
            });
        });
    }
    ,get_defaults: function() {
        return this._defaults;
    }
    ,get_page: function(slug) {
        return this._pages[slug];
    }
    ,get_pages: function(type, limit, offset) {
        if (!this._indexes[type]) {
            return [];
        }
        offset = Number(offset || 0);
        limit = Number(limit);

        return this._indexes[type].slice(offset, limit ? (offset + limit) : undefined);
    }
    ,get_dir: function(sub_dir) {
        return this._sub_dirs[sub_dir];
    }
    ,get_path: function() {
        return this._path;
    }
    ,generate_site_files: function() {
        var generated_files = {}
            ,self = this
            ,public_dir = Path.join(BC.Cfg.paths.www, Path.relative(BC.Cfg.paths.content, this._path));

        _.each(this._sub_dirs, function(sub_dir){
            sub_dir.generate_site_files();
        });

        _.each(this._files, function(meta, file){
            var target = Path.join(BC.Cfg.paths.www, Path.relative(BC.Cfg.paths.content, meta.file));
            OutputFile.link(meta.file, target);
            generated_files[target] = 1;
        });

        _.each(this._pages, function(page, file){
            var generated = page.generate_site_file();
            generated_files[generated] = 1;
        });

        // Now clean up any files not meant to be here
        fs.readdirSync(public_dir)
            .forEach(function(file){
                var path = Path.join(public_dir, file)
                    ,stat = fs.statSync(path)
                    ,idx;

                if (self.should_ignore(Path.relative(BC.Cfg.paths.www, path))) {
                    return;
                }

                if (!stat.isDirectory()) {
                    // Is it one we just generated?
                    // if not, remove it as it should not be here
                    if (!generated_files[path]) {
                        OutputFile.remove(path);
                    }
                }
            });
    }
});

exports.ContentDir = ContentDir;