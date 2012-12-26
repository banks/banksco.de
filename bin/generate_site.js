var BC = require(__dirname + '/../lib/bc')
    ,Content = BC.require('bc/content').Content;

Content.get('/').generate_site_files();