---
title: PHP and the XOR swap trick
---
**An exercise most programmers are shown when first being introduced to bit arithmetic is how to swap the values of variables without using a third. The answer is the XOR (eXclusive OR) trick.** 

For some reason this came to mind this morning and I wondered - what happens in PHP if you try to XOR non integer data types? I could probably have looked it up but a 2 minute script showed me the answer: PHP casts whatever value to an int before performing the operation. So no, you can't neatly swap two arrays or objects or even strings without a temporary variable. Oh well.

For those who've not come across it before. Here is the magic I'm talking about. If you don't believe it works at first, grab a pencil and paper and work through the binary maths for yourself...

	::php::
	$a = 1;
	$b = 2;

	echo "a: ".$a.", b: ".$b."\n";

	// Do the swap
	$a ^= $b;
	$b ^= $a;
	$a ^= $b;

	// All done
	echo "a: ".$a.", b: ".$b."\n";

Result:

	a: 1, b: 2
	a: 2, b: 1
