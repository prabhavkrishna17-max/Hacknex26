# AeroGrid Edge Gateway Security & Cryptographic Standards
**Document ID:** DOC-004
**Version:** 4.0.1
**Classification:** Enterprise Engineering Standard
**Domain:** Edge Security & Identity Verification

## 1. Transport Security & Mutual TLS
All edge telemetry gateways communicating with regional ingestion proxies must establish Mutual TLS (mTLS).
- **Protocol Version:** Gateways mandate TLS 1.3 exclusively. Older cryptographic protocols (including TLS 1.0, TLS 1.1, TLS 1.2, and unencrypted HTTP/1.1) are actively rejected at the perimeter load balancer.
- **Cipher Suites:** Permitted cipher suites are restricted to `TLS_AES_256_GCM_SHA384` and `TLS_CHACHA20_POLY1305_SHA256`.
- **Certificate Authority:** Edge certificates must chain directly to the AeroGrid Root Substation Certificate Authority (RSCA-V2).

## 2. Hardware Identity & Attestation
- **TPM Integration:** Every physical edge gateway is provisioned with a cryptographic Trusted Platform Module (TPM 2.0). Private keys are generated on-chip with non-exportable flag attributes.
- **Boot Integrity:** Gateways perform Measured Boot using secure boot measurements verified against an attestation server before receiving operational certificates.

## 3. Session Tokens & Key Renewal
- **Token Format:** Ingest sessions utilize cryptographically signed JSON Web Tokens (JWT) encrypted using AES-256-GCM.
- **Token Lifetime & Renewal:** Edge session tokens have a strict maximum time-to-live (TTL) of 12 hours. Gateways initiate silent re-authentication at the 10-hour mark.
- **Revocation Check:** Regional proxies query an in-memory Redis bloom filter synchronized with the certificate revocation list (CRL) every 60 seconds.

## 4. Media & Storage Security Prohibitions
- **Removable Media Ban:** The connection of unencrypted external storage devices (including USB flash drives, SD cards, and portable hard disks) to edge gateway hardware is strictly prohibited by security policy. Any detected USB mass storage event triggers an immediate hardware lockdown and P1 security alert.
