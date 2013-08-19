---
title: "LMDB: The Leveldb Killer?"
---
**I've been quiet for a while on this blog, busy with many projects, but I just had to comment on my recent discovery of [Lightning Memory-Mapped Database (LMDB)](http://symas.com/mdb/). It's very impressive, but left me with some questions.**

### Disclaimer

Let me start out with this full acknowledgement that I have not yet had a chance to compile and test LMDB (although I certainly will). This post is based on my initial response to the literature and discussion I've read, and a quick read through the source code.

I'm also very keen to acknowledge the author [Howard Chu](https://twitter.com/hyc_symas) as a software giant compared to my own humble experience. I've seen other, clearly inexperienced developers online criticising his code style and I do not mean to do the same here. I certainly hope my intent is clear and my respect for him and this project is understood throughout this discussion. I humbly submit these issues for discussion for the benefit of all.

### Understanding the Trade-offs

First up, with my previous statement about humility in mind, the biggest issue I ran up against when reviewing LMDB is partly to do with presentation. The slides and documentation I've read do a good job of explaining the design, but *not once* in what I've read was there any more than a passing mention of anything resembling a trade-off in the design of LMDB.

My engineering experience tells me that no software, especially when attempting to claim "high performance" comes without some set of assumptions and some trade-offs. So far everything I have read about LMDB has been so positive I'm left with a *slight* (emphasis important) feel of the "silver bullet" marketing hype I'd expect from commercial database vendors and which I've come to ignore.

Please don't get me wrong, I don't think the material I've reviewed is bad, just seems to lack any real discussion of the downsides - the areas where LMDB might *not* be the best solution out there.

On a personal note, I've found the apparent attitude towards leveldb and Google engineers a little off-putting too. I respect the authors opinion that LSM tree is a bad design for this purpose but the lack of respect toward it and it's authors that comes across in some presentations seems detrimental to the discussion of the engineering.

So to sum up the slight gripe here: engineers don't buy silver-bullet presentations. A little more clarity on the trade-offs is important to convince us to take the extraordinary benchmark results seriously. 

[edit] On reflection the previous statement goes too far - I do take the results seriously my point was more that they may seem "to good to be true" without a little more clarity on the limitations. [/edit]

### My Questions

I have a number of questions that I feel the literature about LMDB doesn't cover adequately. Many of these are things I can and will find out for myself through experimentation but I'd like to make them public so anyone with experience might weigh in on them and further the community understanding.

Most of these are not really phrased as questions, more thoughts I had that literature does not address. Assume I'm asking the author or anyone with insight their thoughts on the issues discussed.

To reiterate, I don't claim to be an expert. Some of my assumptions or understanding that lead the the issues below may be wrong - please correct me. Some of these issues may not be at all important in many use cases too. But I'm interested to understand these areas more so please let me know if you have thoughts or preferably experience with any of this. (You can comment on this block if you click the link at the bottom!)

#### Write Amplification

It seems somewhat skimmed over in LMDB literature that the COW B-tree design writes multiple whole pages to disk for every single row update. That means that if you store a counter in each entry then an increment operation (i.e, changing 1 or 2 bits) will result in some number of *pages* (each 4kb by default) of DB written to disk. I've not worked out the branching factor given page size for a certain average record size but I guess in realistic large DBs that could be in the order of 3-10 4k pages written for a single bit change in the data.
  
All that is said is that "it's sequential IO so it's fast". I understand that but I'd like to understand more of the qualifiers. For leveldb in synchronous mode you only need to wait for the WAL to have the single update record appended. Writing 10s of bytes vs 10s or 100s of kbytes for *every update* surely deserves a little more acknowledgement.

In fact if you just skimmed [the benchmarks](http://symas.com/mdb/microbench/) you might have missed it but in *all* write configurations (sync, async, random, sequential, batched) except for batched-sequential writes, leveldb performs better, occasionally significantly better.

Given that high update throughput is a strong selling point for leveldb and the fact that LMDB was designed initially for a high-read ratio use case I feel that despite the presence in stats all of the rest of the literature seems to ignore this trade-off as if it wasn't there at all.

#### File Fragmentation

The free-list design for reclaiming disk space without costly garbage collection or compaction is probably the most important advance here over other COW B-tree designs. But it seems to me that the resulting fragmentation of data is also overlooked in discussion.

It's primarily a problem for sequential reads (i.e. large range scans). In a large DB that has been heavily updated, presumably a sequential read will on average end up having to seek backwards and forwards for each 4k page as they will be fragmented on disk.

One of the big benefits of LSM Tree and other compacting designs is that over time the majority of the data ends up in higher level files which are large and sorted. Admittedly, with leveldb, range scans require a reasonable amount of non-sequential IO as you need to switch between the files in different levels as you scan. 

I've not done any thorough reasoning about it but seems from my intuition that with leveldb the relative amount of non-sequential IO needed will at least remain somewhat linear as more and more data ends up in higher levels where it is actually sequential on disk. With LMDB it *seems* to me that large range scans are bound to perform increasingly poorly over the life of the DB *even* if the data doesn't grow at all, just updates regularly.

But also, beyond the somewhat specialist case of large range scans, it seems to be an issue for writes. The argument given above is that large writes are OK because they are sequential IO but surely once you start re-using pages from the free list this stops being the case. What if blocks 5, 21 and 45 are next free ones and you need to write 3 tree pages for your update? I'm aware there is some attention paid to trying to find contiguous free pages but this seems like it can only be a partial solution.

The micro benchmarks show writes are already slower than leveldb but I'd be very interested to see a long-running more realistic benchmark that shows the performance over a much longer time where fragmentation effects might become more significant.


#### Compression

The LMDB benchmarks simply state that "Compression support was disabled in the libraries that support it". I understand why but in my opinion it's a misleading step.

The author states "any compression library could easily be used to handle compression for any database using simple wrappers around their put and get APIs". But that is totally missing the point. Compressing each individual value is a totally different thing to compressing whole blocks on disk. 

Consider a trivial example: each value might look like `{"id": 1234567, "referers": ["http://example.com/foo", "https://othersite.org/bar"] }`. On it's own gzipping that value is unlikely to give any real saving (the repetition of 'http' possibly but the gzip headers is more than the saving there). Whereas compressing a 4k block of such results is likely to give a significant reduction even if it is only in the JSON field names repeated each time.

This is a trivial example I won't pursue and better serialisation could fix that but in my real-world experience most data even with highly optimised binary serialisation often ends up with a lot of redundancy between records - even if it's just in the keys. Block compression is MUCH more effective for the vast majority of data types than the LMDB author implies with that comment.

Leveldb's file format is specially designed in such a way that compression is possible and effective and it seems Google's intent is to use it as a key part of the performance of the data structure. Their own benchmarks show performance gains of over 40% with compression enabled. And that is ignoring totally the size on-disk which for many will be a fairly crucial part of the equation especially if relatively expensive SSD space is required.

One argument might be that you could apply compression at block level to LMDB too but I don't think it would be easy at all. It seems like it relies on fixed block size for it's addressing and compressing contents and leaving blanks gives no disk space saving and probably no IO saving either since all 4k is likely still read from disk.

I'm pretty wary of the benchmarks where leveldb has compression off since I see it as a fairly fundamental feature of leveldb that it is very compression friendly. Any real implementation would surely have compression on since there are essentially no downsides due to the design. It's also baked in (provided you have the snappy lib) and on by default for leveldb so it's not like it's an advanced bit of tuning/modification from basic implementation to use compression for leveldb.

Maybe I'm wrong and it's trivial to add effective compression to LMDB but if so, and doing it would give ~40% performance increase why is it not already done and compared?

I'd like to see the benchmarks re-run with compression on for leveldb. Given writes are already quicker for leveldb this more realistic real-world comparison might well give a better insight into the tradeoffs of the two designs. If I get a chance I will try this myself.

#### Large Transactions Amplify Writes Even Further

LMDB makes a big play of being fully transactional. It's a great feature and implemented really well. My (theoretical) problem is to do with write performance - we've already seen how writes can be slower due to COW design but how about the case when you update many rows in one transaction. 

Consider worst case that you modify 1 row in every leaf node, that means that the transaction commit will re-write every block in the database file. I realise currently that there is a limit on how many dirty pages can be accumulated by a single transaction but I've also read there are plans to remove this. 

Leveldb by contrast can do an equivalent atomic batch write without anywhere near the same disk IO in the commit path. It would seem this is a key reason leveldb is so much better in random batch write mode. Again I'd love to see the test repeated with leveldb compression on too. 

It may not be a problem for your workload but actually it might. Having certain writes use so much IO could cause you some real latency issues and given single writer lock, could give you similar IO-based stalls that leveldb is known for due to it's background compaction.

I'll repeat this is all theoretical but I'd want to understand a lot more detail like this before I used LMDB in a critical application.

#### Disk Reclamation

Deleting a large part of the DB does not free any disk space for other DBs or applications in LMDB. Indeed there is no built in feature or any tools I've seen that will help you re-optimise the DB after a major change, nor help migrate one DB to another to reclaim the space. 

This may be a moot point for many but for practical systems, having to solve these issues in the application might add significant work for the developer and operations teams where others (leveldb) would eventually reclaim the space naturally with no effort.

## Summary

I feel to counter the potentially negative tone I may have struck here, I should sum up by saying LMDB looks like a great project. I'm genuinely interested in the design and performance of all the options in this space.

I would suggest that a real understanding of the strengths *and weaknesses* of each option is an important factor in making real progress in the field. I'd humbly suggest that, if the author of LMDB was so inclined, including at least some discussion of some of these issues in the docs and benchmarks would benefit all. 

I'll say it again if Howard or anyone else who's played with LMDB would like to comment on any of these issues, I'm genuinely interested to hear.

So is LMDB a leveldb killer? I'd say it seems good, but more data required.
