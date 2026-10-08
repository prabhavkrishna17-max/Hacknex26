# AeroGrid Operational Incident Escalation & Triage Runbook
**Document ID:** DOC-005
**Version:** 3.0.0
**Classification:** Enterprise Engineering Standard
**Domain:** Site Reliability & Operational Procedures

## 1. Incident Severity Definitions
- **Severity 1 (P1 - Critical):**
  - **Definition:** Regional ingestion pipeline outage, total loss of telemetry streams for >1 substation, or packet drop rate exceeding 2.0% across any 60-second measurement window.
  - **Response SLA:** Primary on-call engineer paged within 2 minutes; active incident commander bridge established within 5 minutes.
  - **Notification:** VP of Grid Engineering and Regional Grid Operators alerted within 15 minutes.
- **Severity 2 (P2 - Major):**
  - **Definition:** Degradation of warm storage query latency exceeding 1,500 milliseconds, or single worker node failure in a 3-node cluster.
  - **Response SLA:** On-call engineer paged within 15 minutes; mitigation target within 45 minutes.
- **Severity 3 (P3 - Minor):**
  - **Definition:** Non-critical background telemetry rollup delays or minor logging ingestion backpressure.
  - **Response SLA:** Triage during standard business hours within 4 hours.

## 2. Emergency Circuit Breakers
- **Automatic Throttling:** If ingestion cluster CPU exceeds 92% sustained for 3 minutes, the automatic circuit breaker sheds tier-3 auxiliary sensor streams (ambient temperature and humidity) while preserving tier-1 core voltage and frequency vectors.
- **Manual Kill Switch:** Invoking `/api/v1/ops/emergency-shed` requires dual-token approval from both the On-Call Lead and the Shift Safety Officer.
