---
title: Adding a Closed IPV6 subnet With No Help From Google Cloud
author: Caitlin Bestler
---
IPV6 has many cluster-friendly features. One of the biggest is simple addressing. Link local or Unique Local addressing can automatically assign unique IPv6 addresses to every node with no network traffic (assuming the MAC addresses are unique).

But support for IPV6 in Google Cloud is limited, as is support for multicast and broadcast messaging. NexentaEdge's internal storage network uses IPV6 and multicast.

NexentaEdge's architectural advantages fall into two categories:
* Metadata: Unique self-validating immutable location-independent metadata referencing unique self-validating immutable location-independent payload.
* Dynamic Load-balancing: High utilization of target IOPs and network bandwidth based on group-driven negotiations and no-drop Ethernet features.

The IEEE' s DCB group (Datacenter Bridging) defined a set of improvements to Ethernet that can vastly improve performance for L2 networks, especially those found in datacenters. But Google Cloud seems to be focused on REST/HTTPS/TCP networking almost exclusively, which means DCB networking features are not available to applications.

Many of the ideas that led to NexentaStor were inspired by more working with the 802.1's DCB group. In fact one comment by Norm Finn (of Cisco) was crucial; he observed that while the congestion control algorithms the group was defining would work with Congestion Points anywhere in the network that in a lot of data centers congestion would only occur on the edge links. The "Edge" in NexentaEdge relates to edge-based resource and congestion control.

But Google Cloud seems uninspired by these advances.

This might look grim at first glance. But with proper configuration we configure OpenVswith to provide a closed IPV6 subnet which is totally invisible to the Cloud Provider's network. It can manage its own addresses in isolation. Only the Cloud assigned IPV4 addresses are visible on the wire.

## Pod Using IPV6 subnet
The network connections for a Pod using the closed subnet uses the Multus plug-in to configure the default and closed IPV6 subnet:
* Eth0 and other standard Net* interfaces are scheduled using standard CNI modules. Multus (https://github.com/Intel-Corp/multus-cni) enables one Pod to define multiple network plugins for different virtual NIC interfaces.
* The last Net* interface is connected to the Closed IPV6 Subnet virtual switch using the barebones Host plugin that does nothing to construct IP addresses or set up firewall rules. That is exactly what we want for this network. This is intended for zero-conf networks.
Local routing steers whatever slice of the IPV6 address that represents the closed IPV6 subnet.

Typically these pods will be supported by a general purpose networking pod (which may well be OpenVswitch itself) and a specially provisioned IPV6 Open Vswitch pod which implements the closed IPv6 subnet.

## The IPV6 Open VSwitch Pod
This pod has two primary containers:
* OVS_Switch.
* A policy module which controls the OVS Switch via OpenFlow.
The OVS Switch will connect:
* Tun* interfaces to application Pods.
* ISATAP* interfaces providing IPV6 over IPV4 tunneling using Eth0.
* Eth0: which is also used for 127.* communications with the policy module.
<div class="mermaid">
graph TD;
Tun0-->OVS_Switch;
Tun1-->OVS_Switch;
Tun2-->OVS_Switch;
Tun3-->OVS_Switch;
Tun4-->OVS_Switch;
OVS_Switch-->Eth0;
OVS_Switch-->ISATAP0;
OVS_Switch-->ISATAP1;
OVS_Switch-->ISATAP2;
ISATAP0-->Eth0;
ISATAP1-->Eth0;
ISATAP2-->Eth0;
OpenFlowPolicy-->Eth0;
</div>
The OVS_Switch is configured with the following flows:
* Unicast flows to each member of the closed IPV6 subnet. This is an enumerated set. There is no flooding on the closed IPV6 subnet, rather each end station registers with its OVS Switch as will be explained. Each known IPV6 unicast address maps to either one of the Tun interfaces (for end stations on this host) or one of the ISATAP interfaces (for end stations on other hosts).
* A reserved Multicast flow to all other IPV6 Open Vswitch Pods. This is used to share forwarding table information.
* Multicast flows to each configured multicast group which specify the union of destinations from the members of the group.
* Lastly a default flow to drop all unknown destinations. This is a closed network.
