var BC = require(__dirname+'/../bc')
    ,_ = require('underscore')
    ,marked = require('marked')
    ,moment = require('moment')
    ,highlight = require("highlight").Highlight
    ,Handlebars = require('handlebars')
    ,fs = require('fs')
    ,Path = require('path');

marked.setOptions({
    highlight: function(code, lang) {
        // node.js highlight plugin does not have explicit lang mode
        return highlight(code);
    }
    ,sanitize: false
});

// Set up all templates so we can use them as partials
// this is not that efficient in the grand scheme of things but 
// for simple sites not a big deal. Seems like Handlebars js doesn't provide
// a mechanism to fetch partials from FS when requested.
var Templates = {};

function find_templates_in(dir) {
    fs.readdirSync(BC.Cfg.paths.template)
        .forEach(function(file_name){
            var file = Path.join(dir, file_name)
                ,stat = fs.statSync(file)
                ,tpl_id = Path.relative(BC.Cfg.paths.template, file);

            if (stat.isDirectory()) {
                find_templates_in(file);
            } else {
                Templates[tpl_id] = fs.readFileSync(file, 'utf-8');
                Handlebars.registerPartial(tpl_id, Templates[tpl_id]);
            }
        });
}
find_templates_in(BC.Cfg.paths.template);

// Helpers for content finding API
function helper_sibling_page(page, options, finder) {
    var dir = BC.Content.get(page.dir || '/')
        ,siblings
        ,sibling;


    if (!dir) return options.inverse(this);

    siblings = dir.get_pages(page.type);

    if (!siblings || !siblings.length) return options.inverse(this);

    sibling = finder(siblings, page);

    if (!sibling) return options.inverse(this);

    return options.fn(sibling.get_view().get_formatted_data());
}

Handlebars.registerHelper('next_page', function(options) {
    return helper_sibling_page(this, options, function(siblings, cur){
        for (var i = 0; i < siblings.length; i++) {
            if (siblings[i].get_slug() == cur.slug) {
                // Found current item, return next one if it exists 
                // (list is sorted in date DESC order so 'next' chronologically
                // is the previous entry in list)
                return siblings[i - 1];
            }
        }
        return null;
    });
});
Handlebars.registerHelper('prev_page', function(options) {
    return helper_sibling_page(this, options, function(siblings, cur){
        for (var i = 0; i < siblings.length; i++) {
            if (siblings[i].get_slug() == cur.slug) {
                // Found current item, return prev one if it exists 
                // (list is sorted in date DESC order so 'prev' chronologically
                // is the next entry in list)
                return siblings[i + 1];
            }
        }
        return null;
    });
});

// Page index listings
Handlebars.registerHelper('pages', function(context, options) {
    var url = context
        ,pages = BC.Content.find_pages(url)
        ,html = ''
        ,data = Handlebars.createFrame({loop: {pages: pages, idx: 0}});

    if (pages && pages.length) {
        _.each(pages, function(page, idx){
            data.loop.idx = idx;
            html += options.fn(page.get_view().get_formatted_data(), {data: data});
        });
    }

    return html;
});

// Layout title default behaviour
Handlebars.registerHelper('layout_title', function(options){
    return (this.layout_title_prefix || '') 
            + (this.title || '')
            + (this.layout_title_suffix || '');
});

// Date formater
Handlebars.registerHelper('date_format', function(date_obj, format, options){
    var m = moment(date_obj);

    if (m.isValid() && format) {
        // The body content should resolve to a format string
        return m.format(format);
    }
});

// This helper can be used inside iteration loops to "remember"
// the previous value during iteration and only render a block
// if the value for this iteration is different to the previous one
Handlebars.registerHelper('if_different', function(prop, options){
    var val = this
        ,loop_ctx = options.hash.loop_ctx
        ,last_vals
        ,last_val;

    if (!loop_ctx) {
        return;
    }

    _.each(prop.split('.'), function(part){
        val = _.result(val, part);
    });

    last_vals = loop_ctx.last_vals || {}
    last_val = last_vals[prop];

    if (val !== last_val) {
        last_vals[prop] = val;
        options.hash.loop_ctx.last_vals = last_vals;
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

var Layouts = {
    _cache: {}
    ,get: function(layout) {
        if (!this._cache[layout]) {
            if (!Templates[layout]) {
                throw new Error("Unknown layout '" + layout + "'");
            }
            this._cache[layout] = Handlebars.compile(Templates[layout]);
        }
        return this._cache[layout];
    }
};

exports.View = BC.Base.extend({
    data: {}
    ,layout: 'layout.mu'
    ,_compiled_template: null
    ,constructor: function(data) {
        this.data = data;

        if (!data.template || !_.has(Templates, data.template)) {
            throw new Error("Unknown template '" + data.template + "'");
        }
        this._compiled_template = Handlebars.compile(Templates[data.template]);
    }
    ,get_formatted_data: function() {
        return _.extend({
                    Cfg: BC.Cfg
                    ,content: marked(this.data.raw_content || '')
                }, this.data);
    }
    ,render: function() {
        var data = this.get_formatted_data()
            ,layout = Layouts.get(this.layout)
            ,html;

        try {
            data['layout_content'] = this._compiled_template(data);
            html = layout(data);
        } catch (e) {
            console.log(e);
            process.exit();
        }

        return html;
    }
});