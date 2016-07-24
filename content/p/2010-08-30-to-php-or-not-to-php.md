---
title: To PHP or not to PHP?
---

**I've recently run up against the limitations of PHP's OO features in many different projects. While there are some potential solutions, I'm in two minds about whether they are a good idea or not.**

For example, languages like Ruby and JavaScript allow 'Monkey Patching' or modifying classes/object's methods at run time. While some complain that this can cause terrible code and bugs that are very hard to track down, it allows things like behaviors (i.e. mixins for multiple inheritance) which can be a very powerful way of keeping code modular. 

Also, [AOP](http://en.wikipedia.org/wiki/Aspect-oriented_programming) is a powerful tool for reducing code coupling and increasing code reuse. In JS or Ruby you could implement this easily by altering methods at run-time, in Java you can do it by altering methods at compile-time. In PHP you're stuck unless you add an additional 'compile' step into your workflow, negating most of the benefits of using an interpreted language.

In PHP, the closest we get (natively) is to use magic methods like `__call()` to intercept object method calls and do something else instead. There are two major problems with this

1.  You have to fudge the scope about - there is no non-hacky way to add a method to a class from outside it and be able to use `$this` and other object properties as expected.

2.  `__call()` is very slow even compared to standard PHP function calls. This *can* be a real issue if you are using it extensively and may have thousands of calls in a single page load.

3.  It's not native - you end up having to add code to all your objects, or artificially alter the inheritance tree or wrap all your objects in proxy object or similar to get this to work.

### (Enter Runkit)

[Runkit](http://pecl.php.net/package/runkit) is a PECL extension that adds a few interesting methods to PHP that allow methods to be added/removed/copied between objects dynamically at runtime. The solutions to all the problems above? I'm not so sure.

The (new) problems:

1.  It's non-standard. Goodbye to code portability. This will never be maintstream and so neither will all the work you put into classes/libraries.

2.  It's experimental. It seems not enough interest has been shown in runkit and so, despite it being around for a while (at least 5 years!), it is still not recommended for production applications.

3.  I can find no information about performance (and haven't had time to benchmark myself since it would mean recompiling PHP on my machine). I'd be very surprised if it didn't reduce the effectiveness of op-code caching substantially.

Pretty major downsides, but my question goes beyond this. I'm still really torn about whether it is even right to *want* this in PHP. If I really want ruby-like syntax and mixins, why don't I just write in Ruby?

Every language has it's strengths and weaknesses, I wonder if spending a lot of time and effort trying to emulate constructs possible in other languages is just bad PHP programming. Is it a flaw in PHP that it can't support neat mixins (without hacks or ugly code)? I'm not sure.

I've been interested in the decision to drop behavior support in [Doctrine 2](http://www.doctrine-project.org) because it was too much of a hack and caused nightmare bugs. It was one of the features I most sought to emulate in other similar projects but ran into many of the same problems as the Doctrine team.

On the one hand, I'd really like to able to neatly and efficiently solve problems like multiple inheritance and providing 'magic' interfaces to ORM objects without restricting class inheritance etc but on the other hand, if it feels to much like a hack I end up feeling like I'm just using the wrong tools.

If you read this and have any thoughts, I'd love to hear what you think.