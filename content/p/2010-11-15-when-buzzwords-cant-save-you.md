---
title: When Buzzwords Can't Save You
---
**Ooops! Github was down yesterday for several hours and I was expecting one of those "some complex as-yet-unidentified quirk of replication caused our sharded NoSQL cluster to drop every record with exactly 13 words in the title" type incident reports. Turns out [a developer just deleted their production DB accidentally](https://github.com/blog/744-today-s-outage).**

Fair play to them for the honest post though. This sort of thing does happen to everyone to a lesser or greater extent and I feel for the guy responsible. It does go to show though that  Continuous Integration, Test Driven Development, Rails and all the other associated buzzwords don't always save you from the inevitable!

Lesson to learn: don't allow write access to production databases from dev environments. I'd have thought that with all their infrastructure and expertise, that should never have happened.