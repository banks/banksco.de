var BC = require(__dirname + '/../lib/bc')
    ,watch_r = require('watch_r')
    ,exec = require('child_process').exec;

function print_wait() {
    console.log("> Waiting for changes ...");
}

function regen(){
    console.log("> Running generate ...");
    // We use exec and external node instance so we reload the possibly
    // changed source files without having to uncache loaded stuff in this process
    exec('node '+__dirname+'/generate_site', function (error, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (error !== null) {
          console.log('ERROR: ' + error);
        }
        print_wait();
    });
}

function watch_dir(err, watcher) {
    watcher.on('change', regen);
    watcher.on('delete', regen);
}

watch_r(BC.Cfg.paths.content,   watch_dir);
watch_r(BC.Cfg.paths.template,  watch_dir);
watch_r(BC.Cfg.paths.lib,       watch_dir);
watch_r(BC.Cfg.paths.config,    watch_dir);

print_wait();