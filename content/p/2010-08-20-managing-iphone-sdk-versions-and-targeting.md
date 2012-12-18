---
title: Managing iPhone SDK versions and targeting
---
**There are many subtleties when deploying apps with the iPhone SDK. One I have spent much time fiddling with in the past and actually got to the bottom of today is the difference between *Base SDK* and *Deployment Target*.**

I spent an hour or so today jumping through the familiar hoops of getting some updates into our iPhone app at work. The latest updates involve dealing with background state transitions which requires accessing new API methods added in iOS 4.

The SDK docs do describe well how to ensure that API methods exist before calling version specific methods (using respondsToSelector).

The problem came when compiling for distribution. We ended up with an error saying:

	undeclared UIApplicationWillEnterForegroundNotification
	
This was because, in an attempt to make the application as widely usable as possible I'd set the *Base SDK* setting to iPhone 3.

Clearly this means you can't use iOS 4 specific API calls. The trick is to set the *Base SDK* to the *latest* version and then set the *iPhone OS Deployment Target* option to be the lowest version you wish to support. This way you can (conditionally) use all the latest API calls. 

In this configuration, newer APIs are weakly linked which means that, provided you check APIs exist before accessing them as mentioned above, you app will still run on older OS versions with no compile or runtime errors.

With hindsight it seems obvious but it was one of those things that took a bit of effort to grasp.