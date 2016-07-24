---
title: PHPUnit's Expensive SetUp
---

**I've been working a lot with [PHPUnit 3.5](https://github.com/sebastianbergmann/phpunit/) recently. It's good in many ways but it is not fast. That's understandable perhaps given the feature set but there is one apparently obvious oversight which totally ruins the experience.**

The problem I'm talking about I've [reported as a possible bug](https://github.com/sebastianbergmann/phpunit/issues/261) and yet it has gotten zero attention in over two months. I'll describe it again here.

### The Problem

PHPUnit has a whole multitude of ways to construct a test suite and pick which test to run. Using the command line runner, you can specify specific test case files or dirs and you can use `filter` and `group` options to further restrict.

The problem is that, whatever you pass as `filter` or `group` arguments, all `setUp()` and `setUpBeforeClass()` methods in all test cases loaded will be run. That's because [filtering is applied after setup methods called](https://github.com/sebastianbergmann/phpunit/blob/3.5/PHPUnit/Framework/TestSuite.php#L653). I really don't see the rationale behind that decision.

At work we have a large test suite. One part of it is for our database layer and as such has some very expensive setup routines which setup an entire test environment in our test db. Even when you limit the runner to a specific test case, that may mean this very expensive setup operation has to run for every test in the file - even when you are just trying to work with a single test method.

But we shouldn't have to fiddle about with specifying specific test cases. The `filter` and `group` options are powerful and (should be) very useful for cherry picking from a suite. This seemingly obvious error totally ruins them and makes working with big test suites decidedly awkward.

Even more confusing is the fact that no-one else I've seen online seems to think this is a problem. I've found no other mention of the behaviour and zero interest in my ticket. Did I miss something here? Is there an obvious reason that setup should be run all the time even when filtering tests? All my colleges and other PHP developers I've mentioned this to personally seem to agree it is very odd behaviour. I'd have expected many people to be using PHPUnit with large suites. Does no one else wonder why running a single simple test can take minutes?

I hope I can update this post when something changes, but I've not been encouraged by the response to my ticket so far.