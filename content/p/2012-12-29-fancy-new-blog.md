---
title: Fancy New Blog
---
**Same poor content, new styling (and backend)**

I made my blog a few years ago as a [way to learn Rails](http://banksco.de/p/on-the-bandwagon) and after a year in which I posts only 2 new articles of very low value, I got inspired to give it a revamp.

This article is a long-and-yet-brief overview of the changes..

## Design

The style just suits my tastes better. When I made the last version, I was much more focussed on learning Rails and the aesthetics of the site became somewhat secondary. I was inspired by some very beautiful and elegant sites I've seen recently and this design was the result (for now). I have dreams of adding beautiful imagery and other fancy things to some articles too but we'll see.

Fonts are from [Google's Webfonts](http://www.google.com/webfonts) rather than [TypeKit's](https://typekit.com/) free plan because there is much more freedom without fees. I also get to download the fonts I use here for offline use.

## Technology

I went back to basics for this. Since I made the last version of this blog, my tastes in tech have changed a bit. I've come to value simplicity and efficiency more and more. Having a full Rails stack, web servers, proxies, database, user authentication, SSL certificates etc suddenly seems like a really ugly solution for what is essentially a simple, static site only updated by me.

So this site *is* a static site.

After I finished a lot of the work on this new system described below, I came across an article from a friend of mine about [his CMS solution](http://jekor.com/article/towards-a-lifelong-content-management-system). It turns out he had a lot of the same ideas and he does a great job of expressing his rationale for moving away from Wordpress-like apps for CMS. I link to that now to save you from more clumsy words from me repeating many of the same things less eloquently.

## Managing Static Content

So this site is just HTML files served by good old Apache. Nginx probably would be my first choice on a dedicated server but I'm enjoying my current stay on [Webfaction](http://www.webfaction.com) and this is the most appropriate configuration here.

Managing a static site by hand is so 1990s, clearly we can do better than that.

There are actually a bunch of great static CMSs out there that would have been great, [Jekyll (Github Pages)](https://help.github.com/articles/using-jekyll-with-pages), [Statamic (Commercial)](http://statamic.com/) and [Kirby](http://getkirby.com/) being the main ones I came across. Typically I ended up building my own, for no terribly good reason other than it being a good excuse to learn something and end up with exactly the features I need.

So the site generation is done by a [Node.js](http://nodejs.org/) app. The content is managed through the file system with a simple naming scheme allowing for articles to participate in ordered indices. For example, if the file name begins with a `YYYY-MM-DD` date format then it will be added to a newest-first by-date index for that directory.

The content files themselves are then simply [Markdown](http://daringfireball.net/projects/markdown/) files with [yaml-front-matter](https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter) to add some meta-data to each. Meta-data typically includes the title (so it can be re-used for page title and in listings/RSS) and a template file to use to render that page.

Templating uses [Handlebars](http://handlebarsjs.com) which is Mustache with a little more flexibility. This extra flexibility becomes really useful in conjunction with the content indexes I mentioned before. For example, all the posts on this blog are dated files in the `/p/` directory. To generate the listing on the front page of the site, I just need to make a static page called `/index.md` with meta-data assigning a template that does something like:

    {{#pages '/p/?type=date&limit=5'}}
        <article>
            {{> blog_post_body.mu }}
        </article>
    {{/pages}}

And my custom `pages` helper can go and find the date index for the `/p/` directory and pull out most recent 5 articles.

As well as being defined per file in YAML front matter, meta-data defaults for a whole directory can be set in a `defaults.yml` file (e.g. all blog posts use same template so it is declared once in `/p/defaults.yml`) and these defaults are inherited through the content directory hierarchy.

There is another special content file naming convention (e.g. `/blog.rss.yml -> /blog.rss.xml`) for specifying RSS feeds where the feed meta-data and an internal "content URL" like the one in the template example above are used to generate an XML RSS feed.

Finally, any files that are not `.md` or `.yml` in the content directory are copied directly (symlinked) into the final public document root so that all static assets like images, JS and CSS can be kept versioned with the rest of the content and the entire document root is managed by the generator script.

## Publishing

So content is edited through file system and kept version controlled in a git repository along with the templates and (currently) the node app that generates the site.

I installed a `post-update` hook in the git repo on the web-server that automatically checks out HEAD and re-runs the generation script. So I can deploy changes by editing files locally, committing, and then running `git push production`.

I have toyed with the idea of building a web interface for editing. In fact I did have a working prototype using [EpicEditor](http://oscargodson.github.com/EpicEditor/) and a node.js REST API (using [restify](http://mcavage.github.com/node-restify/)) for editing in an earlier version of the system. But having settled on and enjoying the simplicity of fully version controlled content and no daemons and security to worry about on the server, I'm sticking with local edit and git-push deployment for now.

I am using [Mou](http://mouapp.com/) to write this right now with instant, correctly-styled preview. It works really well, especially when [tied it into Sublime Text 2](http://theablefew.com/blog/sublime-text-2-as-a-markdown-editor) which I am using to edit the rest of the templates and js files if necessary.

## Conclusion

I like it. It's been fun to think about and build and lots of potential. 

I may even stick a skeleton version of the site with generation scripts etc on github although I doubt anyone could have a real desire to use this over one of the more widely used and much better tested options I listed above.

Now I just need to try and focus on producing some interesting content…