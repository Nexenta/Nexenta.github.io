---
title: Namespace Manifests
author: Caitlin Bestler
tags: [CCOW,Namespace Manifest]
---
With efficient group messaging a group of storage targets can efficiently manage the collective responsibility for storing Chunks within the group while allowing metadata references to the stored chunks to omit the specific storage targets selected.

That can be extended to find old versions of the stored objects by having each Target track the list of versions stored for each object. But that increases the number of persistent write operations required for each new object version by one.

As covered in the prior blogs, each Version Manifest is immutable. That means that information about a Version Manifest is also immutable. If each Version Manifest is uniquely identified, then the records describing each Version Manifest are also uniquely identified. What NexentaEdge takes advantage of is that if you have a vast distributed collection of immutable unique records can be coalesced into fewer locations where they can be efficiently searched.

We call this master manifest that collects information about all Version Manifests a Namespace Manifest. Each Namespace Manifest deals with one slice of the cluster's namespace and may be sharded over multiple Target machines.

The sharded Namespace Manifest can be organized in a variety of ways to efficiently process more enhanced queries, such as all objects contained within a given scope name, or all object versions with names ending in ".mp3" created in 2015 by a specific user.

The only question with this asynchronous collection of information describing Version Manifests is not the data associated with any Version Manifest (it is immutable) but knowing the range of Version Manifests which **might** exist but could be as of yet unknown to the collected record store.

That can be addressed by including data from each Initiator about what cutoff date they have for new Version manifests. When Initiator X forwards data about Version Manifests it has collected in a batch it notes that it is no longer creating new Version Manifests with a timestamp prior to X.

The collective master manifest therefore knows that it knows all versions manifests dated earlier than these cutoff timestamps.

## Snapshots
The Namespace Manifest can answer a query as to what the current Version Manifest was for any set of objects at one point-in-time.[^1] If there are potentially unknown Version Manifests at that time that it might not know of yet then this resulting subset is not yet complete. The results of such a query can be saved as a version of a Snapshot object.

[^1]: This requires following certain rules on how you timestamp things, such as never allowing a clock to run backwards and starting with fairly well synchronized clocks.

When it is complete it is a true point-in-time snapshot of a distributed cluster that never stalls any Initiator from creating new object versions because of network issues or the actions of any other initiator.

In photographic terms this is a true point-in-time snapshot, you just have to develop the film before you can make a print. That developing time is the lag time required to collect the records.

Most "snapshots" of distributed storage are anything but "snapshots". They may require a cluster-wide "freeze" to take the snapshot.

Chandry and Lamport in their 1985  [^2] compare the problem of taking a snapshot of a distributed system to that of taking a photograph of a sky full migrating birds. The image is to immense to be captured by a single photograph, and the photographers cannot demand the birds "freeze" to enable photo gathering.

[^2]: Leslie Lamport, K. Mani Chandy: Distributed Snapshots: Determining GlobalStates of a Distributed System.
In: ACM Transactions on Computer Systems 3. Nr. 1, Februar 1985

Others merely supporting creating clones of a specific object version and call the clone a "snapshot".

NexentaEdge provides a true distributed snapshot. Chandry and Lamport algorithm requires end-to-end communication. Ours does not require end-to-end communication to take the snapshot, merely to publish it.

Because all of the information about a Version Manifest is unique and immutable a Snapshot can cache any portion of the information form the Version Manifest in the snapshot itself. While this makes the snapshot object larger, it can speed up access to the snapshot objects. This can allpw distributed compute jobs to publish results as a snapshot, allowing single-step access to the referenced chunks by clients who effectively "mount" the snapshot.

## Not Block-Chain
The fact that our metadata is immutable and additive might cause some to think of it as being similar to Blockchain algorithms. There is an important difference: we alway allow any Initiator to create a new version of any object (constrained only by the limitation of 1 new version per Initiator per Object per tick). This means that the one-tick rule is the *only* bottlneck to the creatiaon of new object versions. Block-0chain requires each new ledger entry to be authenticated through the deliberately expensive "mining" process that creates a major bottleneck on the recording of new ledger entries.

## All Derived from Unique Immutable metadata
The benefits outlined here are all enabled by the definition of NexentaEdge metadata. The methods of collecting, indexing and publishes these derivatives will vary as NexentaEdge evolves as a product. But all of these solutions are enabled by the fact that the information about a Version Manifest can never become obsolete.
