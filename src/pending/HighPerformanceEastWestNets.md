---
title: Cloud-Friendly High Performance East-West networks
author: Caitlin Bestler
---
There is a business opportunity that seems to be unaddressed in the current cloud market.

Cloud providers sell slices of compute/network/storage resources to end users. The end user is only charged for resources actually needed, but with a markup. The markup is enough to buy more resources than are actually needed in aggregate and still make a profit. The end users still save money because they are not paying for assets that would inevitably go idle.

That applies to network bandwidth, storage capacity, processor cores, RAM and third shift personnel. Forcing each user to pay for these separately would be too expensive, especially the third shift staff. The cloud operator can pass on half of these savings to the end user and everybody is happy.

But so far the only model of networking supported is bursty generic TCP traffic. There is an entirely separate model for sustained low-latency high throughput networking for HPC and storage clusters.

The IEEE 802.1 DCB (data-center bridging) initiative defined a new class of "no drop" Ethernet that caters to this market. These capabilities are highly desirable when laying out your own network for on-premise or co-location deployment. Why would't there be the same demand for leasing this capacity?

The granularity would obviously be different. Think "port/hours" rather than GBs/month. For this type of high-throughput low-latency network you want a simple guaranteed bandwidth with maximum latency for a duration of time amongst your N leased machines.

There is a simple way for any data-center to offer this type of leased service:
* Create a large L2 switch core with lots of ports and a defined non-blocking rate that can be sustained from any port to any port.
* Offer to lease any N of these ports by the hour/day/month.
* Bundle the leased ports into a VLAN, using any method of creating a VLAN supported by your switch core. Do **not** provide any form of IP Address Management to these ports beyond assuring that the L2 MAC addresses are unique. Using the hardware L2 MAC addresses is a very simple way to do this. Let the end user manage L3 and up on the leased port and just collect the rent.

There is a static configuration of the L2 switch core, and dynamic assigment of ports to specific virtual lans. Assigning VLANs merely restricts what ports can talk to which ports. If the core switch core was already desiged to meet SLA X then each virtual network will comply with SLA X.
