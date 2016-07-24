---
title: Facebook ditches Cassandra for HBase
---

**[Cassandra](http://cassandra.apache.org/) is an open source distributed database implementation that started life at Facebook as a solution to their message inbox search and storage. Facebook [announced the next generation of messaging](http://blog.facebook.com/blog.php?post=452288242130) this week, and it's powered by [HBase](http://hbase.apache.org).**

[Highscalability.com](http://highscalability.com/blog/2010/11/16/facebooks-new-real-time-messaging-system-hbase-to-store-135.html) have a good article about the announcement and technicalities generally. I was particularly interested having recently read [Bradford's comparison of the two](http://www.roadtofailure.com/2009/10/29/hbase-vs-cassandra-nosql-battle/).

What I take from this is a firm reminder that different NoSQL solutions have different engineering trade-offs, and that picking the right tool for any one application is more important that brand loyalty.