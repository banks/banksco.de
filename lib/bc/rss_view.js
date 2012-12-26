var BC = require(__dirname+'/../bc')
    ,_ = require('underscore')
    ,moment = require('moment')
    ,RSS = require('rss')
    ,View = BC.require('bc/view').View
    ,Content = BC.require('bc/content').Content;


exports.RSSView = BC.Base.extend({
    data: {}
    ,constructor: function(data) {
        this.data = data;
    }
    ,render: function() {
        var feed_params = {}
            ,feed
            ,pages
            ,data = this.data;

        if (!this.data.pages) {
            throw new Error('RSSView needs data.pages to be set to the Content URL for the feed contents');
        }

        pages = Content.find_pages(this.data.pages);

        // Build basic feed params
        _.each(['title', 'description', 'author'], function(prop){
            if (data[prop]) {
                feed_params[prop] = data[prop];
            }
        });

        // Set site URL and feed URL
        feed_params.site_url = data.site_url || BC.Cfg.site.base_url;
        feed_params.feed_url = data.url;

        feed = new RSS(feed_params);

        // Add posts to feed
        if (pages) {
            _.each(pages, function(page){
                var p = page.get_view().get_formatted_data();
                feed.item({
                    title: p.title,
                    description: p.content,
                    url: p.url,
                    date: p.pub_date.toString()
                });
            });
        }

        return feed.xml();
    }
});