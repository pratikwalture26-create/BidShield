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

export class ApiClient {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { error: errorText || `HTTP ${res.status}` };
      }
      throw new Error(errorJson.error || `Request failed with status ${res.status}`);
    }
    return res.json();
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
