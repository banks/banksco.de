---
title: Why NoSQL is great and geek fights aren't
---

**I've been reading a lot about the recent stream of RDBMs alternatives that are getting a lot of attention at the moment. I find the subject fascinating and many of the solutions and technologies coming out make me want to go and summon hundreds of EC2 instances just to distribute some random data over.**

My 30 second NoSQL overview: relational databases can become unwieldy once you need to scale beyond the capacity of a single server. Some applications can easily take advantage of multiple read slaves but with enough write traffic things need to get more exotic. Enter [sharding](http://en.wikipedia.org/wiki/Shard_\(database_architecture\)). If you want to read more about sharding, go ahead. Suffice it to say that once your data is split over separate physical machines, a substantial portion of what makes relational databases and SQL great goes out the window. No more joins, aggregate queries etc. 

Given that the relational part is now severely impaired, people like Google and Amazon have come up with massively distributed systems that are effectively just glorified key-value stores or hash tables. They purposely don't support these more exotic relational features but they can handle petabytes of data and millions of users. The [Google BigTable](http://labs.google.com/papers/bigtable.html) and [Amazon Dynamo](http://www.allthingsdistributed.com/2007/10/amazons_dynamo.html) papers are a great read.

NoSQL encompasses these sorts of solutions as well as document-oriented databases like [MongoDB](http://www.mongodb.org/) and [CouchDB](http://couchdb.apache.org/) and stricter KV stores like [Reddis](http://code.google.com/p/redis/) or [Project Voldemort](http://project-voldemort.com/).

### So is SQL dead? 

As with so many things in our industry, NoSQL has caused a lot of hype and a lot of unnecessary angst. I was prompted to write this by a [recent article on readwriteweb](http://www.readwriteweb.com/cloud/2010/09/an-amusing-take-mysql-diehard.php) which links to a video someone has made. The video itself is somewhat amusing and makes some good points although could have done so much more succinctly and with less profanity in my opinion.

It would be great to see a little more sensible discussion about real-world use cases for new technology and much fewer turf wars. NoSQL is really interesting and, though it's tempting to assume new things are a silver bullet for all the current problems in a domain, we all know this is not the reality. As engineers we should take a great interest in new technology but ultimately we should pick the right tools for the job. For now SQL is probably the best overall tool for the majority of web applications.

NoSQL solutions can solve some interesting problems however these will probably be limited to big-data, big-traffic sites. 99.99% of web apps written are never going to get near to having those sorts of problems and abandoning a mature, proven technology like SQL should not be taken lightly.

So I'm going to continue to enjoy learning about new ways to do things, use them where they actually help, and steer clear of pointless time-wasting arguments.