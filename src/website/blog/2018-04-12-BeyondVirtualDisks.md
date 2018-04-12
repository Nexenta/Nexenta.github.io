---
title: Beyond the Virtual Disk
author: Caitlin Bestler
---
Kubernetes defines numerous options for Persistent Volumes and Persistent Volume Claims. The problem is that they are too numerous, or perhaps more to the point too diverse.

A Persistent Volume can be anything from a set of storage held by a backend SAN to locally mounted partitions to mount points for network file systems such as NFS.

Kubernetes does not easily supply a Pod with a way of knowing exactly what storage services will be supplied until a Persistent Volume Claim's request has been matched.

The Virtual Disk as an interface is very primitive, so offering more options is good. But this is of limited benefit if there is no unifying concept on what is being provided. A Kubernetes PV (Persistent Volume) is some kind of storage resource that can be assigned to a Pod via a PVC (Persistent Volume Claim). But what is being claimed is not well defined other than by iteration of *many* options.

By contrast, Rook IO (https://rook.io) defines three different storage services (block, object and file), and the definitions of what a user of those services can expect is clear.

Rook IO uses Kubernetes, but provides storage services using CEPH. The project is currently working on supporting other similar storage backends, including NexentaEdge.

NexentaEdge and Ceph are both examples of storage services that are very different what is offered to Virtual Machines by VMware and most legacy providers.

By default Kubernetes views storage as being just one more replaceable resource. You need W-cores with X GHz utilizing Y GB of RAM and Z TB of storage. If the resources backing any of those assignments fails the Pod is simply relaunched at a new location where that set of resources is available. With Persistent Volumes the contents stored on the storage resources can even be preserved when the Pod is relaunched.

CEPH, NexentaEdge and other storage clusters handle failures of storage target servers or drives very differently. They do not rely on Kubernetes to allocate a replacement, with optional replication of content. Rather they have already replicated or erasure encoded the stored content so that the content can be preserved even after the loss of a server or drive.

This enables the storage cluster to respond to the loss of a resource more quickly than a general purpose Kubernetes algorithm could. Further a storage cluster can have more fine grained responses here. For example, replicating or erasure encoding can be of object versions rather than entire disk drives. When providing a file or object storage service replication/repair resources could be limited to actual content rather than the logical capacity of a drive. Unreferenced sectors do not need to be preserved.

Similarly, a storage server may chose to creative pre-bonded active-passive pairs of Pods that can fail-over the responsibility of providing a service more quickly than Kubernetes can restart a Pod with persistent storage to replace a failed pod.

Expedited fail-overs for both front-end daemon and backend storage target may or may not be needed for any given application. Cluster managed failover of storage targets or storage devices can offer faster recovery **and** greater resource utilization. Self-pairing of Active/Passive frontends merely provides faster fault recovery.

In the next blog I'll explain how this type of storage cluster can be scheduled using Kubernetes using custom schedulers and the CNI and CSI plug-ins. Further, I'll explain how to enable multiple tenants to share a single backend storage cluster without any risk of leaking content across tenant lines.
