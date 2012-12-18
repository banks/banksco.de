---
title: PHP Gotcha: Strings are Arrays Too
---
**Actually the title is misleading - but they can at times *seem* like arrays. This just came up at work and although it is one of those things which seems obvious after, it highlights a potentially dangerous and error-prone design pattern.**

Basically we had a function that looked essentially like this:

	::php::
	function error_prone($options) {
		if ( ! isset($options['required_key'])) {
			// throw error
		}
		
		// Manipulate $options['keys'] and return a result
	}
	
At first glance this looks fair enough - while not completely robust, if a badly formed array (without required key) or a non-array is passed it should throw an error right?

Wrong. Due to PHP's doubling up of square brackets to work as character manipulation of strings.

If you don't know what I mean, try this:

	::php::
	$string = 'Hello World!';
	echo $string[0]; // prints: H
	echo $string['1']; // prints: e

Now the really unintuitive bit is highlighted on the last line. When you are specifying your character offset, PHP in all it's type-mangling wisdom, allows any variable type and casts to an int. 

What does this mean for our function above? Well, in some bad cases, $options was being passed a string instead of an array. This was due to another error - but at first glance it seems our error checking should have caught that. What actually happens when a string is passed is:

1.  `$options['required_key']` return first char of `$options` string since `(int) 'required_key'` is `0`
2. `isset($options['required_key'])` therefore returns true!
3. Code below mangles up some terrible return value based on chars in the string (mostly the first one) rather than actual options.
4. Final result is baffling and actual source of error is obfuscated

### Solution

It really isn't hard to fix: either type hint the function declaration:

	::php::
	function not_so_error_prone(array $options)
	
And handle the errors/exceptions nicely, or actually explicitly test arrayness with `is_array()`.

This is a silly mistake but one that can be easily overlooked when reviewing code unless you pay close attention.

	
	