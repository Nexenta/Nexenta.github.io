---
title: Cloud-Friendly High Performance East-West networks
author: Caitlin Bestler
---
Ethernet switches, especially those with IEEE 802.1 DCB features, can deliver high throughput datacenter traffic, especially for east-west traffic that is within an L2 subnet and do not involve routers to/from the general Internet.

The on-demand virtual networks sold by cloud providers seem to focus on REST/HTTPs traffic. GRE/VxLAN routing is intermixed with monitoring solutions tailored to bursty non-constant traffic.

There is a simple way to offer high-performance ports instead. These are ports, or virtual ports, on a 802.1 switching core. The ports would be leased on a port/day basis irrespective of the number of packets actually sent on that port.

The datacenter provider can provision a non-blocking core with N switches and N*K physical ports. Depending on how many trunk links are allocated this core will have some non-blocking bandwidth guarantee that it can support between any two ports.

Because this can be guaranteed between *any* set of ports the network operator can create virtual subsets of this switching core, isolated by any method supported by the switch core, and there is no change to the QoS guarantees available.

So a 312 port non-blocking core can be leased to different users N ports at a time. The system provider divides the cost of each port by its utilization and rounds up by its profit margin. That's what they do with the REST/HTTPS/TCP traffic. The only thing different for high-performance networking is that granularity is different.

The network adminstrator merely has to provide a limited switch administration utility to assign ports to specific VLANs. The more complex configuration options would be done for the collective L2 network when the set of switches is deployed, not when each set of N ports is leased.
