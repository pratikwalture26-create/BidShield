export type Role = 'OFFICER' | 'AUDITOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleTitle: string;
  department: string;
}

export type DocumentType =
  | 'PAN'
  | 'GST_CERTIFICATE'
  | 'UDYAM'
  | 'EPFO'
  | 'ESIC'
  | 'OEM_AUTHORIZATION'
  | 'MAKE_IN_INDIA'
  | 'STARTUP_INDIA'
  | 'NSIC'
  | 'INCOME_TAX'
  | 'BLACKLIST_CHECK'
  | 'OTHER';

export type ComplianceStatus =
  | 'VERIFIED'
  | 'REVIEW_REQUIRED'
  | 'DISCREPANCY'
  | 'DOCUMENT_MISSING'
  | 'EXPIRED'
  | 'NOT_APPLICABLE'
  | 'PENDING';

export type DocumentStatus =
  | 'UPLOADED'
  | 'AI_ANALYZED'
  | 'VERIFIED'
  | 'REVIEW_REQUIRED'
  | 'DISCREPANCY'
  | 'FAILED';

export interface Bid {
  id: string;
  bidNumber: string;
  title: string;
  department: string;
  category: string;
  submissionDeadline: string;
  evaluationStartDate: string;
  requiredDocuments: DocumentType[];
  complianceTemplate: string;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'COMPLETED' | 'DRAFT';
  createdAt: string;
  totalBidders: number;
}

export interface Bidder {
  id: string;
  bidId: string;
  legalName: string;
  tradeName: string;
  pan: string;
  gstin: string;
  udyamNumber: string;
  epfoNumber: string;
  esicNumber: string;
  address: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  entityMatchScore: number;
  entityMatchReason: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskScore: number;
  riskFactors: { factor: string; points: number; description: string }[];
  overallStatus: ComplianceStatus;
  officerDecision?: {
    status: 'ACCEPTED' | 'REJECTED' | 'CLARIFICATION_REQUESTED' | 'PENDING';
    notes: string;
    decidedAt: string;
    officerName: string;
    officerRole: string;
  };
}

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: number;
  matchedWithBidder?: boolean;
}

export interface BidDocument {
  id: string;
  bidId: string;
  bidderId: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  documentType: DocumentType;
  uploadStatus: 'SUCCESS' | 'PENDING' | 'FAILED';
  processingStatus: 'AI_ANALYZED' | 'PENDING' | 'PROCESSING' | 'ERROR';
  verificationStatus: ComplianceStatus;
  confidence: number;
  uploadedAt: string;
  analyzedAt?: string;
  extractedFields: Record<string, string>;
  aiSummary?: string;
  pageCount?: number;
  mockEvidencePreview?: {
    title: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    certNumber: string;
    entityName: string;
    rawSnippet: string;
  };
}

export interface ComplianceItem {
  id: string;
  bidId: string;
  bidderId: string;
  requirement: string;
  requirementCode: string;
  documentType: DocumentType;
  evidenceDocName: string;
  evidenceDocId?: string;
  page?: number;
  status: ComplianceStatus;
  confidence: number;
  ruleId: string;
  reason: string;
  extractedValues: Record<string, string>;
  verificationSource: string;
  mockMode: boolean;
  officerOverride?: {
    overridden: boolean;
    previousStatus: ComplianceStatus;
    newStatus: ComplianceStatus;
    reason: string;
    timestamp: string;
    officer: string;
  };
}

export interface Finding {
  id: string;
  bidId: string;
  bidderId: string;
  title: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'ENTITY_MISMATCH' | 'MISSING_DOCUMENT' | 'EXPIRED_CERTIFICATE' | 'OEM_AUTHORIZATION' | 'MII_LOCAL_CONTENT' | 'TAX_STATUS' | 'OTHER';
  status: ComplianceStatus;
  description: string;
  evidenceDocName: string;
  evidenceDocId?: string;
  extractedValue?: string;
  expectedValue?: string;
  ruleId: string;
  confidence: number;
  aiExplanation: string;
  recommendedOfficerAction: string;
  resolved: boolean;
  resolutionNotes?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  bidId?: string;
  bidderId?: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  ruleId?: string;
  statusAfter?: ComplianceStatus;
}

export interface MockConnectorResult {
  connectorName: string;
  source: 'MOCK';
  verificationMode: 'PROTOTYPE';
  status: 'VERIFIED' | 'REVIEW_REQUIRED' | 'DISCREPANCY' | 'NO_RECORD_FOUND' | 'NOT_APPLICABLE';
  verifiedAt: string;
  message: string;
  queryParam: string;
  disclaimer: string;
}
