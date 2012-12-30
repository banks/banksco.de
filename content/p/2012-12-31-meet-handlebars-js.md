---
title: Meet Handlebars.js
---
**In [making this blog](http://banksco.de/p/fancy-new-blog.html) I ended up using [Yehuda Katz' Handlebars.js](http://handlebarsjs.com) for templating. It has some intersting features I'll introduce here, but arguably dilutes [Mustache's](http://mustache.github.com) basic philosophy somewhat.**

I found Handlebars to be a powerful extension to Mustache but I want to note up-front that it quite possibly isn't the best option in every case. Certainly if you need implementations outside of Javascript it's not (yet) for you, however I'm also aware that the extra power added comes with a potential cost: you can certainly undo many of the benefits of separating logic and template.

With that note in place. I'll introduce the library.

## Why Handlebars?

Yehuda has already outlined his [rationale for creating Handlebars](http://yehudakatz.com/2010/09/09/announcing-handlebars-js/) so I won't go into too much detail here. The important goals can be summed up as:

 - **Global, contextual helpers** &mdash; Mustache allows helper methods in views but they must be defined in the view object (Yehuda calls this the "context" object so I'll keep that terminology from now on). Further, there is intentionally no way to pass arguments to these methods so even if they are defined globally and "mixed-in" of inherited into each view, they are fairly limited in scope.
 
 - **More flexibility with accessing data from parent contexts** &mdash; inside blocks, Mustache makes it tricky to access properties of the parent scope outside the block.
 
 - **Precompilation support** &mdash; you can pre-compile templates into native JS code. In browser context this saves the from client the string parsing overhead.
  
I encourage you to read his article for a lot more detail and explanation of those points but we'll crack on for now.

I won't cover all the features here. You can read them [in the documentation](http://handlebarsjs.com). For now I want to highlight the power (and possible danger) of helpers.

In the case of [my static site generation system](http://banksco.de/p/fancy-new-blog.html), my main goal was to have a very thin layer of logic on top of simple content-with-meta-data files with some simple naming conventions. I wanted flexibility in the templating system so that I could generate menus or listings of content without writing extra code for each case.

With Mustache, this flexibility had to happen in the view layer and so became a little clumsy to express in a general and extensible way the data sets required for any page.

It turned out to be much neater and require a lot less "magic" code to be able to make the templates a little more expressive. Helpers were the key.

## Helpers

Handlebars adds to Mustache the ability to register helpers that can accept contextual arguments. Helpers are simply callbacks that are used to render `{{mustaches}}` or `{{#blocks}}{{/blocks}}`. They can be registered globally or locally in a specific view. We'll use global registration here to keep examples clearer.

Here's a basic example of a block helper that could be used for rendering list markup.

    <h1>{{title}}</h1>
    {{#list links}}
        <a href="{{url}}">{{name}}</a>
    {{/list}}

Here's the context used

    {
        title: 'An example',
        links: [
            {url: 'http://example.com/one', name: 'First one'},
            {url: 'http://example.com/two', name: 'Second one'}
        ]
    }
    
And here is the `list` helper definition:

    Handlebars.registerHelper('list', function(links, options){
        var html = "<ul>\n";
        for (var i = 0; i < links.length; i++) {
            html += "\t<li>" + options.fn(links[i]) + "</li>\n";
        }
        return html + "</ul>\n";
    });
    
When you compile this and render with the context data above, you would get the following output:

    <h1>An example</h1>
    <ul>
        <li><a href="http://example.com/one">First one</a></li>
        <li><a href="http://example.com/two">Second one</a></li>
    </ul>

You can read similar examples in [the documentation](http://handlebarsjs.com) which have much more complete explanations of the details here but the basics should be clear:

 - The helper is called like a regular Mustache expression &mdash; in this case it's a block but non-blocks work too.
 - The `links` array from the context data is passed as an argument. Handlebars allows passing more than one argument or no arguments. The options arg is always present as the last one, any others before that are positional, passed through from the template expression. (you can also use non-positional [hash arguments](http://handlebarsjs.com/block_helpers.html#hash-arguments).)
 - The `options` arg is passed a hash containing a few things. Most significant here is `options.fn` which is the compiled template function for the block's content. That means you can call it with either the current context `this` or some other data context. In this example we are passing `links[i]` which means the inner block can use `{{url}}` and `{{name}}` directly form the current link's context.
 
With that very brief overview example, I want to move on to more interesting examples. If you want to read more about the specifics about what happened there then I'd encourage [reading the block helpers documentation](http://handlebarsjs.com/block_helpers.html).

## Helpers for Content Selection

Before I continue, I need to acknowledge that what follows breaks everything you know about MVC separation of concerns. I know. Bear with me for now.

My site generation system builds the site files based on filesystem naming conventions. For things like the blog home page I wanted to show the 5 most recent blog posts.

Internally the system reads the whole content file structure and builds an in-memory model of the content. Each directory has two indices: one for all articles with a date in the file name (most recent first) and an index of all other article files in alphabetical order. You can then get the object representing that directory and list the articles in either the date-based or name-based index.

For convenience, I developed an internal API that made this easy using "content URLs" for example `Content.get('/p/?type=date&limit=5')` which will return the most recent 5 dated articles in the `/p/` directory.

From there it is pretty simple to be able to make a block helper that allows templates like this:

    <ul>
    {{#pages '/p/?type=date&limit=5'}}
        <li><a href="{{url}}">{{title}}</a></li>
    {{/pages}} 
    </ul>

 * The `pages` helper accepts a string argument (the internal content URL) and uses it to fetch the relevant page objects from the content model.
 * In this case `options.fn` is passed the page object itself so can render any property of the page.


### Next and Previous

But listings aren't the only case this is useful. On the bottom of each blog article I have links to next/previous articles (if they exist) and these need the URL and title of the neighbouring items in the dated index.

I did this with another couple of block helpers. The blog template looks a bit like this:

    <h1>{{title}}<h1>
    {{{content}}}
    <footer>
        {{#prev_page}}
            <a href="{{url}}">&laquo; {{title}}</a>
        {{/prev_page}}
        {{#next_page}}
            <a href="{{url}}">{{title}} &raquo;</a>
        {{/next_page}}
    </footer>

The helper itself uses `this` which is the current context (in this case the main blog article being displayed). It then looks up in the content index the article's parent directory, and locates the previous or next item in the index relative to the current one. It then calls `options.fn` with the neighbouring article object as context.

## Pushing the Boundaries

From here there is a lot of grey areas you could probe with this powerful construct. For example, let's assume you have different modules of your app rendering themselves and then being combined by some layout controller and rendered into a layout.

What if you wanted to have the module's external CSS or JS requirements actually defined in the template that really has the dependency. Right off the bat, I'll say I can't think of a real reason you'd want this and not have it taken care of outside of the templating layer, but…

You could have a helper for ensuring the correct CSS is loaded up-stream in the template like:

    {{add_css 'widget.css'}}
    <div class="widget">
        ...
    </div>
    
And then have the helper defined such that it adds the arguments passed to the layout controller and returns nothing to be rendered.

Then the layout rendering might link those CSS assets in the head.

You're right. This is almost certainly a bad idea. I mention it because it was something that occurred to me for a second before I recognised that is was an example of probably dangerous usage. When you get the hang of a powerful concept like this it's easy to start seeing every problem that can be possibly solved with it as a good candidate.

As with all powerful programming concepts and libraries, there are many things you _can_ do with Handlebars helpers that are really bad ideas. Hence my note of caution at the start.

## Conclusion

I'm quite happy with the extra power Handlebars has given me in this context. But I'm certain that with the extra power comes the inevitable responsibility. It is certainly possible to write crazy and unmaintainable code if you get too creative with helpers without thought.

The examples here are probably not best practice for an MVC web-app context. But here in a site generation script with an already in-memory content model, it allowed me to extend the expressiveness of the system without hard-coding a lot of specific logic for different cases in the model layer.

Handlebars.js has many more features than I have touched on here. Check it out. It may just be what you are looking for if you really like Mustache's philosophy but have a need (and the discipline) to make more expressive helpers.