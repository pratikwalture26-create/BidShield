# BidShield 🛡️

<p align="center">
  <img src="assets/bidshield-logo.png" alt="BidShield Logo" width="220"/>
</p>

<h3 align="center">AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement</h3>

<p align="center"><b>Smart India Hackathon 2026 · Problem Statement 26100</b></p>

---

## 📌 Overview

**BidShield** is an AI-powered bid compliance verification platform designed to reduce the manual effort involved in evaluating bidder eligibility and statutory compliance for Government e-Marketplace (GeM) procurement.

The platform ingests tender and bidder documents, extracts relevant information using OCR and AI/NLP, applies deterministic compliance rules, performs cross-document consistency checks, and presents evidence-backed findings to a human reviewer.

> **Design principle:** AI assists the procurement officer; final compliance decisions remain subject to human review and approval.

---

## 🎯 Problem Statement

Government procurement can require verification of requirements including:

- Udyam/MSME registration
- GST registration and return-related evidence
- PAN and Income Tax compliance
- Make in India / local-content requirements
- EPFO / ESIC compliance
- Startup India eligibility
- NSIC-related evidence
- OEM authorization
- DigiLocker / digitally verifiable documents
- Blacklisting / debarment-related checks
- Tender-specific eligibility conditions

BidShield addresses this through:

**Document ingestion → OCR → AI/NLP extraction → requirement mapping → deterministic rule checks → cross-document validation → evidence-backed findings → human review → signed-off report**

---

# 🏗️ Technical Architecture & Data Flow

<p align="center">
  <img src="assets/technical-architecture-data-flow.png" alt="BidShield Technical Architecture and Data Flow" width="100%"/>
</p>

### 1. Document Ingestion

```text
GeM Tender / Bid Document Upload
              ↓
     File Validation & Access Control
              ↓
        PDF / DOCX / XLSX
              ↓
       Text + OCR Extraction
```

### 2. AI Extraction Engine

```text
NLP Clause Parsing & Requirement Mapping
                    ↓
       Eligibility & Threshold Checks
                    ↓
       Cross-Document Consistency Checks
                    ↓
             Rule Result + Confidence
                    ↓
       Pass / Flag / Fail Status
```

Missing evidence can be routed to the reviewer for manual verification.

### 3. Compliance Rule Engine

```text
Compliance Findings + Source References
                    ↓
        Reviewer Dashboard & Case Assignment
                    ↓
        Reviewer Feedback & Rule Updates
```

### 4. Reporting & Audit

```text
Decision Log & Audit Trail
          ↓
Final Human Approval
          ↓
Exportable PDF / XLSX Report
          ↓
Compliance Summary & Analytics
```

### 5. Human Review Workflow

```text
Officer Reviews Flagged Clauses
              ↓
      Accept / Reject Finding
              ↓
      Verify Evidence & Context
              ↓
      Resolve Exception with Remarks
              ↓
       Signed-Off Compliance Report
```

---

# 🧰 Technology Stack

| Layer | Technology | Role |
|---|---|---|
| Frontend | **React.js** | Reviewer dashboard and document workspace |
| Backend | **Python** | Backend services and AI orchestration |
| API Layer | **FastAPI** | REST APIs and service integration |
| Database | **PostgreSQL** | Tender, bidder, compliance and audit metadata |
| Vector Database | **pgvector / PostgreSQL** | Document embeddings and semantic retrieval |
| LLM / NLP | **Google Gemini** | Clause extraction, requirement mapping and document understanding |
| OCR Engine | **PaddleOCR** | Text extraction from scanned/image-based documents |
| PDF Processing | **PyMuPDF** | PDF text and data extraction |
| Rule Engine | **Python deterministic rules** | Eligibility and threshold checks |
| Authentication | **JWT** | Secure API authentication |
| Authorization | **RBAC** | Role-based access control |
| Object Storage | **AWS S3** | Documents and generated reports |
| Async Processing | **Celery + Redis** | Background OCR/AI/report jobs |
| ML / Risk Analysis | **XGBoost / scikit-learn** | Optional future anomaly/risk analysis |
| Containers | **Docker** | Reproducible development and deployment |
| Version Control | **Git + GitHub** | Source control and collaboration |

### Core stack shown in the architecture

```text
React → Python → PostgreSQL → Vector Database → LLM/NLP
      → OCR Engine → Rule Engine → PyMuPDF → JWT + RBAC
```

---

# 🤖 AI Pipeline

BidShield uses a hybrid **AI + deterministic rules + human-in-the-loop** architecture.

```text
                    ┌─────────────────────┐
                    │  Tender / Bid Docs  │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ File Validation     │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ OCR / PDF Parsing   │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Gemini / NLP        │
                    │ Clause Extraction   │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Requirement Mapping │
                    └──────────┬──────────┘
                               ↓
                 ┌─────────────┴─────────────┐
                 ↓                           ↓
        ┌─────────────────┐        ┌─────────────────┐
        │ Vector Retrieval│        │ Compliance Rules│
        └────────┬────────┘        └────────┬────────┘
                 └─────────────┬─────────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Cross-Document      │
                    │ Consistency Checks  │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Evidence + Result   │
                    │ + Confidence        │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Human Reviewer      │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Final Report / Log  │
                    └─────────────────────┘
```

---

# 🔎 Evidence-First Compliance

Every automated finding should be associated with supporting evidence.

```json
{
  "requirement": "MSME registration evidence",
  "status": "FLAG",
  "confidence": 0.91,
  "source_document": "udyam_certificate.pdf",
  "page": 1,
  "evidence": "Extracted registration details...",
  "rule_id": "MSME-001",
  "review_required": true
}
```

This makes findings easier for reviewers to inspect and audit.

---

# 🧩 Key Modules

### Document Management
- Upload tender/bid documents
- Validate file types
- Track document versions
- Store documents securely
- Associate documents with tenders and bidders

### OCR & Document Extraction
- Extract text from scanned PDFs
- Process PDF/DOCX/XLSX inputs
- Preserve page/document references
- Normalize extracted text

### AI/NLP Extraction
- Identify compliance clauses
- Extract entities and values
- Map clauses to compliance requirements
- Generate structured extraction results

### Compliance Rule Engine
Rules can evaluate:
- Required documents
- Eligibility thresholds
- Dates and validity
- Registration identifiers
- Cross-document consistency
- Tender-specific requirements
- Missing evidence

### Vector Retrieval
Retrieve relevant:
- Tender clauses
- Bidder evidence
- Supporting documents
- Compliance rules
- Previous reviewed context

### Reviewer Dashboard
Reviewers can:
- View flagged findings
- Open source documents
- Inspect evidence
- Accept/reject findings
- Add remarks
- Resolve exceptions
- Complete final approval

### Reporting & Audit
Generate:
- Compliance summaries
- Requirement-level findings
- Evidence references
- Reviewer remarks
- Decision logs
- PDF reports
- XLSX reports

---

# 🔐 Security & Governance

The production system should include:

- JWT authentication
- Role-based access control
- Encryption in transit
- Encryption at rest
- Secure object storage
- Document access policies
- Audit logging
- Input/file validation
- Malware scanning for uploaded files
- Secrets management
- Human approval for final decisions

---

# 👥 Suggested User Roles

| Role | Responsibilities |
|---|---|
| **Procurement Officer** | Review compliance findings and approve/reject evidence |
| **Reviewer/Auditor** | Investigate flagged cases and audit decisions |
| **Administrator** | Manage users, roles and configuration |
| **Rule Manager** | Maintain compliance rules and mappings |

---

# 📊 Compliance Status Model

```text
PASS
 └── Evidence satisfies the configured rule

FLAG
 └── Evidence is incomplete, ambiguous,
     inconsistent or requires human review

FAIL
 └── Configured deterministic rule is not satisfied
```

The status should be accompanied by evidence, rule information and source references.

---

# 🚀 Prototype Scope

For the initial Smart India Hackathon prototype:

- Tender creation
- Bidder registration
- PDF/DOCX upload
- OCR
- AI clause extraction
- Requirement mapping
- Sample compliance rules
- Cross-document consistency checks
- Evidence references
- Reviewer dashboard
- Human approval
- PDF/XLSX report
- Audit log

### Future Expansion

- Additional authorized government data integrations
- DigiLocker integration where applicable
- More statutory compliance modules
- Advanced document anomaly detection
- Rule authoring interface
- Enterprise SSO
- Distributed processing
- Advanced analytics
- Production-grade cloud deployment

---

# 🗂️ Suggested Repository Structure

```text
BidShield/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── rules/
│   │   ├── ai/
│   │   └── main.py
│   └── requirements.txt
│
├── workers/
│   ├── ocr/
│   ├── extraction/
│   └── reports/
│
├── database/
│   ├── migrations/
│   └── seed/
│
├── docs/
│   ├── architecture/
│   └── api/
│
├── assets/
│   ├── bidshield-logo.png
│   └── technical-architecture-data-flow.png
│
├── .env.example
├── docker-compose.yml
├── README.md
└── LICENSE
```

---

# 🛠️ Local Development

## Prerequisites

- Node.js
- Python 3.11+
- PostgreSQL
- Git
- Docker
- Google Gemini API credentials

## Environment Variables

Create `.env` using `.env.example`.

```env
DATABASE_URL=postgresql://user:password@localhost:5432/bidshield
GEMINI_API_KEY=your_api_key
JWT_SECRET=change_me
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=bidshield-documents
REDIS_URL=redis://localhost:6379/0
```

**Never commit real credentials or secrets to GitHub.**

---

# 🧪 Example Workflow

```text
1. Officer creates a tender
          ↓
2. Bidder documents are uploaded
          ↓
3. BidShield validates files
          ↓
4. OCR/PDF extraction runs
          ↓
5. Gemini extracts clauses and entities
          ↓
6. Requirements are mapped
          ↓
7. Rules evaluate eligibility
          ↓
8. Cross-document checks run
          ↓
9. Findings receive PASS / FLAG / FAIL
          ↓
10. Evidence is displayed to reviewer
          ↓
11. Officer verifies flagged findings
          ↓
12. Final approval is recorded
          ↓
13. PDF/XLSX report is generated
```

---

# 📈 Design Goals

- **Explainability** — important findings should have evidence.
- **Auditability** — decisions and reviewer actions should be logged.
- **Human-in-the-loop** — automated results support authorized review.
- **Modularity** — compliance rules can evolve independently of AI extraction.
- **Scalability** — OCR and AI workloads can run asynchronously.
- **Security** — documents and credentials require controlled access.
- **Extensibility** — new compliance modules can be added independently.

---

# 🏁 Project Status

**Stage:** Prototype / Hackathon Development

Initial workflow:

> **Upload → Extract → Understand → Verify → Review → Report**

---

## ⚠️ Important Note

BidShield is a prototype demonstrating an AI-assisted compliance verification workflow. Automated extraction, classification and rule evaluation should be validated against authoritative requirements and source evidence before use in real procurement decisions.

---

<p align="center">
  <img src="assets/bidshield-logo.png" alt="BidShield" width="100"/>
  <br>
  <b>BidShield — Evidence-Driven Bid Compliance Verification</b>
</p>
