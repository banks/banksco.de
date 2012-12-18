---
title: Opera's fixed position problem
---
**Opera has a bug with `node.offsetTop` when the node has a fixed position ancestor. That has been [know about for a while](http://www.greywyvern.com/code/opera/bugs/PositionFixedoffsetTop). I didn't think it would take me three separate days of pain to get a handle on.**

It turns out that it's quite a lot more complex than that page linked above suggests. At work we have an old utility library called `Ruler.js` which does a lot of things relating to measuring element positions relative to all sorts of things. While trying to fix a JS positioning issue caused by this Opera bug I though I could simply correct it by compensating for Opera's extra scroll pixels for fixed position nodes in the offset hierarchy.

The problem is that Opera isn't even consistently wrong. It only breaks for elements with `display: inline` or `inline-block` (as far as I can tell) and only if they are positioned relatively (either explicitly or implicitly).

What is more, if there is any other element in the offset hierarchy between the element you are measuring and the fixed position one, then the results change. In some cases an explicit `position:relative` fixes the behaviour completely.

A [totally non-exhaustive demo](http://jsfiddle.net/XgyWV/5/) shows how odd some results can be. Note that this doesn't really demo the extent of the problems when trying to walk up the offset tree and correct for scroll position etc which was what made the real diagnostics so much more complex.

Here is the output in Safari 5 and Opera 11.10 side by side: 

![Screen shot of jsFiddle demo](http://cl.ly/3B3b0P0c2b171j1p3M3C/content)

So there turned out to be no sensible way to even detect if the position had been mangled by Opera in JS. I resorted to having to add `position:relative` to a parent element where it had no other affect to resolve this case. That also means I'll probably run into this again in the future so i thought I'd document it here!

