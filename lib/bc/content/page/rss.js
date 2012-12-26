var BC = require(__dirname+'/../../../bc')
    ,StaticPage = require(BC.Cfg.paths.lib+'/bc/content/page/static').StaticPage
    ,RSSView = require(BC.Cfg.paths.lib+'/bc/rss_view').RSSView
    ,_ = require('underscore')
    ,moment = require('moment');

exports.RSSPage = StaticPage.extend({
    type: 'rss'
    ,_extension: 'xml'
    ,_dbg_dump: function(depth) {
        depth = Number(depth) || 0
        var indent = new Array(depth + 1).join("  ");
        console.log(indent+'[RSSPage] '+this._date.format()+' '+this._slug);
    }
    ,get_view: function() {
        this.read();
        var data = _.extend(this._base_props(), this._props);
        return new RSSView(data);
    }
});