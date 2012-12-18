---
title: Trying to make JS go OO
---
**At work, we use a version of [Base.js by Dean Edwards](http://dean.edwards.name/weblog/2006/03/base/) to standardise object inheritance and make our JavaScript somewhat more Object Oriented. Today I came across a quirk.**

Now the problem I found isn't with Base.js really - it's an inherent feature of JS's prototyping and object model, however it was made more confusing by Base.js apparently giving you 'class' like definition of objects. After discussing some unintuitive behaviour with [my colleagues](http://dt.deviantart.com) it became clear that this is basic JavaScript behaviour despite being somewhat confusing at first. 

I'm sure this issue has been brought up in other Base.js discussions before, in fact Dean's latest version may even have solved it - we are using a somewhat legacy version. But the underlying JS issue was interesting to me so I thought I'd write it up for future reference.

### Instance properties

If you don't know what Base.js does, read about it on [Dean's blog](http://dean.edwards.name/weblog/2006/03/base/). This basic example shows the creation of a 'Class' with a property which behaves as you would expect:

	::javascript::
	var TestClass = Base.extend({
		prop: null,
	});
	var a = new TestClass, b = new TestClass;
	a.prop = 'A';
	console.log(a.prop, b.prop); // Log: A null

But what if your property was an array?

	::javascript::
	var TestClass = Base.extend({
		prop: [],
	});
	var a = new TestClass, b = new TestClass;
	a.prop.push('A');
	b.prop.push('B');
	console.log(a.prop, b.prop); // Log: ["A", "B"] ["A", "B"]

Wait, what happened there?

Well if you think about what Base.js is doing, it is kind of obvious. JavaScript ALWAYS points to references of objects. That is, any variable that is not a primitive type is a reference.

Consider the non-Base.js equivalent of above (roughy the same as what Base.js is doing under the hood):

	::javascript::
	var TestClass = function(){};
	TestClass.prototype.prop = []; // Assigning a pointer to this specific empty array
	var a = new TestClass, b = new TestClass;
	a.prop.push('A');
	b.prop.push('B');
	console.log(a.prop, b.prop); // Log: ["A", "B"] ["A", "B"]

Here it is somewhat more obvious what happens. Each instance 'inherits' the `prop` property from it's prototype but that isn't *an* empty array, it is a pointer to the *specific* array the prototype was initialised with.

So the solution is to do this initial assignment in the constructor:

	::javascript::
	var TestClass = Base.extend({
		prop: [],
		constructor: function(){
			this.prop = []; // this is now this instance, creating a new array just for this instance
		}
	});
	var a = new TestClass, b = new TestClass;
	a.prop.push('A');
	b.prop.push('B');
	console.log(a.prop, b.prop); // Log: ["A"] ["B"]
	
Or the equivalent non-base code:

	::javascript::
	var TestClass = function(){
		this.prop = [];
	};
	var a = new TestClass, b = new TestClass;
	a.prop.push('A');
	b.prop.push('B');
	console.log(a.prop, b.prop); // Log: ["A"] ["B"]
	
### Back to basics

This is really very basic Javascript but pseudo-OO frameworks like Base.js (which are great in many ways) can make this behaviour seem even more unintuitive. My take-away is that understanding JavaScript properly is as important as ever despite the great abstractions and frameworks that let us ignore many of the details of how it works most of the time.
