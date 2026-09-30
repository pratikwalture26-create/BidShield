import {
  Bid,
  Bidder,
  BidDocument,
  ComplianceItem,
  Finding,
  AuditEvent,
  User,
  MockConnectorResult,
  ComplianceStatus,
} from '../types';
import { dbStore } from '../../server/repositories/Store.js';
import {
  MockGSTConnector,
  MockUdyamConnector,
  MockEPFOConnector,
  MockESICConnector,
  MockOEMConnector,
  MockBlacklistConnector,
} from '../../server/connectors/GovernmentVerificationConnectors.js';

export class ApiClient {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const res = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[BidShield] Network call to /api${endpoint} failed, using client memory fallback:`, err);
      return this.handleLocalFallback<T>(endpoint, options);
    }
  }

  // Resilient fallback logic in case of static hosting or serverless cold-start latency
  private static handleLocalFallback<T>(endpoint: string, options: RequestInit = {}): T {
    const cleanUrl = endpoint.split('?')[0];
    const urlParams = new URLSearchParams(endpoint.includes('?') ? endpoint.split('?')[1] : '');
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body ? JSON.parse(options.body as string) : {};

    // 1. Dashboard
    if (cleanUrl === '/dashboard') {
      const bids = dbStore.getBids();
      const bidders = dbStore.getBidders();
      const docs = dbStore.getDocuments();
      const findings = dbStore.getFindings();
      const complianceItems = dbStore.getComplianceItems();

      return {
        kpis: {
          totalBids: bids.length,
          underReview: bids.filter(b => b.status === 'UNDER_REVIEW').length,
          verifiedBidders: bidders.filter(b => b.overallStatus === 'VERIFIED').length,
          reviewRequiredBidders: bidders.filter(b => b.overallStatus === 'REVIEW_REQUIRED').length,
          criticalFindings: findings.filter(f => f.severity === 'CRITICAL').length,
          documentsProcessed: docs.filter(d => d.processingStatus === 'AI_ANALYZED').length,
        },
        complianceStatusCounts: {
          VERIFIED: complianceItems.filter(c => c.status === 'VERIFIED').length,
          REVIEW_REQUIRED: complianceItems.filter(c => c.status === 'REVIEW_REQUIRED').length,
          DISCREPANCY: complianceItems.filter(c => c.status === 'DISCREPANCY').length,
          DOCUMENT_MISSING: complianceItems.filter(c => c.status === 'DOCUMENT_MISSING').length,
          EXPIRED: complianceItems.filter(c => c.status === 'EXPIRED').length,
        },
        findingsByCategory: {
          ENTITY_MISMATCH: findings.filter(f => f.category === 'ENTITY_MISMATCH').length,
          OEM_AUTHORIZATION: findings.filter(f => f.category === 'OEM_AUTHORIZATION').length,
          MII_LOCAL_CONTENT: findings.filter(f => f.category === 'MII_LOCAL_CONTENT').length,
          MISSING_DOCUMENT: findings.filter(f => f.category === 'MISSING_DOCUMENT').length,
          EXPIRED_CERTIFICATE: findings.filter(f => f.category === 'EXPIRED_CERTIFICATE').length,
        },
        recentAudits: dbStore.getAuditEvents().slice(0, 5),
        activeBidsSummary: bids.slice(0, 3),
      } as unknown as T;
    }

    // 2. Users & Login
    if (cleanUrl === '/auth/users') {
      return { users: dbStore.getUsers() } as unknown as T;
    }
    if (cleanUrl === '/auth/login') {
      const users = dbStore.getUsers();
      const user = users.find(u => u.email === body.email) || users[0];
      return { user, token: `demo-token-${Date.now()}` } as unknown as T;
    }

    // 3. Bids
    if (cleanUrl === '/bids' && method === 'GET') {
      return { bids: dbStore.getBids() } as unknown as T;
    }
    if (cleanUrl === '/bids' && method === 'POST') {
      const newBid = dbStore.createBid(body);
      return { bid: newBid } as unknown as T;
    }
    if (cleanUrl.startsWith('/bids/') && cleanUrl.endsWith('/bidders') && method === 'GET') {
      const parts = cleanUrl.split('/');
      const bidId = parts[2];
      return { bidders: dbStore.getBidders(bidId) } as unknown as T;
    }
    if (cleanUrl.startsWith('/bids/') && cleanUrl.endsWith('/bidders') && method === 'POST') {
      const parts = cleanUrl.split('/');
      const bidId = parts[2];
      const newBidder = dbStore.createBidder({ ...body, bidId });
      return { bidder: newBidder } as unknown as T;
    }
    if (cleanUrl.startsWith('/bids/') && !cleanUrl.includes('/documents') && !cleanUrl.includes('/verify') && !cleanUrl.includes('/compliance') && !cleanUrl.includes('/findings') && !cleanUrl.includes('/evidence') && !cleanUrl.includes('/audit') && !cleanUrl.includes('/report') && method === 'GET') {
      const parts = cleanUrl.split('/');
      const bidId = parts[2];
      const bid = dbStore.getBidById(bidId);
      const bidders = dbStore.getBidders(bidId);
      return { bid, bidders } as unknown as T;
    }

    // 4. Bidders
    if (cleanUrl.startsWith('/bidders/') && method === 'GET') {
      const bidderId = cleanUrl.split('/')[2];
      const bidder = dbStore.getBidderById(bidderId);
      return {
        bidder,
        documents: dbStore.getDocuments(bidderId),
        complianceItems: dbStore.getComplianceItems(bidderId),
        findings: dbStore.getFindings(bidderId),
      } as unknown as T;
    }

    // 5. Documents
    if (cleanUrl.includes('/documents') && method === 'GET') {
      const bidderId = urlParams.get('bidderId') || undefined;
      return { documents: dbStore.getDocuments(bidderId) } as unknown as T;
    }
    if (cleanUrl.includes('/documents') && method === 'POST') {
      const doc = dbStore.addDocument({
        ...body,
        uploadStatus: 'SUCCESS',
        processingStatus: 'AI_ANALYZED',
        verificationStatus: 'VERIFIED',
        confidence: 0.95,
        extractedFields: {
          status: 'Active',
          entity: body.fileName,
          date: new Date().toLocaleDateString(),
        },
        aiSummary: `Document ${body.fileName} extracted with structured fields.`,
      });
      return { document: doc } as unknown as T;
    }
    if (cleanUrl.startsWith('/documents/') && cleanUrl.endsWith('/analyze')) {
      const docId = cleanUrl.split('/')[2];
      const doc = dbStore.getDocumentById(docId);
      if (doc) {
        doc.processingStatus = 'AI_ANALYZED';
        doc.confidence = 0.97;
      }
      return { document: doc } as unknown as T;
    }

    // 6. Verify
    if (cleanUrl.includes('/verify') && method === 'POST') {
      const bidderId = body.bidderId;
      if (bidderId) {
        dbStore.recalculateBidderCompliance(bidderId);
      }
      return {
        success: true,
        compliance: dbStore.getComplianceItems(bidderId),
        findings: dbStore.getFindings(bidderId),
        bidder: bidderId ? dbStore.getBidderById(bidderId) : undefined,
      } as unknown as T;
    }

    // 7. Compliance, Findings, Evidence, Audit, Report
    if (cleanUrl.includes('/compliance') && method === 'GET') {
      const bidderId = urlParams.get('bidderId') || undefined;
      return { compliance: dbStore.getComplianceItems(bidderId) } as unknown as T;
    }
    if (cleanUrl.includes('/findings') && method === 'GET') {
      const bidderId = urlParams.get('bidderId') || undefined;
      return { findings: dbStore.getFindings(bidderId) } as unknown as T;
    }
    if (cleanUrl.includes('/evidence') && method === 'GET') {
      const bidderId = urlParams.get('bidderId') || undefined;
      const documentId = urlParams.get('documentId') || undefined;
      if (documentId) {
        return { document: dbStore.getDocumentById(documentId) } as unknown as T;
      }
      return { documents: dbStore.getDocuments(bidderId) } as unknown as T;
    }
    if (cleanUrl.includes('/audit') && method === 'GET') {
      const parts = cleanUrl.split('/');
      const bidId = parts[2];
      return { auditTrail: dbStore.getAuditEvents(bidId) } as unknown as T;
    }
    if (cleanUrl.includes('/report') && method === 'GET') {
      const parts = cleanUrl.split('/');
      const bidId = parts[2];
      const bidderId = urlParams.get('bidderId') || 'bidder-001';
      const bid = dbStore.getBidById(bidId);
      const bidder = dbStore.getBidderById(bidderId);
      const docs = dbStore.getDocuments(bidderId);
      const compliance = dbStore.getComplianceItems(bidderId);
      const findings = dbStore.getFindings(bidderId);
      const auditTrail = dbStore.getAuditEvents(bid?.id);

      return {
        report: {
          generatedAt: new Date().toISOString(),
          reportId: `BS-REP-${bid?.bidNumber.replace(/\//g, '-')}-${bidder?.pan}`,
          bid,
          bidder,
          summary: {
            totalDocsChecked: docs.length,
            verified: compliance.filter(c => c.status === 'VERIFIED').length,
            reviewRequired: compliance.filter(c => c.status === 'REVIEW_REQUIRED').length,
            discrepancies: compliance.filter(c => c.status === 'DISCREPANCY').length,
            missing: compliance.filter(c => c.status === 'DOCUMENT_MISSING').length,
            expired: compliance.filter(c => c.status === 'EXPIRED').length,
            riskLevel: bidder?.riskLevel || 'MEDIUM',
            riskScore: bidder?.riskScore || 40,
            humanReviewStatus: bidder?.officerDecision ? bidder.officerDecision.status : 'PENDING_OFFICER_REVIEW',
          },
          documents: docs,
          compliance,
          findings,
          auditTrail,
          legalDisclaimer: 'BidShield provides AI-assisted compliance verification and decision support. Final procurement decisions remain with the authorized procurement officer.',
        },
      } as unknown as T;
    }

    // 8. Officer Decision
    if (cleanUrl.includes('/decision') && method === 'POST') {
      const parts = cleanUrl.split('/');
      const bidderId = parts[4];
      const updatedBidder = dbStore.recordOfficerDecision(bidderId, body);
      return { bidder: updatedBidder } as unknown as T;
    }

    // 9. Compliance Override
    if (cleanUrl === '/compliance/override' && method === 'POST') {
      const item = dbStore.updateComplianceItemOverride(body.itemId, body.newStatus, body.reason, body.officer);
      return { item } as unknown as T;
    }

    // 10. Connectors Status
    if (cleanUrl === '/connectors/status') {
      const now = new Date().toISOString();
      return {
        connectors: [
          {
            connectorName: 'GSTN / Goods & Services Tax Network',
            source: 'MOCK',
            verificationMode: 'PROTOTYPE',
            status: 'VERIFIED',
            verifiedAt: now,
            queryParam: '29ABCDE1234F1Z5',
            message: 'Mock GST verification succeeded. Active taxpayer.',
            disclaimer: 'Prototype / Mock Verification',
          },
          {
            connectorName: 'Ministry of MSME / Udyam Registration Portal',
            source: 'MOCK',
            verificationMode: 'PROTOTYPE',
            status: 'VERIFIED',
            verifiedAt: now,
            queryParam: 'UDYAM-KR-03-0049281',
            message: 'Mock MSME status verified for Small Enterprise category.',
            disclaimer: 'Prototype / Mock Verification',
          },
          {
            connectorName: 'Employees Provident Fund Organisation (EPFO)',
            source: 'MOCK',
            verificationMode: 'PROTOTYPE',
            status: 'VERIFIED',
            verifiedAt: now,
            queryParam: 'DL/CPM/1048291',
            message: 'Establishment code active in mock database.',
            disclaimer: 'Prototype / Mock Verification',
          },
          {
            connectorName: 'Employees State Insurance Corporation (ESIC)',
            source: 'MOCK',
            verificationMode: 'PROTOTYPE',
            status: 'VERIFIED',
            verifiedAt: now,
            queryParam: '11000984720001001',
            message: 'Monthly contributions verified in mock registry.',
            disclaimer: 'Prototype / Mock Verification',
          },
          {
            connectorName: 'OEM Independent Direct Verification Gateway',
            source: 'MOCK',
            verificationMode: 'PROTOTYPE',
            status: 'REVIEW_REQUIRED',
            verifiedAt: now,
            queryParam: 'OEM/2026/123-IN',
            message: 'Direct electronic confirmation pending via OEM mock gateway.',
            disclaimer: 'Prototype / Mock Verification',
          },
          {
            connectorName: 'Central Debarment & Blacklisting Registry',
            source: 'MOCK',
            verificationMode: 'PROTOTYPE',
            status: 'NO_RECORD_FOUND',
            verifiedAt: now,
            queryParam: 'ABCDE1234F',
            message: 'No adverse debarment or holiday list record found.',
            disclaimer: 'Prototype / Mock Verification',
          },
        ],
      } as unknown as T;
    }

    // 11. Demo Reset
    if (cleanUrl === '/demo/reset') {
      dbStore.resetToDemo();
      return { message: 'Database reset to initial demo state successfully.' } as unknown as T;
    }

    return {} as unknown as T;
  }

  static async getDashboard() {
    return this.request<{
      kpis: {
        totalBids: number;
        underReview: number;
        verifiedBidders: number;
        reviewRequiredBidders: number;
        criticalFindings: number;
        documentsProcessed: number;
      };
      complianceStatusCounts: Record<string, number>;
      findingsByCategory: Record<string, number>;
      recentAudits: AuditEvent[];
      activeBidsSummary: Bid[];
    }>('/dashboard');
  }

  static async getUsers() {
    return this.request<{ users: User[] }>('/auth/users');
  }

  static async login(email: string) {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  static async getBids() {
    return this.request<{ bids: Bid[] }>('/bids');
  }

  static async getBid(id: string) {
    return this.request<{ bid: Bid; bidders: Bidder[] }>(`/bids/${id}`);
  }

  static async createBid(bidData: Partial<Bid>) {
    return this.request<{ bid: Bid }>('/bids', {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  }

  static async getBidders(bidId: string) {
    return this.request<{ bidders: Bidder[] }>(`/bids/${bidId}/bidders`);
  }

  static async getBidder(id: string) {
    return this.request<{
      bidder: Bidder;
      documents: BidDocument[];
      complianceItems: ComplianceItem[];
      findings: Finding[];
    }>(`/bidders/${id}`);
  }

  static async createBidder(bidId: string, bidderData: Partial<Bidder>) {
    return this.request<{ bidder: Bidder }>(`/bids/${bidId}/bidders`, {
      method: 'POST',
      body: JSON.stringify(bidderData),
    });
  }

  static async getDocuments(bidId: string, bidderId?: string) {
    const q = bidderId ? `?bidderId=${bidderId}` : '';
    return this.request<{ documents: BidDocument[] }>(`/bids/${bidId}/documents${q}`);
  }

  static async uploadDocument(bidId: string, data: {
    bidderId: string;
    fileName: string;
    documentType: string;
    fileType?: string;
    fileSize?: string;
    rawTextSnippet?: string;
  }) {
    return this.request<{ document: BidDocument }>(`/bids/${bidId}/documents`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async analyzeDocument(docId: string) {
    return this.request<{ document: BidDocument }>(`/documents/${docId}/analyze`, {
      method: 'POST',
    });
  }

  static async verifyBid(bidId: string, bidderId?: string) {
    return this.request<{
      success: boolean;
      compliance: ComplianceItem[];
      findings: Finding[];
      bidder?: Bidder;
    }>(`/bids/${bidId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ bidderId }),
    });
  }

  static async getCompliance(bidId: string, bidderId?: string) {
    const q = bidderId ? `?bidderId=${bidderId}` : '';
    return this.request<{ compliance: ComplianceItem[] }>(`/bids/${bidId}/compliance${q}`);
  }

  static async getFindings(bidId: string, bidderId?: string) {
    const q = bidderId ? `?bidderId=${bidderId}` : '';
    return this.request<{ findings: Finding[] }>(`/bids/${bidId}/findings${q}`);
  }

  static async getEvidence(bidId: string, bidderId?: string, documentId?: string) {
    const params = new URLSearchParams();
    if (bidderId) params.set('bidderId', bidderId);
    if (documentId) params.set('documentId', documentId);
    const q = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ documents?: BidDocument[]; document?: BidDocument }>(`/bids/${bidId}/evidence${q}`);
  }

  static async getAuditTrail(bidId: string) {
    return this.request<{ auditTrail: AuditEvent[] }>(`/bids/${bidId}/audit`);
  }

  static async getReport(bidId: string, bidderId: string) {
    return this.request<{
      report: {
        generatedAt: string;
        reportId: string;
        bid: Bid;
        bidder: Bidder;
        summary: {
          totalDocsChecked: number;
          verified: number;
          reviewRequired: number;
          discrepancies: number;
          missing: number;
          expired: number;
          riskLevel: string;
          riskScore: number;
          humanReviewStatus: string;
        };
        documents: BidDocument[];
        compliance: ComplianceItem[];
        findings: Finding[];
        auditTrail: AuditEvent[];
        legalDisclaimer: string;
      };
    }>(`/bids/${bidId}/report?bidderId=${bidderId}`);
  }

  static async recordDecision(bidId: string, bidderId: string, decision: {
    status: 'ACCEPTED' | 'REJECTED' | 'CLARIFICATION_REQUESTED';
    notes: string;
    officerName?: string;
    officerRole?: string;
  }) {
    return this.request<{ bidder: Bidder }>(`/bids/${bidId}/bidders/${bidderId}/decision`, {
      method: 'POST',
      body: JSON.stringify(decision),
    });
  }

  static async overrideComplianceItem(itemId: string, newStatus: ComplianceStatus, reason: string, officer?: string) {
    return this.request<{ item: ComplianceItem }>('/compliance/override', {
      method: 'POST',
      body: JSON.stringify({ itemId, newStatus, reason, officer }),
    });
  }

  static async getConnectorsStatus() {
    return this.request<{ connectors: MockConnectorResult[] }>('/connectors/status');
  }

  static async resetDemo() {
    return this.request<{ message: string }>('/demo/reset', {
      method: 'POST',
    });
  }
}
