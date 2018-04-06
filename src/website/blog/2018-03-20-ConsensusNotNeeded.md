---
title: Consensus, Who Needs It?
author: Caitlin Bestler
---

The conventional tradeoff for distributed storage clusters is between transactional consistency and eventual consistency. Eventual consistency is usually viewed as the cheaper solution, both in terms of desirability and system cost. The critical cost of transactional consistency is the need to reach a consensus on ordering updates.

Eventual consistency is usually portrayed as simply tolerance for inconsistency on the presumption that momentary contradictions are acceptable as long as they go away eventually.

NexentaEdge takes a different approach. All stored chunks, whether metadata or payload, are unique, immutable and self-validated. References to these chunks do not include the locations where they are stored, but still enable those chunks to be efficiently retrieved.

This strategy allows NexentaEdge to provide guarantees beyond making thing consistent "eventually":
* Any client will never retrieve a version older than the most recent version that the client has put itself.
The changes in any version will never be automatically erased. * A version will only be expunged according to policy and after a version that is a successor to it is published.
* No network partition will prevent a client from putting a new object version. Indeed no client will ever prevent another client from putting a new object version.

 Never blocking a new object version because of the actions of another client is a feature, not a bug or limitation.  Transactional systems can only guarantee non-overlapping edits after reaching a consensus. The consensus may be on which updater has the exclusive right to update an object now (distributed locking) or on which of multiple conflicting updates can be committed (MVCC or multi-version consensus control). Effectively the cluster must be serialized either before the update is initiated or before it can be completed. Distributed locking is more efficient when conflicting attempted edits are common, MVCC for the far more common situation where conflicts are rare.

 So eventual consistency is actually what end consumers want for versioned document archives. Not accepting, or even delaying, the ability to record a new version is not good. What they would prefer is to reliably know when other versions are created and to minimize the time when a new update is not visible to someone wanting to further edit the same document.

What NexentaEdge offers is eventual consistency with the benefits of immutability and knowledge of what range of possible object versions could exist but which have not yet been propagated.

What lies behind this capability is simple, NexentaEdge has defined its metadata so that no consensus algorithm is needed. Other storage solutions may have clever consensus algorithms, but you cannot be more clever than no consensus algorithm at all.

## Consensus is Expensive
The fundamental issue is that it is impossible to update the same information at multiple locations at exactly the same time. This has been expressed many ways, including CAP Theorem.

Distributed Storage systems that offer transactional consistency by requiring a cluster-wide consensus before the put transaction creating a new object version can complete. This may be based upon *a priori* locks or optimistic locking which detects conflicting edits and immediately applies the conflicting edits before reapplying the attempted edit.

Either strategy requires end-to-end communications covering at least a relevant quorum of node members. Of course, a quorum based consensus is dependent on agreement about how many votes are needed, which is why consensus algorithms always get complex. If a quorum consensus on either the lock or the specific edit cannot be achieved then the requested operation cannot proceed or complete. Disallowing puts of new versions is the *last* thing that a storage cluster supporting versioned documents should do.

## Unique Chunks Do Not Require Consensus
NexentaEdge defines object versions in metadata chunks called Version Manifests. These chunks include the fully qualified object name and a unique version identifier.

Chunks are located using a cryptographic hash identifier of the chunk. For Version Manifests this is the Name Hash Identifier (NHID). All Version Manifests for a given object are stored within storage servers addressed by a single multicast group derived from the NHID. Payload Chunks, by contrast, are located based on the Content Hash Identifier (CHID). Depending on options selected the cryptographic hashes may be 256 or 512 bits.

Further, because the Version Manifests include their unique identifier, their Content Hash Identifiers (CHIDs) are also unique.

## NexentaEdge Always Accepts New Versions
All NexentaEdge chunks are unique. They either have unique payload identified by a 256 or 512 bit cryptographic hash, or they have a Version Manifest that includes a unique identifier of the the version.

Two nodes can both put the same payload chunks without harm. Because the unique version identifier includes the IP address of the originating node there is only a single source for any new version. This does impose the onerous constraint that no single source can put two versions of the same object within a single system tick, currently 1/10,000th of a second. The round trip times to negotiate and confirm putting a new chunk will take longer than that.

Because the same Version Manifest has a unique identifier the source creating it does not need to consult with any other node before creating it. The only entity that is qualified to have an opinion on whether it created a new version of a given object at a given timestamp is itself. Instant consensus.

# Namespace Manifest and Snapshots
Because Version Manifests are unique they can always be created. NexentaEdge collects and processes the transaction log entries noting each new Version Manifest to create a permanent registry of all Version Manifest that we call a Namespace Manifest. The Namespace Manifest can support complex metadata queries and makes it possible to take true point-in-time snapshots of a distributed storage cluster without requiring any consensus deriving blockage.

We'll follow up on the Namespace Manifest and Snapshots in our next blog.
