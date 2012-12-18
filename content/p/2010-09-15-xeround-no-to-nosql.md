---
title: Xeround: no to NoSQL
---
**Just a quick note to point out an interesting developement in the 'distributed database' field. [Xeround](http://www.xeround.com) are developing a MySQL storage engine that has all the elasticity, redundancy and scalability of some of the popular NoSQL solutions with a 100% compatible MySQL interface.**

This could be really interesting if it works as well as advertised since any MySQL app can migrate to it with *no code change*.

I do feel though that their [technical whitepaper](http://www.xeround.com/developers/white-paper.html) reads more like a marketing brochure than an academic discussion of the technology - there are no mentions of any downsides or tradeoffs in the design. Specifically, there is no mention of how much slower distributed joins and aggregation are than normal MySQL. just allusions to 'low latency'.

Essentially they have written a front end that does all the complex stuff you application would have to do with another NoSQL solution and then put a MySQL interface on it. If it works and really is fast then it is a very compelling solution. In the absence of benchmarks or real-world discussions though, I'm somewhat sceptical about whether this will really work well for complex queries on actually big data sets. I unfortunately don't have time (or data) to try it for myself but I will keep an eye out...