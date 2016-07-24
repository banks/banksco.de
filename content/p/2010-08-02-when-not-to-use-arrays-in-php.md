---
title: When not to use arrays in PHP
---

**Arrays in PHP are actually pretty inefficient at storing lots of small bits of data.**

I think I read that a single integer in an array uses 58 bytes of memory. Now that is not worth thinking about in most PHP applications, but it can matter when your arrays get big.

At work, I've recently been working on a system for highly customisable targeting in email newsletters. Part of the challenge here is writing the newsletter sender capable of sending 400,000+ emails with each one potentially targeted at the specific user efficiently.

For speed, we ended up pre-calculating which bits of content got rendered for each user to avoid the query overhead in the sending loop. This required storing a two-dimensional array, indexed by user ID, with an array of content IDs applicable to each user. It looked something like this:

	::php::
	array(
		1 => array(1, 2, 3, 4),
		2 => array(2, 4, 3, 5),
		...
	);
	
But with around 400,000 elements. I was amazed that this array alone took up over 400MB of memory!

I did some benchmarks and found some quite surprising things.

If I changed the array so each user had a comma separated string instead of an array, it shrank the memory requirements down by around 75%.

I suspected though that I would pay for this saving in execution speed - surely it is much slower to have to explode each value manipulate the array and implode again than just direct access right? 

Actually, no! I can only guess as to why that might be - less RAM to read/write/seek perhaps? It is actually over 60% quicker to use strings in this case!

You probably don't quite believe me so [here is a little script](http://gist.github.com/505177) to illustrate the point. Feel free to run it yourself.

And the result:

	Memory for 2D:		107.81MB
	Memory strings:		23.89MB
	Time for 2D:		6.47 seconds
	Time strings:		2.32 seconds

