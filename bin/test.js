var BC = require(__dirname + '/../lib/bc')
    ,Content = BC.require('bc/content').Content;

Content.get('/index?test=foo&asd=dfg').write_file();

//d.get_dir('p').get_pages('date', 1, 0)[0].read().write_file();

console.log(require('fs').readFileSync(BC.Cfg.paths.www + '/index.html', 'utf-8'));