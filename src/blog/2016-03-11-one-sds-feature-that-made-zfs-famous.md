---
title: One SDS feature that made ZFS famous
author: Dmitry Yusupov
authorURL: http://twitter.com/dmitryy
---
It was back in 2005 when Sun Microsystems unveiled OpenSolaris and an with it young yet brave new file system called ZFS. Clearly Sun did lots of marketing to get ZFS widely recognized and known. Mostly it was grass root effort via engineering blogs and forums, people who were very passionate about what they've architected and engineered.

But what was it that made ZFS so prominent among other existing filesystems at the time? What is it was wrong with the world that made it widely accepted?

Some believe that ZFS’s differentiation was a direct cause from its performance. However, ZFS wasn't the fastest. In fact, It was on average acceptable in majority of workloads and EXT4 did outperform ZFS actually. ZFS was greedy for available DRAM and CPU resources. And when over time these components became affordable, following Moore's low curve, ZFS outperformed EXT4 on write intensive workloads. The rectified performance of the ZFS system, however, was not the leading reason for its fame.

ZFS stands for "Zettabyte File System". But i didn't see that its great addressability what was critical at a time. In fact, typical array size (ZFS pool cannot be accessed via two nodes simultaneously) was in range of 100-200TBs. You do not need ZB+ addressability if all you planning to address is just going to be within 1PB at most. No, it wasn't its great scalability either..

Features? Usability? Well, that did help to attract hundreds of thousands of enthusiasts to play with it. It certainly gave it necessary momentum. But this couldn't compare to what Linux adoption did with millions of people using EXT4 every day till these days actually. And by the way, breaking layers idea was "too revolutionary" at a time.. while gaining better usability (LVM and FS layer integrated) it did create unnecessary controversy, along side with CDDL vs. GPL discussions. This didn't help much.

Looking back, I'd say ZFS the most important feature that really made it so appreciated in enterprise circles is its built-in end-to-end integrity as a result of Copy-On-Write technique it used so masterfully. As a matter of fact this technique was the core dispute between NetApp and Sun (later Oracle) until it was court settled due to patent claims expiration dates.

To understand this, you need to be an admin or a devop fellow who's job is on the hook if their enterprise would suddenly loose data or it would corrupt archives silently. When ZFS released to public, in open, free as in speech, or with support contracts from companies like Nexenta, it was big deal to those guys! No longer they need to buy expensive EMC subscriptions and NetApp contracts. ZFS let people keep critical data safe, with guaranteed integrity and self-healing capabilities built-in. Snapshots and Clones were obvious by-products of Copy-On-Write rather than separate inspirations. ZFS just harvested its benefits smartly.. by enabling ARC cache and clever transactions algorithms, it did deliver acceptable performance even for workloads that typically hard to achieve with Copy-On-Write, i.e. random writes. As i mentioned earlier Moor's low worked in their advantage.

It was year of 2011 when group of talented engineers and architects at Nexenta realized that world needs to extend Copy-On-Write technique to stay relevant in the Cloud era. This is when Cloud-Copy-On-Write technique was born and with it new product, delivering it - NexentaEdge.

Learn more about NexentaEdge at http://nexentaedge.io.
