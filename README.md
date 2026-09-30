# BidShield

```{=html}
<p align="center">
```
`<img src="assets/bidshield-logo.png" alt="BidShield Logo" width="220">`{=html}
```{=html}
</p>
```
```{=html}
<h1 align="center">
```
BidShield
```{=html}
</h1>
```
```{=html}
<p align="center">
```
`<strong>`{=html}AI-Powered Integrated Bid Compliance Verification
Platform for GeM Procurement`</strong>`{=html}
```{=html}
</p>
```
```{=html}
<p align="center">
```
`<em>`{=html}Verify once. Cross-check automatically. Decide with
confidence.`</em>`{=html}
```{=html}
</p>
```

------------------------------------------------------------------------

## Overview

**BidShield** is an AI-assisted procurement compliance verification
platform designed to help procurement officers verify bidder eligibility
and supporting documentation for GeM procurement.

It brings document intelligence, cross-document verification,
deterministic compliance rules, evidence tracking, audit trails, and
report generation into a unified workflow.

> **Important:** BidShield is a decision-support system. It assists
> authorized procurement officers and does not autonomously approve or
> reject bidders.

## Problem Statement

**Problem Statement ID:** 26100

Government procurement evaluation can involve PAN, GST, Udyam/MSME,
EPFO/ESIC, Startup India, NSIC, OEM authorization, Make in
India/local-content declarations, DigiLocker-supported documents,
blacklisting/debarment information, and other tender-specific
requirements.

BidShield aims to reduce manual effort and inconsistencies by providing
a single evidence-backed workspace for these checks.

## Core Features

-   AI document classification and structured field extraction
-   OCR/document understanding
-   Cross-document entity and field matching
-   Configurable deterministic compliance rules
-   Missing, expired, and inconsistent-document detection
-   Evidence-backed findings
-   Prototype risk/anomaly analysis
-   Role-based access for Officer, Auditor, and Administrator
-   Complete audit trail
-   Compliance report generation
-   Demo mode with fictional sample data
-   Mock verification connectors designed to be replaceable by
    authorized integrations

## Core Workflow

``` text
Login
  ↓
Dashboard
  ↓
Create / Open Bid
  ↓
Add Bidder
  ↓
Upload Documents
  ↓
AI Document Analysis
  ↓
Extract Structured Fields
  ↓
Cross-Document Verification
  ↓
Compliance Rule Engine
  ↓
Risk / Anomaly Analysis
  ↓
Review Findings & Evidence
  ↓
Generate Compliance Report
  ↓
Human Officer Decision
```

## Technology Stack

  -----------------------------------------------------------------------
  Layer                               Technology
  ----------------------------------- -----------------------------------
  Frontend                            React + TypeScript + Tailwind CSS

  Backend                             Node.js + TypeScript + REST API

  AI                                  Gemini API with structured JSON
                                      output

  Document Processing                 OCR + PDF/image processing + Gemini
                                      document understanding

  Database                            MongoDB-compatible repository
                                      interface

  Object Storage                      Amazon S3-compatible storage
                                      interface

  ML/Risk                             Future Python + FastAPI + XGBoost

  Prototype Risk                      Transparent deterministic risk
                                      analysis

  Background Jobs                     Redis + BullMQ

  Authentication                      JWT + RBAC

  Deployment                          Docker + AWS-compatible
                                      architecture

  Version Control                     Git + GitHub
  -----------------------------------------------------------------------

## System Architecture

``` text
                    ┌─────────────────────────┐
                    │     React Frontend      │
                    │   TypeScript + Tailwind │
                    └────────────┬────────────┘
                                 │ HTTPS
                                 ▼
                    ┌─────────────────────────┐
                    │ Node.js + TypeScript     │
                    │ Application API          │
                    │                         │
                    │ Auth • Bids • Documents │
                    │ Compliance • Reports     │
                    │ Audit • Notifications    │
                    └───────┬─────────┬───────┘
                            │         │
                   ┌────────┘         └─────────┐
                   ▼                            ▼
             ┌─────────────┐              ┌─────────────┐
             │   MongoDB   │              │     S3      │
             │ AI results  │              │ PDFs/images │
             │ Evidence    │              │ Reports     │
             │ Verification│              │ Documents   │
             └─────────────┘              └─────────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Python FastAPI       │
                 │ Future AI/ML Service │
                 │                      │
                 │ OCR                  │
                 │ Gemini / NLP        │
                 │ XGBoost             │
                 └──────────────────────┘
```

## AI and Compliance Architecture

Gemini should extract, identify, explain, and summarize. It should
**not** make the final procurement decision.

``` text
Uploaded Document
       ↓
OCR / Document Understanding
       ↓
Gemini
       ↓
Structured JSON
       ↓
Entity Resolution
       ↓
Deterministic Compliance Rules
       ↓
Verification Result
       ↓
AI Explanation
       ↓
Human Officer
```

Example extraction:

``` json
{
  "documentType": "GST_CERTIFICATE",
  "extractedFields": {
    "gstin": "27XXXXXXXXXXXXXX",
    "legalName": "ABC Technologies Pvt Ltd",
    "registrationDate": "2024-01-15",
    "status": "ACTIVE"
  },
  "confidence": 0.97,
  "potentialIssues": []
}
```

## Compliance Statuses

-   `VERIFIED`
-   `REVIEW_REQUIRED`
-   `DISCREPANCY`
-   `DOCUMENT_MISSING`
-   `EXPIRED`
-   `NOT_APPLICABLE`
-   `PENDING`

Example compliance matrix:

  Requirement         Evidence    Status              Confidence
  ------------------- ----------- ----------------- ------------
  PAN                 PAN.pdf     VERIFIED                   99%
  GST                 GST.pdf     VERIFIED                   97%
  Udyam               Udyam.pdf   VERIFIED                   94%
  EPFO                EPFO.pdf    VERIFIED                   93%
  ESIC                ESIC.pdf    VERIFIED                   95%
  OEM Authorization   OEM.pdf     REVIEW_REQUIRED            82%
  Make in India       MII.pdf     DISCREPANCY                76%

## Evidence Model

Every finding should be traceable:

``` text
Requirement
     ↓
Evidence Document
     ↓
Extracted Field
     ↓
Verification Source
     ↓
Compliance Rule
     ↓
Result
```

Example:

``` text
Finding:
OEM Authorization

Evidence:
OEM_Authorization.pdf

Result:
REVIEW_REQUIRED

Reason:
Prototype connector could not independently validate the authorization.

Source:
Uploaded document

Verification:
Prototype / Mock Verification
```

## Prototype Verification Connectors

Use interfaces such as:

``` text
GovernmentVerificationConnector
        │
        ├── MockGSTConnector
        ├── MockUdyamConnector
        ├── MockEPFOConnector
        ├── MockESICConnector
        ├── MockStartupConnector
        ├── MockNSICConnector
        ├── MockOEMConnector
        └── MockBlacklistConnector
```

**Do not claim live access to government systems unless an authorized
API/integration actually exists.**

All prototype results must be clearly labelled:

> **Prototype / Mock Verification**

## Prototype Risk Analysis

The prototype can calculate a transparent risk/anomaly indication using:

-   Missing required documents
-   Expired certificates
-   Entity mismatches
-   Address mismatches
-   Verification failures
-   Low extraction confidence
-   Unresolved findings

Future architecture:

``` text
Node.js
   ↓
Python FastAPI
   ↓
XGBoost
   ↓
Risk / Anomaly Analysis
```

The prototype risk indication is not an official procurement score.

## User Roles

### Procurement Officer

-   Create and manage bids
-   Add bidders
-   Upload documents
-   Run verification
-   Review findings
-   Generate reports

### Auditor

-   Review evidence
-   Inspect findings
-   Review audit trail

### Administrator

-   Manage users
-   Manage rules
-   Configure the platform

## Demo Scenario

Use fictional data only.

``` text
Bid:
GEM/2026/B/001245

Bidder:
ABC Technologies Pvt Ltd
```

Documents:

``` text
PAN.pdf
GST.pdf
Udyam.pdf
OEM_Authorization.pdf
EPFO.pdf
ESIC.pdf
MII_Declaration.pdf
```

Example results:

``` text
PAN                 VERIFIED
GST                 VERIFIED
Udyam               VERIFIED
EPFO                VERIFIED
ESIC                VERIFIED
OEM Authorization   REVIEW_REQUIRED
Make in India       DISCREPANCY
```

## Demo Mode

The application should provide a **Load Demo Bid** action that
immediately populates:

-   Bid
-   Bidder
-   Documents
-   AI extraction
-   Compliance results
-   Findings
-   Evidence
-   Audit history
-   Report

The demo should work without live government APIs.

## Security

Prototype security should include:

-   RBAC
-   Input validation
-   File type/size validation
-   API error handling
-   Environment variables for secrets
-   No API keys in frontend code
-   Audit logging
-   Controlled document access
-   Safe rendering of extracted content

Never hardcode a Gemini API key.

## Suggested Project Structure

``` text
BidShield/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── features/
│       ├── services/
│       ├── hooks/
│       └── utils/
├── backend/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── rules/
│   ├── connectors/
│   ├── audit/
│   └── reports/
├── ai/
│   ├── extraction/
│   ├── prompts/
│   ├── schemas/
│   ├── verification/
│   └── risk/
├── assets/
│   └── bidshield-logo.png
├── README.md
├── .env.example
└── docker-compose.yml
```

## Future Production Architecture

``` text
Flutter / Web Frontend
          ↓
Node.js + TypeScript + NestJS
          ↓
REST API
     ┌────┴────┐
     ▼         ▼
 MongoDB      S3
     │         │
     └────┬────┘
          ▼
    Python FastAPI
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
   OCR  Gemini XGBoost
    │     │     │
    └─────┼─────┘
          ▼
 Compliance Engine
          ▼
 Evidence + Audit
          ▼
 Human Officer
```

## Roadmap

### Phase 1 --- Prototype

-   UI/UX
-   Demo mode
-   Document upload
-   Gemini extraction
-   Entity matching
-   Compliance rules
-   Evidence viewer
-   Audit trail
-   Report generation

### Phase 2 --- AI/ML

-   Advanced OCR
-   Entity resolution
-   Python FastAPI service
-   XGBoost
-   Advanced anomaly detection

### Phase 3 --- Infrastructure

-   MongoDB Atlas
-   Amazon S3
-   Redis/BullMQ
-   Docker
-   CI/CD
-   Monitoring
-   Production authentication

### Phase 4 --- Authorized Integrations

-   GeM integration where authorized
-   GST verification
-   Udyam verification
-   EPFO / ESIC
-   Startup / NSIC
-   DigiLocker-supported verification
-   Authorized blacklist/debarment sources

## Branding

**Product:** BidShield

**Tagline:**\
\> Verify once. Cross-check automatically. Decide with confidence.

**Description:**\
\> AI-assisted compliance verification for GeM procurement.

The supplied logo in `assets/bidshield-logo.png` is the official
prototype logo and should be used for:

-   Application header
-   Login screen
-   Sidebar
-   Favicon
-   Report cover
-   Documentation

## Project Philosophy

1.  **Evidence First** --- every finding should have supporting
    evidence.
2.  **AI-Assisted** --- AI accelerates document understanding.
3.  **Rules-Based Compliance** --- deterministic rules provide
    transparent compliance logic.
4.  **Human-in-the-Loop** --- authorized officers retain final decision
    authority.
5.  **Auditability** --- important actions remain traceable.

## Final Value Proposition

> **BidShield transforms fragmented, manual bidder verification into an
> evidence-backed, AI-assisted compliance workflow.**

------------------------------------------------------------------------

### License

This project is a prototype for demonstration and innovation purposes.
Production deployment requires appropriate legal, security, procurement,
data-protection, and government-integration review.
