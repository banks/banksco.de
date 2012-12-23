var BC = require(__dirname+'/../bc')
    ,_ = require('underscore')
    ,Path = require('path')
    ,Url = require('url')
    ,Dir = BC.require('bc/content/dir').ContentDir;

exports.Content = BC.Content = BC.Base.extend({},{
    _root_dir: null
    ,_root: function() {
        if (!this._root_dir) {
            this._root_dir = new Dir(BC.Cfg.paths.content);
            this._root_dir.read();
        }
        return this._root_dir;
    }
    ,get: function(url) {
        var url_obj = Url.parse(url)
            ,dirs = Path.dirname(url_obj.pathname).split(Path.sep).filter(function(x) { return !!x })
            ,resource = Path.basename(url_obj.pathname).split(Path.sep)[0]
            ,cur_dir = this._root()
            ,target;

        if (url_obj.protocol && url_obj.protocol !== 'content') {
            throw new Error('Unknown content URL protocol');
        }

        // Shortcut for the base case
        if (url == '' || url == '/') {
            return cur_dir;
        }

        for (var i = 0; i < dirs.length; i++) {
            cur_dir = cur_dir.get_dir(dirs[i]);
            if (!cur_dir) {
                // Dir in Path does no exist, exit
                return undefined;
            }
        }

        // First see if there is a directory with this name
        target = cur_dir.get_dir(resource);

        if (target) {
            return target;
        }

        // No directory, try a page
        target = cur_dir.get_page(resource);

        if (target) {
            return target;
        }

        // No luck
        return undefined;
    }
    ,find_pages: function(url) {
        var url_obj = Url.parse(url, true)
            dir = this.get(url_obj.pathname);

        if (!dir) {
            return [];
        }

        if (!url_obj.query.type) {
            throw new Error('find_pages (used by #pages) requires type to be set in url params');
        }

        return dir.get_pages(url_obj.query.type, url_obj.query.limit, url_obj.query.offset);
    }
});