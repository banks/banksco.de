---
title: Quick benchmarks with jsFiddle
---
**At work this week a colleague asked if anyone could think of an optimisation for extracting a rectangular subset of pixel data from an HTML 5 [CanvasPixelArray](http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#canvaspixelarray). I tried a few things with [jsFiddle](http://www.jsfiddle.net).**

My main idea was that rather than iterating through every pixel and comparing coordinates (`O(n)` running time), you could loop through rows of pixels and remove just the selected ones with `Array.slice()`.

I put together a quick test case with a simplified integer array and tried this. Turns out that although there are fewer iterations, using JS array `slice()` and `concat()` is much much slower probably due to multiple memory copies needed to satisfy them.

You can see and play with [my test case on jsFiddle](http://jsfiddle.net/pUY7u/2/).

Note that you can make significant savings over the completely naive `O(n)` case by selecting loop boundaries such that only required rows are iterated and then, only required x value extracted with a nested loop. The running time of this case becomes something like `O(k)` where `k` is the number of pixels within the required selection which is strictly `<= n` but probably significantly smaller in most use-cases.

In algorithmic terms this is not a particularly surprising or ground-breaking result. My colleague has probably already found a better solution anyway. My take away was: jsFiddle is great for quick benchmarking and prototyping of solutions. 

It makes it trivial to construct test cases and share and develop them with others. I did have one glitch triggered by my JS code getting too long for the textarea and causing the UI to 'scroll' but with no way to get it back. But even then a cut, refresh and paste got me back on my feet. And given it's 'alpha' status this is a relatively small complaint.
