---
title: Immutable Metadata Not Enough
author: Caitlin Bestler
tags: [CCOW,IPFS,Metadata Search,Hierarchical Directories]
---
In prior blogs I've explained how NexentaEdge has immutable self-validating location-independent metadata referencing self-validating location-independent payload. The same can be set about IPFS, the Interplanetary File System (https://ipfs.io). While the two storage solutions' handling of payload chunks is very similar, the differences in how objects are named and found are almost as different as possible.

## Payload Chunks
The end result of putting a chunk to IPFS is that it is identified and validated with a cryptographic hash, and that the cryptographic hash can be used to find the chunk for retrieval.

This is very similar to NexentaEdge, but there are differences:
  * IPFS accepts the chunk and then generates its cryptographic hash. A NexentaEdge client directly interfacing to NexentaEdge cryptographically hashes the chunk before requesting that it be put. This avoids transmission of duplicate chunks.
  * IPFS routing is a consistent hashing solution. NexentaEdge hashes to a Target Group and then does rapid negotiations within the group to find and dynamically place new chunks on the least burdened targets.

## Different Metadata Philosophy
The IPFS naming system is still a work-in-progress, but all of their examples suggest a very different method for publishing content accessible by name.

They take the cryptographic hash of the atomic object and embed those references in other documents, which basically function as directories. Each of these directory objects is also immutable, referencing specific frozen-in-time content. The directory object itself has a cryptographic hash, which can be referenced in higher layer directories. Finally a "root" directory is published which is then pointed to by a mutable name to directory object mapping.

From the examples given and the suggested implementations it is clear that this is not intended as a high transaction rate solution. This is something more akin to publishing the daily release of a open-source project. This new root is collected, authorized and published by a single authoritative user.

This is not that bad of an approach for creating a "permanent web", although it would not even seem applicable for sites such as cnn.com that publish continuously.

One of the primary objectives of NexentaEdge is to be a shared repository for versioned documents that can be accessed and updated by thousands of tenant approved users. Any tenant-approved user should be able to post a new object version, subject to tenant-specified ACLs, at any time without interference from other users. Any tenant-approved user should be able to fetch any version of any tenant object at any time without interference from other users beyond contention for bandwidth. Information about new object versions is propagated asynchronously, but rapidly, and with known and measured propagation delay.

A storage service, as opposed to a publishing service, needs to treat stored payload as opaque blobs. The storage service is not allowed to find references within the payload because it should embrace client driven end-to-end encryption. The storage service should presume that all payload is encrypted and never try to analyze it.[^1]

[^1]: It can try to compress the data to save storage resources, but obviously that will not work if the payload was in fact already encrypted.

So information that supports finding stored object, by name or by other search criteria, must be stored as metadata separate from the payload. Metadata also serves the closely interlocked issue of how and even whether to retain content.

## Immutable Version Metadata
By definition, most metadata about a specific version of an object must be immutable. Certain metadata can be independent of the version contents, such as metadata controlling retention of the object version. We can meaningfully talk about changing erasure encoding algorithm used to store a specific document version, but if we are changing the Author of the document we are creating a new version.

In particular, whether or not a given version is the current version of the object is obviously subject to change without changing the version itself. One of the strong points for IPFS is that it does not change the storage for a directory object when the mutable naming reference is changed to point at a new version. This is far preferable to the practice of creating an explicitly versioned name for non-current versions, such as used by Swift object storage.

However, there are many features of the Metadata system required for versioned document storage that IPFS simply does not address:
* Single Step searches.
* Directory/Folder searches with single edit Hierarchical Path Edits.
* New Metadata must be propagated quickly.
* Predictable search times building upon short RTOs.
* Tenant control over access-to and modification-of tenant metadata.
* Metadata driven retention of metadata and refeereced Payload.

## Single Step searches
IPFS describes a multi-step process to resolve a pathname:
* The root of the path name is looked up in the mutable naming system (IPNS). That leads to a directory object encoding references.
* Each layer of the the "/" delimited name is then iterated. For "/A/B/C/D", "B" is looked up in the "/A" directory. "C" in the resulting directory, etc.
* Finally the reference object is retrieved.

This is common for "distributed" storage systems which have effectively just ported the Unix inode to the cloud. Iterative descent is a great theory and very general, but it has not been a performant solution for some time. Single-node storage servers work around this by caching the top level directories. Web-servers have been caching mappings of fully qualified URLs to files for some time as well. But iterative descent results in terrible performance when you have to jump to different storage servers for each step of the iteration. Once you have distributed storage it is very unlikely that the servers handling "/A" will be the same as the servers handling "/A/B". The same applies for "/A/B/C". Even if the entries are cached everywhere, the process requires too many network round trips. If the object name is "/A/B/C/D" the metadata system has to be able to look that up, within the context of the tenant, in a single-step search.

NexentaEdge can resolve a name using the TargetGroup search or a Namespace Manifest search. It involves many servers, but the search is conducted in parallel, not iteratively.

In both cases a single query[^2] is sent either to the TargetGroup or to the Namespace Manifest shards. The addressed targets send their responses back to the Initiator.

[^2]: As will be noted, having renamed directories in the queried path can require an additional query round. However, that

The Initiator collects as many responses as are required to find the requested CHID to be retrieved.

## Directory/Folder searches With Single-edit Hierarchical Path Edits
Like most cloud-inode solutions, IPFS supports querying directories by iterating from the root Directory until the desired layer and simply reading the directory.

NexentaEdge sends a query to the Namespace Manifest shards requesting all records relevant to resolving a given path. This includes "rename" records which allow single edit updates to hierarchical path names.

Recursive descent allows renaming the path to all objects by simply renaming one directory in the path. "/A/B/*" becomes "/A/B2/*" simply by renaming the "B" entry within the "/A" directory to "B2". That is a lot more difficult with distributed directories in a storage cloud. If you support finding an object with its full path name then you are ultimately hashing based upon the fully qualified path name ("/A/B/C/D"). When you change "B" to "B2" you change the hash for all objects that are conceptually contained within "/A/B". Executing that synchronously, before completing the request, would be impossible. There could be billions of objects contained within a single directory.

NexentaEdge solves this by creating "rename" entries that record when "B" was renamed to "B2". In the worst case this may force the Initiator to issue a second search using the original folder name to guarantee that it had found all objects in "/A/B2". But the path edit from "/A/B" to "/A/B2" only requires creating a single entry in the Namespace Manifest.

## New Metadata Is propagated
NexentaEdge has a two-track method for searching metadata. The search for Version Manifests can be conducted within the Negotiating Group (selected by the NHID) or by searching a sharded Namespace Manifest. The Negotiating Group search is limited to searching for an exact name, and will be limited to searching for the current version once the Namespace Manifest implementation is mature enough.

The Negotiating Group metadata is available as soon as it is put. The Namespace Manifest is updated by post-processing of transaction journals. Updates are sent to the Namespace Manifests shards. The source can be configured to be the initiators or the Targets that create new Version Manifests. These updates are batched. The granularity of batches is configurable. Further, the Namespace Manifest records the latest batch info from each source. This means that a query resolver knows the time as of which it knows all Version Manifests, and which Version Manifests *might* exist but not yet have been propagated.

IPFS, and other distributed inode solutions, either have to confirm update through the root inode (which would greatly slow down transaction speeds) or live with asynchronous upward posting of the inode tree (with no way to track when this is done). On a functioning network both solutions will propagate this data very quickly, but NexentaEdge can let the querier know when propagation has been delayed.

## Predictable search times building upon short RTOs
NexentaEdge maintains metadata and Namespace Manifests so that the RTO to reach all required replicas/shards has a short maximum RTO. The time to resolve any query is directly determined by this RTO.

Other systems, including IPFS, do not guarantee that a name can be resolved within the current site. Therefore the query may be dependent on long-haul RTOs. This takes longer, and it takes longer before retry operations can begin after a failure. Combined this greatly increases the time that must be allowed to complete any query.

## Tenant control over access to and modification of tenant Metadata
NexentaEdge enforces a two-layer access control strategy. The first layer imposes strict tenant isolation. All metadata belong to a specific tenant, and is accessible only by users approved by that tenants authentication server. The second tier is inforcement of ACL rules, where the specific rules are part of tenant supplied metadata and permissions/roles granted to the tenant approved users.

IPFS creates a global, visible namespace. If security is desired it must be provided by user-controlled encryption.

## Metadata driven retention of metadata and referenced Payload
IPFS control of data retention is a bolt-on. Pinning of IPFS files is done on a per target basis. Cluster-driven retention requires execution of a RAFT-derived consensus algorithm. Requiring cluster-wide consensus for a routine operation seems to be contrary to the goal of being a scale-out storage solution.

NexentaEdge Chunks are retained if they are referennced. There is a MapReduce algorithm to distribute back-reference requirements. Once this information has been distributed each storage target is free to delete older chunks that have not been retained.

Version Manifests are retained when they are referenced in Snapshots or they are current.

Tenants are allowed to expung their own Version Manifests. This enables them to expunge content from their account in order to comply with legal requirements to remove content. Tenants will be able to subscribe to receive notices if expunged chunks are re-added.

## Metadata for Enterprise storage
NexentaEdge's metadata is not just immutable, self-validating and location independent. It supports rapid metadata searches that are designed to meet the needs of a document/object storage system holding tenant-private objects. IPFS is inherently limited to publishing the permanent web, and will never be suitable as a versioned project active archive.
