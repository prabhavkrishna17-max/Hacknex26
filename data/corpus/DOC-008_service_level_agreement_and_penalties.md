# Cloud Service Level Agreement & Availability Schedule
**Document ID:** DOC-008
**Version:** 2.2.0
**Classification:** Confidential Commercial Contract
**Domain:** SLA, Availability & Performance Commitments

## 1. Availability Commitment & Calculation
1.1 **Monthly Uptime Percentage:** Vendor warrants that the core cloud telemetry API shall achieve a Monthly Uptime Percentage of at least 99.9% during each calendar month of the subscription term.
1.2 **Uptime Formula:** Monthly Uptime Percentage is calculated as:
`((Total Minutes in Month - Downtime Minutes) / Total Minutes in Month) * 100%`, excluding Excluded Maintenance.

## 2. Service Credit Schedule
2.1 **Credit Tiers:** In the event Monthly Uptime falls below the 99.9% commitment, Customer's account shall be credited upon request as follows:
- **99.0% to < 99.9%:** 10% of monthly subscription fee credited.
- **95.0% to < 99.0%:** 25% of monthly subscription fee credited.
- **< 95.0%:** 50% of monthly subscription fee credited.
2.2 **Claim Procedure:** Customer must submit a service credit claim within thirty (30) days following the end of the month in which downtime occurred. Failure to submit within 30 days waives the right to credit.
2.3 **Sole Remedy:** EXCEPT AS SET FORTH IN SECTION 3.1 (CHRONIC FAILURE), SERVICE CREDITS CONSTITUTE CUSTOMER'S SOLE AND EXCLUSIVE MONETARY REMEDY FOR ANY UNPLANNED DOWNTIME OR FAILURE TO MEET THE AVAILABILITY WARRANTY.

## 3. Chronic Failure and Accelerated Termination Right
3.1 **Accelerated Termination:** If Monthly Uptime falls below 95.0% in any two (2) consecutive calendar months, Customer may terminate this Agreement immediately upon fifteen (15) calendar days prior written notice, notwithstanding the thirty (30) day notice period specified in Section 9.2 of the Master Agreement (DOC-006).
3.2 **Refund on Chronic Termination:** Upon termination pursuant to Section 3.1, Vendor shall issue a pro-rata refund of prepaid fees for the unexpired portion of the term within thirty (30) days.

## 4. Maintenance Exclusions
The following events are excluded from Downtime calculations:
- Planned maintenance windows conducted between 02:00 and 06:00 UTC on Sundays, provided Vendor gave at least five (5) business days prior written notice.
- Force Majeure events beyond Vendor's reasonable control, including regional internet backbone transit disruptions and civil emergencies.
- Customer's unauthorized software modifications or misconfigured edge gateway payloads.
