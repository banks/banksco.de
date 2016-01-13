---
title: "The State of Real-Time Web in 2016"
---

I've been working on infrastructure for real-time notifications for a high-traffic site on and off for a few years, and recently been contributing to [Centrifuge](https://github.com/centrifugal).

This post is an attempt to sum up how I see the state of the relevant technologies at the start of 2016.

I'll walk through the various techniques for delivering real-time message to browsers. There are good resources for details of each, so I'll instead focus on the gotchas and incompatibilities I've come across that need to be accounted for in the wild.

This information is a mixture of first-hand experience and second-hand reading mostly of well-tested libraries such as [SockJS](https://github.com/sockjs), [socket.io](https://github.com/socket.io) and [MessageBus](https://github.com/SamSaffron/message_bus).

## WebSockets

It's 2016. We are officially in [the future](http://www.october212015.com/). [WebSockets](https://en.wikipedia.org/wiki/WebSocket) are a real standard and are [supported in all recent major browsers](http://caniuse.com/#search=websockets).

That should really be the end of the article but, as always, it isn't.

Sam Saffron (the author of [MessageBus](https://github.com/SamSaffron/) and Co-Founder of [Discourse](https://www.discourse.org/)) recently blogged about [why WebSockets are not necessarily the future](https://samsaffron.com/archive/2015/12/29/websockets-caution-required). I found his post truly refreshing as I've run into almost all of the pain points he describes.

That said, Sam's post is focusing on the case where your WebSocket/streaming/polling traffic is served by the same application and same servers as regular HTTP traffic.

There are many reasons I've experienced which suggest this _might_ not be the best approach at scale. Sam even mentions this in his article. I can't say it's always a bad one - Discourse itself is proof that his model can work at scale - but I've found that:

 1. Long-lived requests are very different to regular HTTP traffic whether they are WebSockets, HTTP/1.1 chunked streams or just boring long-polls. For one real-life test we increased the number of sockets open on our load balancer by a factor of 5 or more in steady state with orders-of-magnitude higher peaks during errors causing mass-reconnects. For _most_ websites, real-time notifications are a secondary feature; failure in a socket server or overload due to a client bug really shouldn't be able to take out your main website and the best way to ensure that is to have the traffic routed to a totally different load balancer at DNS level (i.e. on a separate subdomain).

 2. If your web application isn't already an efficient event-driven daemon (or have equivalent functionality like Rack Hijack) long-lived connections in main app are clearly a bad choice. In our case our app is PHP on apache. So handling long-lived connections _must_ occur on separate processes (and in practice servers) with suitable technology for that job.

 3. Scaling real-time servers and load balancing independently of your main application servers is probably a good thing. While load balancing tens or hundreds of thousands of open connections might be a huge burden to your main load balancer as in point 1, you can probably handle that load with an order of magnitude or two fewer socket servers than are in your web server cluster if you are at that scale.

But with those points aside, the main thrust of Sam's argument that resonates strongly with my experience is that **most apps don't need bidirectional sockets** so the cons of using WebSockets listed below can be a high price for a technology you don't really need. [Sam's article](https://samsaffron.com/archive/2015/12/29/websockets-caution-required) goes into more details on some of the issues and includes others that are not as relevant to my overview here so worth a read.

### WebSocket Pros

 - Now supported in all modern browsers.
 - Efficient low-latency and high-throughput transport.
 - _If_ you need low-latency, high-throughput messaging back to the server they can do it.
 - Super easy API - can make a toy app in an hour.

### WebSocket Cons
 - Despite wide browser support, they are still not perfect: IE 8 and 9 and some other older mobile browsers need fallbacks anyway if you care about wide compatibility
 - There were many revisions and false starts in the history of the WebSocket protocol, in practice you still have to support old quirky protocol versions on the server for wide browser coverage. Mostly this is handled for you by libraries but it's unpleasant baggage nonetheless.
 - Even when supported in browser, there are many restrictive proxies and similar in the wild that don't support WebSockets or which close connections after some short time regardless of ping activity. If you use SSL things improve a lot as proxies don't get to mangle the actual protocol, but still not perfect.
 - Due to the two issues above, you almost certainly need to implement fallbacks to other methods anyway, probably using a well-tested library as discussed below.
 - They work against HTTP/2. Most notably multiple tabs will cause multiple sockets always with WebSocket, whereas the older fallbacks can all benefit from sharing a single HTTP/2 connection even between tabs. In the next few years this will become more and more significant.
 - You have to choose a protocol over the WebSocket transport. If you do write data back with them, this can end up duplicating your existing REST API.

## WebSocket Polyfills

One of the big problems with WebSockets then is the need to support fallbacks. The sensible choice is to reach for a tried and tested library to handle those intricate browser quirks for you.

The most popular options are [SockJS](https://github.com/sockjs) and [socket.io](https://github.com/socket.io).

These are both fantastic pieces of engineering, but once you start digging into the details, there are plenty of (mostly well-documented) gotchas and quirks you might still have to think about.

My biggest issue with these options though is that they aim to transparently provide full WebSocket functionality which we've already decided isn't actually what we need most of the time. In doing so, they often make design choices that are far from optimal when all you really want is server to client notifications. Of course if you actually do _need_ bi-directional messaging then there is not a lot to complain about.

For example, it is possible to implement subscription to channel-based notifications with a single long-poll request:

 - Client sends request for `/subscribe?channels=foo,bar`
 - You wait until there is data then request returns (or times out)
 - Authentication and resuming on reconnect can be handled by passing headers or query params in a stateless way

Yet if you are using a WebSocket polyfill, it's likely that you use some sort of PubSub protocol on top of the abstracted WebSocket-like transport. Usually that means you connect, then send some sort of handshake to establish authentication, then one or more `subscribe` requests and then wait for messages. This is how most open source projects I've seen work (e.g. [Bayeux protocol](https://docs.cometd.org/current/reference/#_concepts_bayeux_protocol)).

All is fine on a real WebSocket but when the transport transparently reverts to plain old long-polls, this starts to get significantly more complicated than the optimal, simple long-poll described above. Each of the handshake and subscribe messages might need to be sent in separate requests. SockJS handles sending on a separate connection to listening.

Worse is that many require that you have sticky-sessions enabled for the polling fallback to work at all since they are trying to model a stateful socket connection over stateless HTTP/1.1 requests.

The worst part is the combination: poor support for load balancing WebSockets in most popular load balancers and sticky session support. That means you may be forced to use Layer 4 (TCP/TLS) balancing for WebSockets _but_ you can't ensure session stickyness if you do. So SockJS and the like just can't work behind this kind of load balancer. [HAProxy](http://www.haproxy.org/) is the only one of the most popular load balancing solutions I know of that can handle Layer 7 WebSocket balancing right now which is a pain in AWS where ELBs give you auto-scaling and bypass the need to mess with keepalived or other HA mechanism for your load balancer.

To be clear, the benefits of not reinventing the wheel and getting on with dev work probably outweigh these issues for many applications, even if you _don't_ strictly need bi-directional communication. But when you are working at scale the inefficiencies and lack of control can be a big deal.

### WebSocket Polyfill Pros

 - For the most part they just work, almost everywhere.
 - The most widely used ones are now battle hardened.
 - Leave you to write your app and not think about the annoying transport quirks described here.

### WebSocket Polyfill Cons

- Usually require sticky sessions for fallbacks to work.
- Usually less efficient and/or far more complex than needed for simple notification-only applications when falling back due to emulating bi-directional API.
- Can run into issue like exhausting connections to one domain in older browsers and deadlocking if you make other `XMLHttpRequest`s to same domain.
- Usually don't give you good control of reconnect timeouts and jitter which can limit your ability to prevent thundering herds or reconnections during incidents.

## Server Sent Events/EventSource

The [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) has been around a while now and enjoys decent browser support - on par with WebSockets. It interacts with a server-protocol named [Server Sent Events](https://html.spec.whatwg.org/multipage/comms.html#server-sent-events). I'll just refer to both as "EventSource" from now on.

At first glance it looks ideal for the website notification use-case I see being so prevalent. It's not a bidrectional stream; it uses only HTTP/1.1 under hood so works with most proxies and load balancers; long-lived connection can send multiple events with low latency; has a mechanism for assigning message ids and sending cursor on reconnect; browser implementations transparently perform reconnects for you.

What more can you want? Well...

### EventSource Pros

 - Plain HTTP/1.1 is easy to loadbalance at Layer 7.
 - Not stateful, no need for sticky sessions (if you design your protocol right).
 - Efficient for low-latency _and_ high-throughput messages.
 - Built in message delimiting, ids, and replay on reconnect.
 - No need for the workarounds for quirks with plain chunked encoding.
 - Can automatically take advantage of HTTP/2 and share a connection with any other requests streaming or otherwise to the same domain (even from different tabs).

### EventSource Cons

- No IE support, not even IE 11 or Edge.
- Never made it past a [draft proposal](https://w3c.github.io/eventsource/), is no longer being worked on and remains only in the [WhatWG living standard](https://html.spec.whatwg.org/multipage/comms.html#server-sent-events). While it should still work for some time in supported browsers, this doesn't feel like a tech that people are betting on for the future.
- Browser reconnect jitter/back-off policy is not under your control which could limit your ability to mitigate outages at scale just as with WebSocket Polyfills above.
- Some older browser versions have incorrect implementations that look the same but don't support reconnecting or CORS.
- Long-lived connections can still be closed early by restrictive proxies.
- Streaming fallbacks below are essentially the same (with additional work to implement reconnect, data framing and message ids) with better browser support - you probably need them anyway for IE.

## XMLHttpRequest/XDomainRequest Streaming

Uses the same underlying mechanism as EventSource above: HTTP/1.1 chunked encoding on a long-lived connection, but without browser handling the connection directly.

Instead `XMLHttpRequest` is used to make the connection. For cross-domain connections [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) must be used, or in IE 8 and 9 that don't have CORS support, the non-standard `XDomainRequest` is used instead.

These techniques are often refered to as "XHR/XDR Streaming".

### XHR/XDR Streaming Pros

 - Plain HTTP/1.1 is easy to loadbalance at Layer 7.
 - Not stateful, no need for sticky sessions (if you design your protocol right).
 - Efficient for low-latency _and_ high-throughput messages.
 - Can automatically take advantage of HTTP/2 and share a connection with any other requests streaming or otherwise to the same domain (even from different tabs).
 - Works in vast majority of browsers right back to IE 8 and relatively early versions of other major browsers.

### XHR/XDR Streaming Cons/Gotchas

- Still doesn't work (cross domain) in really old browsers like IE 7.
- `XDomainRequest` used as fallback for IE 8 and 9 doesn't support cookies so you can't use this if you require both cross domain connection _and_ cookies for auth or sticky sessions.
- `XDomainRequest` also doesn't support custom headers. Possibly not a big deal but notable if you are trying to [emulate EventSource](https://github.com/Yaffle/EventSource/#server-side-requirements) which uses custom headers for retry cursor.
- Long-lived connections can still be closed early by restrictive proxies.
- Even well-behaved proxies will close idle connections, so your server needs to send a "ping" or heartbeat packet. Usually this is sent every 25-29 seconds to defeat 30 second timeouts reliably.
- There is a subtle memory leak: the body text of the HTTP response grows and grows as new messages come in consuming more memory over time. To mitigate this, you need to set some limit on this body size and when it's passed close and re-open connection.
- In order to defeat load balancer and proxy connection idle timeouts, server needs to periodically send something. Generally 25 seconds is recommended interval to work around proxies with a 30 second timeout.
- IE 8 and 9 don't fire XDR progress handler until they reach some threshold response size. This means you [might need to send 2KB of junk](http://blogs.msdn.com/b/ieinternals/archive/2010/04/06/comet-streaming-in-internet-explorer-with-xmlhttprequest-and-xdomainrequest.aspx) when request starts to avoid blocking your real events. Some other older browsers had similar issues with XMLHttpRequest but these are so rare they probably aren't worth supporting. In practice you can tell if browser supports `XMLHttpRequest.onprogress` as an indicator that it will work without padding.
- [Some browsers](http://stackoverflow.com/questions/26164705/chrome-not-handling-chunked-responses-like-firefox-safari) require `X-Content-Type-Options: nosniff` header otherwise they delay delivering messages until they have enough data to sniff (I've seen reports this is 256 bytes for Chrome).
- You may have to [encapsulate messages in some custom delimiters](https://github.com/SamSaffron/message_bus/blob/master/lib/message_bus/client.rb#L183) since proxies might re-chunk the stream and you need to be able to recover original message boundaries to parse them. Google seems to use HTTP/1.1 chunked encoding scheme inside the response text to delimit "messages" (i.e. chunked encoding inside chunked encoding).
- The big one: some proxies buffer chunked responses, delaying your events uncontrollably. You may want to send a ping message immediately on a new connection and then [revert to non-streaming](https://github.com/SamSaffron/message_bus/blob/master/assets/message-bus.js#L180) in the client if you don't get that initial message through soon enough.

## XMLHttpRequest/XDomainRequest Long-polling

Same as XHR/XDR streaming except without chunked encoding on response. Each connection is held open by server as long as there is no message to send, or until the long-poll timeout (usually 25-60 seconds).

When an event arrives at the server that the user is interested in, a complete HTTP response is sent and the connection closed (assuming no HTTP keepalive).

### XHR/XDR Long-polling Pros

 - Plain HTTP/1.0 (no chunked encoding) is easy to load balance at Layer 7.
 - Can automatically take advantage of HTTP/2.
 - Works even when proxies don't like long-lived connection, or buffer chunked responses for too long.
 - No need for server pings - natural long poll timeout is set short enough.

### XHR/XDR Long-polling Cons

 - Same cross-domain/browser support issues as XHR/XDR streaming.
 - Overhead of whole new HTTP request and possibly TCP connection every 25 seconds or so.
 - To achieve high-throughput you have to start batching heavily either on server or by not reconnecting right away in the client to allow bigger batch of events to queue. If you have lots of clients all listening to high-throughput channel this adds up to a huge amount of HTTP requests unless you ramp up batching to be on order of 20-30 seconds. But then you are trading off latency - is 30 seconds latency acceptable for your "real-time" app?

## JSONP Long-polling

The most widely supported cross-domain long-polling technique is JSONP or "script tag" long-polling. This is just like XHR/XDR long-polling except that we are using [JSONP](https://en.wikipedia.org/wiki/JSONP) to achieve cross-domain requests instead of relying on CORS or XDR support. This works in virtually every browser you could reasonably want to support.

### JSONP Long-polling Pros

- All the pros of XHR/XDR long-polling.
- Works in ancient browsers too.
- Supports cookies everywhere (although if your long poll server is a totally separate root domain browsers third-party cookie restrictions might prevent that).

### JSONP Long-polling Cons

- Largely the same as XHR/XDR Long-polling Cons minus the cross-domain issues

## Polling

Periodically issuing a plain old XHR (or XDR/JSONP) request to a backend which returns immediately.

## Polling Pros

- Very simple, always works, no proxy or load balancing issues
- Can benefit from HTTP/2

## Polling Cons

- Not really "real-time" with an average of half the poll interval latency per message. That might be 5 or 10 seconds.
- Perception is that this is expensive if you service the requests via your regular web app - can easily create orders of magnitude more HTTP request on your web servers. In practice you can use highly optimised path on a separate service to mitigate this.

## Others

There are many other variants I'm missing out as this is already fairly long. Most of them involve using a hidden iframe. Inside the iframe HTML files with individual script blocks served with chunked encoding or one of the above transports receive events and call [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) or a fallback method to notify the parent frame.

These variants are generally only needed if you have requirement to support both streaming _and_ cookie enabled transport for older browsers for example. I won't consider them further.

## The Future(?)

You may have noticed if you use Chrome that Facebook can now send you notifications even when you have no tab open. This is a [Chrome feature](http://techcrunch.com/2015/09/14/facechrome) that uses a new [Web Push standard](https://martinthomson.github.io/drafts/draft-thomson-webpush-http2.html) currently in draft status.

This standard allows browsers to subscribe to any compliant push service and monitor for updates even when your site isn't loaded. When they come in [service workers](https://developers.google.com/web/updates/2015/03/push-notifications-on-the-open-web) can be called to handle the notification.

Great! Soon we won't have to worry about this transport stuff at all. All browsers will support this and all we'll have lovely open-source libraries to easily implement that backend. (But see update below.)

But that's some way off. Currently Chrome only supports a modified version that doesn't follow standard because it uses their existing proprietary [Google Cloud Messaging](https://developers.google.com/cloud-messaging/) platform (although they claim to be working with Mozilla on standards compliant version).

Firefox is working on an implementation (in Nightlies) but it's going to be some years yet before there is enough browser support for this to replace any of the other options for majority of users.

I came across this standard after writing most of the rest of this post and I would like to pick out a few points that reinforce my main points here:

 - It's push only technology
 - [The transport is HTTP/2](https://martinthomson.github.io/drafts/draft-thomson-webpush-http2.html#monitor) server push which can fallback to regular HTTP poll. No WebSockets. No custom TCP protocol. Presumably if you have push enabled over HTTP/2 in your browser, then your actual site requests could be made over it too meaning that in some cases it might even cut down on connection overhead for your main page loads... That's pure speculation though.
 - The spec [explicitly recommends against application-level fallbacks](https://martinthomson.github.io/drafts/draft-thomson-webpush-http2.html#rfc.section.7.4) although clearly they will be needed until this spec is supported virtually everywhere which will be at least a few years away.
 
**Update 13th Jan 2016**

After reading the spec closely and trying to think about how to use this technology it became clear that it might not be a good fit for general purpose in-page updates.

I [clarified with the authors on the mailinglist](https://lists.w3.org/Archives/Public/public-webapps/2016JanMar/0044.html) (resulting in [this issue](https://github.com/w3c/push-api/issues/179)). The **tl;dr**: this is designed similar to native mobile push - it's device centric rather than general pub/sub and is intended for _infrequent_ message that are relevant to a user outside of a page context. Right now [implementations limit or forbid](https://developer.mozilla.org/en/docs/Web/API/Push_API) it's use for anything that doesn't display [browser notifications](https://developer.mozilla.org/en/docs/Web/API/notification). If that's all you need, you may be able to use it in-page too, but for live-updating comment threads in your app where you only care about updates for the thread visible on page, it wont be the solution.

## Do you need bi-directional sockets?

My thoughts here have a bias towards real-time notifications on websites which really don't require bi-directional low-latency sockets.

Even applications like "real-time" comment threads probably don't - submitting content as normal via POST and then getting updates via streaming push works well for [Discourse](https://www.discourse.org/).

It's also worth noting that GMail uses XHR Streaming and Facebook uses boring XHR long-polls even on modern browsers. Twitter uses even more unsexy short polls every 10 seconds (over HTTP/2 if available). These sites for me are perfect examples of the most common uses for "real-time" updates in web apps and support my conclusion that most of us don't need WebSockets or full-fidelity fallbacks - yet we have to pay the cost of their downsides just to get something working easily.

Sam Saffron's [MessageBus](https://github.com/SamSaffron/message_bus) is a notable exception which follows this line of thinking however it's only aimed at Ruby/Rack server apps.

I find myself wishing for a generalisation of MessageBus' transport that can be made portable across other applications, something like SockJS or Socket.io but without the goal of bi-directional WebSocket emulation. Eventually it could support Web Push where available and pave the way for adopting that in the interim before browsers support it. Perhaps an open-source project in the making.

_Thanks to [Sam Saffron](https://samsaffron.com/), [Alexandr Emelin](https://github.com/FZambia) and [Micah Goulart](https://twitter.com/micahgoulart) who read through a draft of this very long post and offered comments. Any mistakes are wholly my own - please set me straight in the comments!_