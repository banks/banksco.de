var BC = require(__dirname+'/../../../bc')
    ,BaseContentPage = require(BC.Cfg.paths.lib+'/bc/content/page').BaseContentPage;

exports.StaticPage = BaseContentPage.extend({
    _sequence: 0
    ,type: 'static'
    ,constructor: function(meta, parent) {
        BaseContentPage.prototype.constructor.call(this, meta, parent);
        this._sequence = parseInt(meta.sequence, 10) || 0;
    }
    ,sort_key: function() {
        return this._sequence;
    }
    ,_dbg_dump: function(depth) {
        depth = Number(depth) || 0
        var indent = new Array(depth + 1).join("  ");
        console.log(indent+'[StaticPage] '+this._sequence+' '+this._slug);
    }
});