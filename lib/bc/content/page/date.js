var BC = require(__dirname+'/../../../bc')
    ,BaseContentPage = require(BC.Cfg.paths.lib+'/bc/content/page').BaseContentPage
    ,moment = require('moment');

exports.DatePage = BaseContentPage.extend({
    _date: null
    ,type: 'date'
    ,constructor: function(meta, parent) {
        BaseContentPage.prototype.constructor.call(this, meta, parent);
        this._date = moment(meta.sequence);
    }
    ,sort_key: function() {
        // Default to sorting by date desc
        return 0 - this._date.unix();
    }
    ,_dbg_dump: function(depth) {
        depth = Number(depth) || 0
        var indent = new Array(depth + 1).join("  ");
        console.log(indent+'[DatePage] '+this._date.format()+' '+this._slug);
    }
});