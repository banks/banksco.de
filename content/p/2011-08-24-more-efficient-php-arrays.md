---
title: More Efficient PHP Arrays
---
**One of my first posts here was about [how surprisingly inefficient PHP arrays can get](http://blog.banksdesigns.co.uk/post/when-not-to-use-arrays-in-php). Today I learned of a solution that is probably a lot better than my PHP string serialisation. It's an extension called [intarray](https://github.com/dynamoid/intarray).**

The extension exposes integer-only arrays as strings to PHP but provides [several useful methods for interacting with them](https://github.com/dynamoid/intarray/blob/master/intarray.php) such as sort, slice and binary search. This means if you are using PHP arrays to store sets of integers, you will likely see a very large improvement in speed and memory usage using this extension.

I've yet to do any real benchmarking but I thought I'd post this as a follow-up from my original post. I know at least one very large site who has used this extension in production with no issue although I obviously urge anyone to evaluate stability etc of any software themselves before deploying.
