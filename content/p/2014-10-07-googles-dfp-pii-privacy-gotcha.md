---
title: Google's AdSense/DFP PII Privacy Gotcha
---

**Google AdSense (and other advertising products) appear to have turned on a new detection system for violations of their <abbr title="Personally Identifiable Information">PII</abbr> policy. Here are a couple of easy steps to fall foul of it without meaning to.**

### What is a PII (Personally Identifiable Information) Violation?

[Google's support document for their privacy policy](https://support.google.com/platformspolicy/answer/6026583?hl=en) describes the issue well.

Specifically the line:

> In particular, please make sure that pages that show ads by Google do not contain your visitors' usernames, passwords, email addresses or other personally-identifiable information (PII) in their URLs.

Easy right? Just don't be dumb and pass the visitors info in URL.

Here are a couple of ways to fail at that automatically - you may well be doing them yourself right now.

### Fail #1: Your Search Results Page

If like every other site on the Internet, you have a search feature, and like every other search engine (copying Google themselves) you present the search results at a URL with the user's query in a GET parameter e.g. `search/?q=ponies`, then you will probably violate AdSense policy eventually.

All but one of the handful of breach notifications I've come across from Google are due to people searching for an email address. That obviously results in a URL that looks like `search/?q=user@exmaple.com` and Google's apparently new automated detection of PII violations flags that.

As an aside, it's quite likely that they are not searching for their *own* email address and so it's not really PII, but who can know? Google will see an email address in URL and call it a breach.

But that's pretty standard behavior for a search box right? We'll see what we can do in a bit.

### Fail #2: Users Saving Your Content For "Offline Use"

Less obviously, you may have users who like to "save" pages on your site for "offline" use. Of course if they really are offline when they view it they will not make any ad requests to Google and you'll be fine.

But in at least one case I've come across, a user saved a page on a site which uses Google AdSense to a folder on their machine like `/Users/name@example.com/stuff/your-page.htm`. They must have loaded this in their browser while still online and the resulting ad calls from the JS embedded in the page when they saved it fire off to Google with `?url=file:///Users/name@example.com/...` in the URL, violating their policy.

### Anti-Solution

Actually in both of these cases it's a little hard to find a good solution. For the first you could perhaps have a special encoding of email addresses in search JS but that goes against the spirit of the policy - the email info is still there if it is in fact PII (probably not if visitor is searching for it but there you go). Not to mention relying on JS instead of regular GET form submission.

It's a nasty hack and misses many other cases. The second example is one of the many possible reasons you would probably never consider which would not be covered by sticking plasters like that.

### Solution

It would seem the most pragmatic solution is to adjust your ad serving logic to scan URL and referrer for email addresses and just opt to not show ads on that page if you find any. Hopefully it's rare enough not to lose you too much revenue and the alternatives are likely more expensive.

One thing to note though: checking for email addresses on server side is probably not enough. It wouldn't have caught that second case above and there are many other cases where it might not work.

So if you rely totally on Google's provided libraries to display your ads, you may need to write a small wrapper to handle this case on the client side. It seems like this should be something Google's JS does automatically or at least something you can opt-in to.