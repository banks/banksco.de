var BC = require(__dirname + '/../lib/bc')
    ,Dir = BC.require('bc/content/dir').ContentDir;

var d = new Dir(BC.Cfg.paths.content);
d.read();

console.log(d.get_page('index').read());