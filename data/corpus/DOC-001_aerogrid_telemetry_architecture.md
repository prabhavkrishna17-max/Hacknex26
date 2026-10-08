# AeroGrid Telemetry & Ingestion Architecture Specification
**Document ID:** DOC-001
**Version:** 2.4.0
**Classification:** Enterprise Engineering Standard
**Domain:** Distributed Telemetry & Grid Ingestion

## 1. System Overview
The AeroGrid Telemetry Platform ingests real-time power grid sensor streams, microgrid state vectors, and inverter telemetry from distributed edge nodes across 14 geographical regions. The core architecture uses an event-driven ingest cluster connected to a partitioned messaging backbone.

## 2. Ingestion Cluster Specifications
The edge ingestion proxies receive incoming telemetry streams over gRPC and WebSocket connections.
- **Maximum gRPC Frame Size:** The gateway strictly enforces a maximum payload frame size of 4,194,304 bytes (4.0 MB). Payloads exceeding this threshold are immediately rejected with gRPC status `RESOURCE_EXHAUSTED`.
- **Concurrent Connections:** Each worker instance is provisioned to sustain up to 25,000 active concurrent WebSocket telemetry streams.
- **Backpressure Handling:** When internal queue utilization exceeds 85% capacity, worker proxies issue HTTP 429 / backpressure throttle frames instructing edge gateways to buffer locally for an exponential backoff period starting at 500 milliseconds.

## 3. Partitioning & Message Routing
Telemetry frames are partitioned across Apache Kafka ingestion topics using a composite hashing key consisting of `tenant_id:substation_id:sensor_uuid`.
- **Partition Count:** Default production topic allocation is 64 partitions per regional cluster.
- **Ordering Guarantee:** Strict total ordering is guaranteed only per `sensor_uuid` stream within an individual partition.
- **Ingestion Latency Target:** 99th percentile (P99) end-to-end ingest transit latency from edge ingress to durable message broker commit is 45 milliseconds under normal operating load.

## 4. Worker Node Health & Heartbeats
Worker nodes maintain active membership in the ingestion ring via distributed consensus heartbeats.
- **Heartbeat Interval:** Ingestion nodes transmit cluster heartbeats every 5,000 milliseconds (5.0 seconds).
- **Failure Detection Threshold:** A node is declared unreachable and evicted from the routing mesh if 3 consecutive heartbeats are missed, corresponding to a timeout threshold of 15,000 milliseconds (15.0 seconds).
- **Rebalance Cooldown:** Once an eviction event occurs, the cluster enforces a mandatory 30-second rebalance cooldown before migrating consumer groups to avoid cascading failovers.
