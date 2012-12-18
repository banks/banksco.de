---
title: jQuery 1.5 Beats Monster Callbacks Into Shape
---
**This is a shameless re-blog of [Eric Hynds' article on jQuery deferreds](http://www.erichynds.com/jquery/using-deferreds-in-jquery/). It's a great read.**

[jQuery 1.5](http://jquery.com/) was out yesterday and includes several changes as one might expect. Deferreds are a new concept for me although reading Eric's great article above reveals a powerful and elegant new paradigm for handling callbacks in jQuery.

Essentially jQuery `$.ajax` functions (and most other functions with observable results) now return a deferred object which contains a promise. You can then hook callbacks to the success or failure of that promise and they will all be triggered when the promise is fulfilled. That means you can manage multiple bits of code that depend on an AJAX fetch separately and if you hook up a callback to the request after it has completed, it will be fired immediately.

Moreover, the API is very clean and simple with good semantic verbs for hooking things together. That makes the concept arguably easier to understand than plain function being passed callbacks, despite the extra power and decoupling.

There is quite a bit more to it than I've described though and Eric does a great job of explaining how and why you might want to use this powerful technique.