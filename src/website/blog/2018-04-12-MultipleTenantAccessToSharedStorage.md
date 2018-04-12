---
title: Multiple Tenant Access To A Shared Storage Cluster
author: Caitlin Bestler
tags: {NexentaEdge,CCOW,Peer-to-Peer Storage,IPFS,Multi-Tenant,Kubernetes}
---
In the prior blog we discussed how to use Kubernetes to provision a class of storage clusters which protects against loss of stored assets itself via erasure encoding and/or replication across already provisioned resources, rather than relying on Kubernetes to supply replacement resources.

In this blog we will extend that concept to show how to use Kubernetes to enable multiple tenants to each access the same storage cluster via tenant-isolated networks.

Kubernetes is currently capable of scheduling a storage cluster which provides storage services to a flat namespace. It can also create multiple tenant clusters with isolated pods which cannot accept connections from nodes of other tenants. The proposal discussed here allows storage clusters to offer storage services to pods via tenant-isolated access networks.

The convention proposed is to first provision a storage cluster using Kubernetes and then independently provision  tenant access networks for each tenant to access this same storage cluster.

Each tenant will have their own access network and their own storage namespace on a common backend storage cluster. The storage cluster will typically have a common backend storage network which serves all tenants. The storage cluster is in control of allocation of resources to different tenants. While it is not required to fully provision storage resources to each tenant it will typically enforce quota limitations on each tenant.

## Isolated Tenant Access Networks

For the frontend tenant access networks the goal is to provide isolated pods that are all connected to the same tenant access network. Any underlying technology that prevents Tenant B clients from connecting to Tenant A pods can be selected. VLAN, VxLAN and firewall methods all work. What Kubernetes lacks is a uniform strategy allowing multiple tenants to each have isolated networks to a shared backend storage cluster.

Each tenant would be able to enumerate the particpants in their access network:
* Client Pods
* Service Pods providing tenant specific access to services such as Active Directory or LDAP.
* Access Pods providing tenant-specific access to the storage cluster. These Pods would run on hosts that already had the desired Storge Cluster backend pods launched.

## Shared Backend Storage Cluster
Why not have each tenant simply clone the storage service for themselves?

Per-tenant storage clusters forces resources to be rigidly divided to different tenants. This inevitably results in idle resources reserved for tenants not currently doing enough to keep them busy.

Having separate tenants access a shared storage cluster over tenant-specific networks allows for dynamic resource sharing between tenants. Given the bursty nature of storage traffic it is very unlikely that each tenant will always be using the same portion of the cluster's resources. Limiting the share any one tenant uses over the long term is obviously good business - it forces those using more resources to pay for better SLA guarantees. Strictly dividing resources for each and every second just ensures that there will be a lot of idle resources being wasted.

Storage traffic, especially for active document archives, is very bursty. Sharing raw resources is very cost effective.

Creating a storage cluster to provide service to a single tenant or a flat namespace certainly works. But providing a shared storage cluster enables economies of scale in providing persistent storage services. It no more has resources assigned to it for a specific tenant than a Bank has your cash pre-identified for you to withdraw. Serving multiple users from a single set of resources is efficient.

## Limitations on Sharing
The economies of a shared storage cluster would be shunned if they can at the cost of exposing one tenants assets to any other tenant. Sharing costs is great, sharing data is not.

Presumably the backend storage cluster would also be capable of throttling requests in a tenant specific way so that no single tenant could monopolize the cluster resources without statically dividing physical resources into isolated pools incapable of lending idle resources to meet usage bursts.

All requests for the backend storage network Pods are tied to an authenticated tenant. So the backend pod can apportion its provisioned storage and network resources according to its own policies so that it can offer QoS guarantees to its Tenants.

Typically the Tenant Access networks would be best effort, but bandwidth guarantees can be provisioned on the L2 network and/or in firewall rules.

For each tenant the scope of available storage resources would be scoped by the Tenant ID. If access is through Tenant X's network then only Tenant X assets may be accessed. Tenant-specific ACLs may be additionally applied after that.

This layering of access control enables use of open-source software that has not been designed for multi-tenant access. Open-source file system daemons were largely designed when NAS was implemented over corporate intranets, not shared data center networks.

## Problems with the Flat Namespace
Merely publishing a Storage Service to a flat namespace creates issues for multi-tenant access.
* In a flat namespace, any advertisement of available mount points would be available to all clients.
* The Storage Service would have to reject logins from user that were not part of the Tenant-specific network authorized to access the storage server.
* Denial Of Service attacks would hit tenant-independent resources, threatening to bring done service to all tenants. With Tenant-specific networks the Storage Service would be able to confine the impact of a DoS attack to that specific network.

The Ganesha NFS daemon supports a pluggable File System Access Layer (FSAL) that makes it very convenient for providing NFS access over any storage service that resembles a file system, including object storage. Multi-tenant support with Ganesha requires creating Ganesha instances for each tenant. Similar implementation strategies are also employed with iSCSI targets.

## Multiple Storage Backends
This proposal also supports provisioning multiple different backend storage clusters, and even assigning generic "storage server" nodes to specific storage clusters. Tenants could then choose which storage backend their clients would be granted access to. While provisioning and configuring storage clusters typically varies between vendors it is very common for different storage clusters to support the same data plane APIs to access storage (NFS, CIFS, S3, Swift, iSCSI, etc.)

When a storage cluster requires a backend storage network it is typically relying on some form of custom congestion control other than TCP/IP. Examples include FCoE or RoCEE reliance no-drop Ethernet, FibreChannel or Infiniband. NexentaEdge use UDP but relies on traffic isolation provided by lossless Ethernet or some other equivalent L2 solution. Network isolation not only enables these strategies, it protect non-storage traffic from being drowned out by storage traffic.

Kubernetes network policy defaults to non-isolated pods. A Network Policy is required to impose access restrictions, and those restrictions may be enforced by accepting/rejecting TCP connections rather than by L2 traffic isolation.

The best L2 traffic engineering, based on the Datacenter Bridging 802.1 protocols, is only supported by switch specific policy's such as Big Switch Networks.

This proposal is compatible with scheduling multiple different storage backends in the same cluster, however the backend network resources are allocated.

While this allows "dynamically" allocating a storage cluster it must be remembered that each new storage cluster would formatting the local storage volumes allocated to it. There is no cluster-independent definition of persistent storage. This is not a solution for dynamically creating storage clusters on demand, but rather for allowing long-term reallocation of resources.

Many storage clusters have similar demands for a "Storage server", and ability to periodically rebalance the allocation of storage servers between different storage clusters is certainly desirable. Even if storage clusters are completely static, the convenience of using Kubernetes to provision them and to keep Container code images up to date would be valuable.

## Special Scheduling Requirements for the Backend Storage Service
The backend storage cluster must be provisioned before any tenant access networks are added or removed. The backend storage network frequently has specialized requirements, and specific characteristics may be desired for local storage. Kubernetes has sufficient options to customize host selection to enable provisioning of even very picky storage clusters. For certain backend storage clusters the 'scheduling' may end up specifying the **exact** set of hosts to be used, but it is possible.

After this backend network is provisioned we need to tag the selected hosts so that Tenant Access Pods can be provisioned to hosts that already have the backend storage service Pod running. Ideally, only nodes requiring optimized access to the backend storage network should be scheduled directly on these gateway hosts.

An example of an end result is depicted below, with two different Tenant Access Pods communicating with a single Backend Storage Service Pod.

<div class="mermaid">
graph TD;
A(Tenant A Access Pod)-->FrontNIC(Frontend NIC);
A-->LocalHostIPC(Localhost IPC);
B(Tenant B Access Pod)-->FrontNIC;
B-->LocalHostIPC;
S(Backend Storage Service Pod)-->FrontNIC;
S-->LocalHostIPC;
S-->BackendNIC(Backend NIC);
</div>

There would be a minimum of one Pod for each tenant, although tenants could have multiple Pods to accommodate varying scheduling requirements. Separation of services into different addresses spaces is frequently desirable, but it is not a requirement for providing multi-tenant service. What is required is that each tenant Pod has tenant-quarantined access to the FrontEnd NIC.

A BackendStorageServicePod (or pods) has previously been provisioned with access to the BackendNIC. For many storage clusters this will be a network with specific quality of service guarantees and specialized resource allocation needs. Some may require lossless Ethernet service, Fibre Channel, Infiniband or merely some guaranteed bandwidth.

The Tenant Access Pods communicate with the Backend Storage Service POD via localhost IPC. This may be used for all communication, or merely to set up shared memory message queuing.

The Backend Storage Service Pod could authenticate each Tenant Access Pod, but would find life simpler if the scheduling policy simply enforced that Tenant access Pods would be scheduled on this host. The Pod could certainly have hyper-converged Containers.

When a new Tenant Pod was added it would use the LocalHostIPC to register itself with the Backend Storage Service Pod, and establish itself as being associated with a specific Tenant.

If the performance demands for a given Tenant Access Pod were high enough the Access Pod and Backend Pod would use initial IPC messages to set up a higher performance channel such as a message queue through shared memory. Shared memory should be allocated by and owned by the Tenant Access pod since it should be deallocated when the Tenant Access Pod is deactivated.

When a Tenant C is added those pods would register with the Backend Storage Service Pod. It would the mix the interfaces with the Tenant C Pods to the list of interfaces it was polling. Load-balancing and prioritizing among Tenants A, B and C would be left to the discretion of the backend pod.

What isimportant is that the backend pod be able to determine which Tenant is behind each request, and that only approved Tenant Access Pods can try to access it.

## Summary
The steps required for dynamic multiple tenant support are:
* Schedule the Storage Cluster on N machines. Mark those that are eligible to act as gatewya/proxy machines as being access hosts for this specific Storge Service.
* To add a Tenant Access Network:
  * Schedule Tenant Access Pods on hosts marked as providing Storage Service X.
  * Configure these Pods to access a Virtual Access Network which includes external clients and required Tenant-specific support services (such as AD/LDAP).
  * When launched the Tenant Access Pod will register with the Backend Storage Service Pod authenticating itself as working for the specific tenant.
  * The Backend Storage Service Pod will now prpvide service via IPC, or a communication path setup using IPC, to access Tenant-specific storage services. For example, each Tenant accessing NFS services would oly have access to mount points defined by the tenant.
* To drop a Tenant Access service:
  * Logoff the Backend Storage Service Pod using the IPC channel.
  * Shutdown the Tenant Access Pod.
* When there are no Tenant Access Pods a Backend Storage Service *may* be terminated.

Membership in either the Tenant Access Networks or the Backend Storage Network may be changed at any time using normal Kubernetes procedures. This does not change the relationships between the networks.
