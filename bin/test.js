var BC = require(__dirname + '/../lib/bc')
    ,Dir = require(BC.Cfg.paths.lib+'/bc/dir').ContentDir;

var d = new Dir(BC.Cfg.paths.content);
d.read();
d._dbg_dump();