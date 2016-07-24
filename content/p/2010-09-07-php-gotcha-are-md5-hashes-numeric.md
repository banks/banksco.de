---
title: 'PHP Gotcha: are MD5 hashes numeric?'
---

**A bizarre bug just came up at work: a query in a cron script failed last night for no apparent reason even though thousands of queries are run by the same bit of code every day. The reason: an MD5 hash being incorrectly identified as a number in exponential form.**

Firstly I guess I should point out that yes MD5 hashes *are* numeric, however in PHP `md5()` returns a string containing the hex digest. For this reason MD5 hashes are generally considered and used as strings in PHP.

We have a Database API at work that provides automatic escaping of values based on their type. It uses PHPs `is_numeric()` to determine if the value should be left unquoted as an integer or float.

One thing that isn't likely to come up much (but typically just did) is that `is_numeric()` also recognises numbers in exponential form `1234e34`. We had an issue where we were inserting an MD5 hash (a string) into a varchar field. But got an error from MySQL:

	Illegal double '937e3019763158166689073439699767' value found during parsing
	
I took a look at this for a bit and then realised that the value was unquoted and contained only digits and 'e'.

We've put in a little more logic now that assumes that any string of exactly 32 chars and containing only hex digits (hint: `ctype_xdigit()`) is treated as a string!