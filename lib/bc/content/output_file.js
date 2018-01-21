var BC          = require(__dirname+'/../../bc')
    ,fs         = require('fs')
    ,Path       = require('path')
    ,_          = require('underscore')
    ,uglifyjs   = require("uglify-js")
    ,uglifycss = require('uglifycss');;

exports.OutputFile = BC.Base.extend({}, {
    write: function(file, content) {
        var filename = Path.basename(file);

        this.ensure_dir_exists(file);

        fs.writeFileSync(file, content, 'utf-8');
        console.log('Written output file: '+file);
    }
    ,ensure_dir_exists: function(path) {
        var dirs = Path.dirname(path).split(Path.sep)
            current_path = '';

        _.each(dirs, function(dir){
            current_path += (Path.sep + dir);
            if (!fs.existsSync(current_path)) {
                // Make dir
                fs.mkdirSync(current_path, 0755);
            }
        });
    }
    ,link: function(content_file, public_file) {

        if (fs.existsSync(public_file)) {
            fs.unlinkSync(public_file);
        }

        this.ensure_dir_exists(public_file);

        var linkFile = function() {
            /*fs.symlink(content_file, public_file, function(err){
                if (err) {
                    throw err;
                }
                console.log('Symlinked file '+public_file);
            });*/
            fs.copyFileSync(content_file, public_file);
            console.log("Copied file", public_file);
        }

        var ext = Path.extname(public_file);
        switch (ext.toLowerCase()) {
            case ".js":
                if (!!BC.Cfg.content.minify) {
                    var out = uglifyjs.minify(content_file);
                    fs.writeFileSync(public_file, out.code);
                    console.log('Written minified JS file '+public_file);
                } else {
                    linkFile();
                }
                break;
            case ".css":
                if (!!BC.Cfg.content.minify) {
                    var out = uglifycss.processFiles([content_file]);
                    fs.writeFileSync(public_file, out);
                    console.log('Written minified CSS file '+public_file);
                } else {
                    linkFile();
                }
                break;
            default:
                linkFile();
        }
    }
    ,remove: function(file) {
        // Attempt to delete if it exists
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
            console.log('Removed output file: '+file);
        }

        // If containing dir is now empty then remove
        try {
            var dir = Path.dirname(file);
            while (dir != BC.Cfg.paths.www) {
                fs.rmdirSync(dir);
                console.log('Removed empty output dir: '+dir);
                dir = Path.dirname(dir);
            }
        } catch (e) {
            // Probably not empty
        }
    }
})
