---
title: "Understanding Distributed System Guarantees"
---

Tyler Treat just published [another](http://bravenewgeek.com/tag/distributed-systems/) great article about Distributed Systems and the [limited value of strong guarantees](http://bravenewgeek.com/what-you-want-is-what-you-dont-understanding-trade-offs-in-distributed-messaging/) they might claim to provide.

I'll start with a word of thanks to Tyler - his blog is a great read and well recommended for his articulation and clarity on many computer science subjects that are often muddled by others.

Tyler's article focusses specifically on distributed messaging guarantees but at least some of the discussion is relevant to or even intimately tied to other distributed problems like data consistency and consensus.

I agree with all of his points and I hope this article is a complement to the discussion on trade-offs in the distributed design space.

The article got me thinking about the inverse question - when is it sensible to incur the overhead of working around reduced guarantees, assuming doing so is non-trivial?

### When is Strong Consistency worth it?

Let's consider Google's database evolution (of which I know nothing more than you can read for yourself in these papers).

In 2006 Google's published a paper on [BigTable](http://research.google.com/archive/bigtable.html). Unlike [Dynamo](http://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf) and others, BigTable made some attempt to guarantee strong consistency _per row_. But it stopped there; no multi-row atomic updates, certainly no cross-node transaction. Five years later a paper on their [MegaStore](http://research.google.com/pubs/pub36971.html) database was published. The motivation includes the fact that "[NoSQL stores like BigTable's] limited API and loose consistency models complicate application development".

A year later details of [Spanner](http://research.google.com/archive/spanner.html) emerged, and in the introduction we discover that despite the high performance cost, engineers inside Google were tending to prefer to use MegaStore over BigTable since it allowed them to get on with writing their apps rather than re-inventing solutions for consistent geographical replication, multi-row transactions, and secondary indexing (my gloss on the wording there).

Google's cream-of-the-crop engineers with all the resources available to them chose to trade performance for abstractions with stronger guarantees.

That doesn't mean that MegaStore and Spanner can never fail. Nor (I guess) that Google's internal users of those systems are blindly assuming those guarantees hold in all cases in application code. But, at least for Google, providing stronger guarantees at the shared datastore level was a win for their engineering teams.

Just because it's Google doesn't make it right, but it is worth noting nonetheless.

### Commutativity and Idempotence

A sound conclusion of Tyler's post is that you are better served if you can shape your problems into commutative and idempotent actions which can naturally tolerate relaxed guarantees correctly.

This is undoubtedly true.

But in cases where idempotence or commutativity are not naturally available, at least some of the possible solutions vary little between applications.

For example de-duplicating events based on a unique ID is a common requirement. It is equivalent to attempting to provide exactly-once delivery. Tyler [points out this is impossible to do perfectly](http://bravenewgeek.com/you-cannot-have-exactly-once-delivery/), nonetheless some applications require at least some attempt at de-duplicating event streams.

Isn't it better, given a case that requires it, to have an infrastructure that has been specifically designed and tested by distributed systems experts that provides clear and limited guarantees about de-duplicated delivery? Certainly if the alternative is to re-solve that hard problem (and possibly incur the significant storage cost) in every system we build that is not trivially idempotent. The centralised version won't be perfect, but in terms of development cost it might well be a cheaper path to "good enough".


### Trade-offs

The title of Tyler's article is about "Understanding Trade-Offs". This really is key.

To me the conclusion of the article is spot on: it's better to consider up-front the real guarantees required and what cost they come at. I just want to add the (probably obvious) idea that application code complexity, re-solving similar problems and the extent to which every application developer needs to be a distributed systems expert are real costs to throw into the trade-off

The Google school of thought argues that it's better to favour simplicity for application developers and pay the performance cost of that simpler model until the application really needs the increased performance - at this point the additional application complexity can be justified.

This is orthogonal to Tyler's point that the application developer needs to have clarity on where and how the claimed guarantees of a system break down and how that affects the correctness or availability requirements of their own application. To me that's a given, but I don't think it devalues systems that do attempt to provide higher-level guarantees, provided they are properly understood.