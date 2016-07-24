---
title: PHP 'Mixins' Coming Soon!
---

**I posted a while back about [PHP's lack of decent support for multiple inheritance](), and concluded that Mixin like behaviour just wasn't natural to PHP as it stands. PHP 5.4 looks like it will change that with the addition of traits.**

Simas Toleikis [introduces traits](http://simas.posterous.com/new-to-php-54-traits) in a great blog post. I'm excited, it looks like it could solve many of the issues I bemoaned PHP as lacking.

Since I have no first hand experience, I'll regurgitate this example from Simas' post above to whet your appetite.

	::php::
	trait Singleton {
		public static function getInstance() { ... }
	}

	class A {
		use Singleton;
		// ...
	}

	class B extends ArrayObject {
		use Singleton;
		// ...
	}

	// Singleton method is now available for both classes
	A::getInstance();
	B::getInstance();
	
This is a major win for PHP.