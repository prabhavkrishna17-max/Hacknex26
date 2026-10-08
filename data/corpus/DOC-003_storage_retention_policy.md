# AeroGrid Telemetry Storage Lifecycle & Retention Policy
**Document ID:** DOC-003
**Version:** 1.8.0
**Classification:** Enterprise Engineering Standard
**Domain:** Storage Lifecycle & Regulatory Compliance

## 1. Storage Tiering Overview
Telemetry data transitions through three distinct storage tiers based on data age, access patterns, and regulatory compliance standards: Hot, Warm, and Cold tiers.

## 2. Storage Tier Specifications
- **Hot Tier (NVMe SSD Cluster):**
  - **Retention Duration:** High-resolution uncompressed telemetry is retained for 7 calendar days.
  - **Query SLA:** Sub-millisecond indexed point lookups and range scans completed under 25 milliseconds.
  - **Compression:** None. Preserves raw floating-point precision for millisecond-resolution inverter analysis.
- **Warm Tier (Columnar Time-Series Engine):**
  - **Retention Duration:** Retained from Day 8 through Day 90 (83 days duration in warm storage).
  - **Compression:** Zstandard (ZSTD) compression level 7 with dictionary training, achieving an average 5.8x data footprint reduction.
  - **Query SLA:** Aggregate time-bucket queries completed within 450 milliseconds.
- **Cold Tier (Encrypted Object Storage / Parquet):**
  - **Retention Duration:** Aggregated 1-minute rollup vectors and compliance logs are retained for exactly 7 years (2,555 days) to fulfill federal regulatory audits.
  - **Format:** Apache Parquet with Snappy compression and bloom filters.
  - **Access Latency:** Asynchronous retrieval pipeline with 4-hour batch hydration SLA.

## 3. Data Purging & Deletion Mandates
- **Automatic Expiration:** Data exceeding the 7-year regulatory threshold is scheduled for permanent cryptographic erasure on the first Sunday of each calendar month.
- **Immediate Tenant Erasure Restrictions:** Customer telemetry cannot be purged within 24 hours under any circumstances due to non-repudiation audit trails; requests for emergency deletion require CISO dual-authorization approval.
