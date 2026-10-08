# AeroGrid Distributed Fault Tolerance & Consensus Protocol
**Document ID:** DOC-002
**Version:** 3.1.2
**Classification:** Enterprise Engineering Standard
**Domain:** High Availability & Consensus

## 1. Consensus Architecture
AeroGrid maintains cluster state, membership tables, and dynamic routing configurations using a lightweight Raft consensus implementation dubbed AeroRaft.
- **Quorum Requirements:** A minimum cluster size of 5 control nodes is required for active production regions. Quorum is defined as `floor(N/2) + 1`, necessitating at least 3 surviving control nodes for leader election and state commitment.
- **Leader Lease Duration:** The active leader holds a monotonic hardware lease timer of 10.0 seconds. Leader heartbeats are dispatched to follower replicas every 2.0 seconds to refresh the lease window.

## 2. Split-Brain Mitigation
In the event of network partition or cross-datacenter fiber interruption:
- **Minority Partition Isolation:** Any sub-cluster containing fewer nodes than the required quorum immediately enters a read-only degraded mode within 3.5 seconds.
- **Fencing Tokens:** All distributed state mutations require a monotonically increasing 64-bit epoch fencing token. Mutating commands submitted with an obsolete epoch token are rejected with code `STALE_EPOCH_REJECTED`.
- **Automatic Partition Reconnection:** When severed network links recover, minority nodes reconcile log discrepancies via chunked streaming log catchup before resuming write acknowledgment.

## 3. Failover SLAs & Recovery Targets
- **Automatic Leader Election SLA:** In the event of primary leader failure, the successor election and lease handoff must complete within 3,500 milliseconds (3.5 seconds).
- **Recovery Time Objective (RTO):** Regional cluster control plane RTO is 12 seconds for soft node failures and 60 seconds for catastrophic multi-node hardware drops.
- **Recovery Point Objective (RPO):** Maximum allowable data loss for committed telemetry control state is zero (RPO = 0), ensured by synchronous fsync on quorum writes.
