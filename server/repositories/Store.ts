import {
  Bid,
  Bidder,
  BidDocument,
  ComplianceItem,
  Finding,
  AuditEvent,
  User,
  DocumentType,
} from '../../src/types/index.js';
import { ComplianceRuleEngine } from '../rules/ComplianceRuleEngine.js';
import { RiskAnalysisService } from '../services/RiskAnalysisService.js';
import { EntityResolutionService } from '../services/EntityResolutionService.js';

export interface IDatabaseStore {
  getUsers(): User[];
  getBids(): Bid[];
  getBidById(id: string): Bid | undefined;
  createBid(bid: Omit<Bid, 'id' | 'createdAt' | 'totalBidders'>): Bid;
  getBidders(bidId?: string): Bidder[];
  getBidderById(id: string): Bidder | undefined;
  createBidder(bidder: Omit<Bidder, 'id'>): Bidder;
  getDocuments(bidderId?: string): BidDocument[];
  getDocumentById(id: string): BidDocument | undefined;
  addDocument(doc: Omit<BidDocument, 'id' | 'uploadedAt'>): BidDocument;
  getComplianceItems(bidderId?: string): ComplianceItem[];
  getFindings(bidderId?: string): Finding[];
  getAuditEvents(bidId?: string): AuditEvent[];
  addAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent;
  recordOfficerDecision(bidderId: string, decision: any): Bidder | undefined;
  updateComplianceItemOverride(itemId: string, newStatus: any, reason: string, officer: string): ComplianceItem | undefined;
  resetToDemo(): void;
}

export class MemoryStore implements IDatabaseStore {
  private users: User[] = [];
  private bids: Bid[] = [];
  private bidders: Bidder[] = [];
  private documents: BidDocument[] = [];
  private complianceItems: ComplianceItem[] = [];
  private findings: Finding[] = [];
  private auditEvents: AuditEvent[] = [];

  constructor() {
    this.resetToDemo();
  }

  public getUsers(): User[] {
    return this.users;
  }

  public getBids(): Bid[] {
    return this.bids;
  }

  public getBidById(id: string): Bid | undefined {
    return this.bids.find(b => b.id === id || b.bidNumber === id);
  }

  public createBid(bidData: Omit<Bid, 'id' | 'createdAt' | 'totalBidders'>): Bid {
    const newBid: Bid = {
      ...bidData,
      id: `bid-${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalBidders: 0,
    };
    this.bids.unshift(newBid);
    this.addAuditEvent({
      bidId: newBid.id,
      actor: 'Officer R. Sharma',
      role: 'OFFICER',
      action: 'Bid Created',
      details: `Created new tender notice: ${newBid.bidNumber} (${newBid.title})`,
    });
    return newBid;
  }

  public getBidders(bidId?: string): Bidder[] {
    if (bidId) {
      return this.bidders.filter(b => b.bidId === bidId);
    }
    return this.bidders;
  }

  public getBidderById(id: string): Bidder | undefined {
    return this.bidders.find(b => b.id === id);
  }

  public createBidder(bidderData: Omit<Bidder, 'id'>): Bidder {
    const newBidder: Bidder = {
      ...bidderData,
      id: `bidder-${Date.now()}`,
    };
    this.bidders.push(newBidder);

    // Update bid count
    const bid = this.getBidById(newBidder.bidId);
    if (bid) {
      bid.totalBidders += 1;
    }

    this.addAuditEvent({
      bidId: newBidder.bidId,
      bidderId: newBidder.id,
      actor: 'Officer R. Sharma',
      role: 'OFFICER',
      action: 'Bidder Added',
      details: `Added bidder: ${newBidder.legalName} (PAN: ${newBidder.pan})`,
    });
    return newBidder;
  }

  public getDocuments(bidderId?: string): BidDocument[] {
    if (bidderId) {
      return this.documents.filter(d => d.bidderId === bidderId);
    }
    return this.documents;
  }

  public getDocumentById(id: string): BidDocument | undefined {
    return this.documents.find(d => d.id === id);
  }

  public addDocument(docData: Omit<BidDocument, 'id' | 'uploadedAt'>): BidDocument {
    const newDoc: BidDocument = {
      ...docData,
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      uploadedAt: new Date().toISOString(),
    };
    this.documents.push(newDoc);

    this.addAuditEvent({
      bidId: newDoc.bidId,
      bidderId: newDoc.bidderId,
      actor: 'Officer R. Sharma',
      role: 'OFFICER',
      action: 'Document Uploaded',
      details: `Uploaded file ${newDoc.fileName} (${newDoc.documentType})`,
    });

    // Re-evaluate compliance for this bidder
    this.recalculateBidderCompliance(newDoc.bidderId);
    return newDoc;
  }

  public getComplianceItems(bidderId?: string): ComplianceItem[] {
    if (bidderId) {
      return this.complianceItems.filter(c => c.bidderId === bidderId);
    }
    return this.complianceItems;
  }

  public getFindings(bidderId?: string): Finding[] {
    if (bidderId) {
      return this.findings.filter(f => f.bidderId === bidderId);
    }
    return this.findings;
  }

  public getAuditEvents(bidId?: string): AuditEvent[] {
    if (bidId) {
      return this.auditEvents.filter(a => a.bidId === bidId);
    }
    return this.auditEvents;
  }

  public addAuditEvent(eventData: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
    const event: AuditEvent = {
      ...eventData,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditEvents.unshift(event);
    return event;
  }

  public recordOfficerDecision(bidderId: string, decision: any): Bidder | undefined {
    const bidder = this.getBidderById(bidderId);
    if (!bidder) return undefined;

    bidder.officerDecision = {
      status: decision.status,
      notes: decision.notes || '',
      decidedAt: new Date().toISOString(),
      officerName: decision.officerName || 'Officer R. Sharma',
      officerRole: decision.officerRole || 'Authorized Procurement Officer',
    };

    this.addAuditEvent({
      bidId: bidder.bidId,
      bidderId: bidder.id,
      actor: bidder.officerDecision.officerName,
      role: 'OFFICER',
      action: `Human Officer Decision: ${decision.status}`,
      details: `Procurement Officer recorded decision "${decision.status}". Notes: ${decision.notes || 'None'}`,
    });

    return bidder;
  }

  public updateComplianceItemOverride(
    itemId: string,
    newStatus: any,
    reason: string,
    officer: string
  ): ComplianceItem | undefined {
    const item = this.complianceItems.find(c => c.id === itemId);
    if (!item) return undefined;

    const oldStatus = item.status;
    item.officerOverride = {
      overridden: true,
      previousStatus: oldStatus,
      newStatus,
      reason,
      timestamp: new Date().toISOString(),
      officer,
    };
    item.status = newStatus;

    this.addAuditEvent({
      bidId: item.bidId,
      bidderId: item.bidderId,
      actor: officer,
      role: 'OFFICER',
      action: 'Officer Compliance Override',
      details: `Officer manual override on ${item.requirement}: Changed from ${oldStatus} to ${newStatus}. Rationale: ${reason}`,
      ruleId: item.ruleId,
      statusAfter: newStatus,
    });

    return item;
  }

  public recalculateBidderCompliance(bidderId: string) {
    const bidder = this.getBidderById(bidderId);
    if (!bidder) return;
    const bid = this.getBidById(bidder.bidId);
    const docs = this.getDocuments(bidderId);
    const required = bid ? bid.requiredDocuments : ['PAN', 'GST_CERTIFICATE', 'UDYAM', 'OEM_AUTHORIZATION', 'MAKE_IN_INDIA'];

    const evaluation = ComplianceRuleEngine.evaluateBidder(bidder, docs, required);

    // Filter out old items and findings for this bidder
    this.complianceItems = this.complianceItems.filter(c => c.bidderId !== bidderId).concat(evaluation.items);
    this.findings = this.findings.filter(f => f.bidderId !== bidderId).concat(evaluation.findings);

    // Calculate risk
    const risk = RiskAnalysisService.calculateRisk(bidder, docs, evaluation.items, evaluation.findings);
    bidder.riskScore = risk.score;
    bidder.riskLevel = risk.level;
    bidder.riskFactors = risk.factors;
    bidder.overallStatus = evaluation.overallStatus;

    // Cross-document entity match
    const gstDoc = docs.find(d => d.documentType === 'GST_CERTIFICATE');
    if (gstDoc) {
      const match = EntityResolutionService.compareNames(bidder.legalName, gstDoc.extractedFields['legalName'] || '');
      bidder.entityMatchScore = match.score;
      bidder.entityMatchReason = match.reason;
    }
  }

  public resetToDemo(): void {
    // 1. Demo Users
    this.users = [
      {
        id: 'u-1',
        name: 'R. Sharma (IA&AS)',
        email: 'officer@bidshield.demo',
        role: 'OFFICER',
        roleTitle: 'Chief Procurement Officer',
        department: 'Government e-Marketplace (GeM) / Min. of Commerce',
      },
      {
        id: 'u-2',
        name: 'V. Sundaram (CAG)',
        email: 'auditor@bidshield.demo',
        role: 'AUDITOR',
        roleTitle: 'Senior Vigilance & Audit Officer',
        department: 'Comptroller & Auditor General of India',
      },
      {
        id: 'u-3',
        name: 'P. Verma',
        email: 'admin@bidshield.demo',
        role: 'ADMIN',
        roleTitle: 'GeM Technical Administrator',
        department: 'Digital India Corporation / MeitY',
      },
    ];

    // 2. Demo Bids (3 bids)
    this.bids = [
      {
        id: 'bid-001',
        bidNumber: 'GEM/2026/B/001245',
        title: 'Enterprise Network Infrastructure',
        department: 'Ministry of Communications / Department of Telecommunications',
        category: 'Networking Equipment',
        submissionDeadline: '2026-10-15T18:00:00Z',
        evaluationStartDate: '2026-09-29T10:00:00Z',
        requiredDocuments: [
          'PAN',
          'GST_CERTIFICATE',
          'UDYAM',
          'OEM_AUTHORIZATION',
          'MAKE_IN_INDIA',
          'EPFO',
          'ESIC',
        ],
        complianceTemplate: 'GeM Standard Hardware Technical Bid (Tier-1)',
        status: 'UNDER_REVIEW',
        createdAt: '2026-09-20T09:30:00Z',
        totalBidders: 3,
      },
      {
        id: 'bid-002',
        bidNumber: 'GEM/2026/B/001399',
        title: 'High-Performance Cloud Compute & SAN Storage Clusters',
        department: 'Ministry of Electronics & Information Technology (MeitY)',
        category: 'Server & Data Center Systems',
        submissionDeadline: '2026-10-22T17:00:00Z',
        evaluationStartDate: '2026-09-28T11:00:00Z',
        requiredDocuments: [
          'PAN',
          'GST_CERTIFICATE',
          'UDYAM',
          'OEM_AUTHORIZATION',
          'MAKE_IN_INDIA',
          'STARTUP_INDIA',
        ],
        complianceTemplate: 'MeitY Cloud Hardware Compliance Template v3.2',
        status: 'ACTIVE',
        createdAt: '2026-09-22T14:15:00Z',
        totalBidders: 1,
      },
      {
        id: 'bid-003',
        bidNumber: 'GEM/2026/B/001512',
        title: 'Secured Optical Routing Core Switches',
        department: 'Defence Research and Development Organisation (DRDO)',
        category: 'Defense Communication Hardware',
        submissionDeadline: '2026-10-05T15:00:00Z',
        evaluationStartDate: '2026-09-27T09:00:00Z',
        requiredDocuments: [
          'PAN',
          'GST_CERTIFICATE',
          'OEM_AUTHORIZATION',
          'MAKE_IN_INDIA',
          'EPFO',
          'ESIC',
        ],
        complianceTemplate: 'Defence Critical Procurement Guideline Class A',
        status: 'UNDER_REVIEW',
        createdAt: '2026-09-18T11:00:00Z',
        totalBidders: 1,
      },
    ];

    // 3. Demo Bidders (5 bidders)
    this.bidders = [
      // Primary Demo Bidder: ABC Technologies Pvt Ltd
      {
        id: 'bidder-001',
        bidId: 'bid-001',
        legalName: 'ABC Technologies Pvt Ltd',
        tradeName: 'ABC Tech Solutions',
        pan: 'ABCDE1234F',
        gstin: '29ABCDE1234F1Z5',
        udyamNumber: 'UDYAM-KR-03-0049281',
        epfoNumber: 'DL/CPM/1048291',
        esicNumber: '11000984720001001',
        address: 'Plot 42, Electronic City Phase 1, Hosur Road, Bengaluru, Karnataka - 560100',
        contactPerson: 'Arun K. Menon',
        contactEmail: 'a.menon@abctech.example.in',
        contactPhone: '+91 98450 19283',
        entityMatchScore: 96,
        entityMatchReason: 'Names differ only by legal abbreviation across PAN, GST, and Udyam.',
        riskLevel: 'MEDIUM',
        riskScore: 40,
        riskFactors: [
          {
            factor: 'Entity Name / Affiliation Discrepancy',
            points: 30,
            description: 'Make in India declaration affidavit cites "ABC Technologies Inc" rather than "ABC Technologies Pvt Ltd".',
          },
          {
            factor: 'Pending External Gateway Verification',
            points: 10,
            description: 'OEM Authorization from XYZ Corporation requires manual direct confirmation.',
          },
        ],
        overallStatus: 'REVIEW_REQUIRED',
      },
      {
        id: 'bidder-002',
        bidId: 'bid-001',
        legalName: 'Bharat Infotech Solutions LLP',
        tradeName: 'Bharat Infotech',
        pan: 'AABCB9876K',
        gstin: '27AABCB9876K1Z9',
        udyamNumber: 'UDYAM-MH-02-0018472',
        epfoNumber: 'MH/BAN/0091823',
        esicNumber: '31000781290001002',
        address: 'Tower 4, Infotech Park, Hinjewadi Phase 2, Pune, Maharashtra - 411057',
        contactPerson: 'Sanjay Deshmukh',
        contactEmail: 'sanjay.d@bharatinfotech.example.in',
        contactPhone: '+91 98220 33411',
        entityMatchScore: 100,
        entityMatchReason: 'Exact match across all statutory registers.',
        riskLevel: 'LOW',
        riskScore: 10,
        riskFactors: [
          {
            factor: 'Pending External Gateway Verification',
            points: 10,
            description: 'OEM verification pending batch connector reconciliation.',
          }
        ],
        overallStatus: 'VERIFIED',
      },
      {
        id: 'bidder-003',
        bidId: 'bid-001',
        legalName: 'Shrestha Telecom Devices Pvt Ltd',
        tradeName: 'Shrestha Telecom',
        pan: 'AAECS4321P',
        gstin: '07AAECS4321P1Z3',
        udyamNumber: 'UDYAM-DL-01-0082914',
        epfoNumber: 'DL/DEL/0048192',
        esicNumber: '11000671820001004',
        address: 'A-28, Okhla Industrial Area Phase 1, New Delhi - 110020',
        contactPerson: 'Neha Khurana',
        contactEmail: 'n.khurana@shresthatelecom.example.in',
        contactPhone: '+91 98110 55420',
        entityMatchScore: 92,
        entityMatchReason: 'Corporate suffix and trade abbreviation variation.',
        riskLevel: 'MEDIUM',
        riskScore: 30,
        riskFactors: [
          {
            factor: 'Pending External Gateway Verification',
            points: 10,
            description: 'OEM authorization document under evaluation.',
          },
          {
            factor: 'Low Document Extraction Confidence',
            points: 10,
            description: 'EPFO challan scan had optical noise.',
          },
        ],
        overallStatus: 'REVIEW_REQUIRED',
      },
      {
        id: 'bidder-004',
        bidId: 'bid-002',
        legalName: 'Apex Digital Infrastructure Ltd',
        tradeName: 'Apex Cloud Systems',
        pan: 'AALCA8912M',
        gstin: '33AALCA8912M1Z4',
        udyamNumber: 'UDYAM-TN-01-0039182',
        epfoNumber: 'TN/MAS/0038192',
        esicNumber: '51000491820001001',
        address: 'Tidel Park, Rajiv Gandhi Salai, Taramani, Chennai, Tamil Nadu - 600113',
        contactPerson: 'K. Ramanathan',
        contactEmail: 'k.ram@apexinfra.example.in',
        contactPhone: '+91 94440 28192',
        entityMatchScore: 98,
        entityMatchReason: 'Matching corporate records in DPIIT and GST portals.',
        riskLevel: 'LOW',
        riskScore: 10,
        riskFactors: [],
        overallStatus: 'VERIFIED',
      },
      {
        id: 'bidder-005',
        bidId: 'bid-003',
        legalName: 'Garuda Secure Comm Systems',
        tradeName: 'Garuda Comm',
        pan: 'AABCG5544H',
        gstin: '36AABCG5544H1Z2',
        udyamNumber: 'UDYAM-TS-04-0012984',
        epfoNumber: 'TS/HYD/0019284',
        esicNumber: '52000381920001003',
        address: 'Hitec City, Madhapur, Hyderabad, Telangana - 500081',
        contactPerson: 'Vikram Reddy',
        contactEmail: 'v.reddy@garudacomm.example.in',
        contactPhone: '+91 99890 12847',
        entityMatchScore: 84,
        entityMatchReason: 'Trade name disparity between GST and defense vendor portal.',
        riskLevel: 'HIGH',
        riskScore: 60,
        riskFactors: [
          {
            factor: 'Missing Required Documents',
            points: 20,
            description: 'Make in India declaration missing from initial bid submission.',
          },
          {
            factor: 'Expired Certificates',
            points: 20,
            description: 'Tax clearance certificate expired on 31 August 2026.',
          },
          {
            factor: 'Address Variance Across Registrations',
            points: 10,
            description: 'GST operating site is in Telangana; factory address is in AP.',
          },
        ],
        overallStatus: 'DISCREPANCY',
      },
    ];

    // 4. Documents for Primary Demo Bidder (ABC Technologies Pvt Ltd) + others (15+ total)
    this.documents = [
      {
        id: 'doc-001',
        bidId: 'bid-001',
        bidderId: 'bidder-001',
        fileName: 'PAN_ABC_Technologies.pdf',
        fileType: 'application/pdf',
        fileSize: '412 KB',
        documentType: 'PAN',
        uploadStatus: 'SUCCESS',
        processingStatus: 'AI_ANALYZED',
        verificationStatus: 'VERIFIED',
        confidence: 0.99,
        uploadedAt: '2026-09-29T14:32:00Z',
        analyzedAt: '2026-09-29T14:33:00Z',
        extractedFields: {
          panNumber: 'ABCDE1234F',
          name: 'ABC TECHNOLOGIES PVT LTD',
          dateOfIncorporation: '14/05/2015',
          category: 'Company',
          issuingAuthority: 'Income Tax Department, Government of India',
        },
        aiSummary: 'Permanent Account Number verified against mock ITD database. Check digit and checksum valid.',
        pageCount: 1,
        mockEvidencePreview: {
          title: 'PERMANENT ACCOUNT NUMBER CARD',
          issuer: 'INCOME TAX DEPARTMENT, GOVT OF INDIA',
          issueDate: '14/05/2015',
          certNumber: 'ABCDE1234F',
          entityName: 'ABC TECHNOLOGIES PVT LTD',
          rawSnippet: 'Name: ABC TECHNOLOGIES PVT LTD\nPAN: ABCDE1234F\nDate of Inc: 14/05/2015\nCategory: Company',
        },
      },
      {
        id: 'doc-002',
        bidId: 'bid-001',
        bidderId: 'bidder-001',
        fileName: 'GST_Certificate_ABC_Tech.pdf',
        fileType: 'application/pdf',
        fileSize: '684 KB',
        documentType: 'GST_CERTIFICATE',
        uploadStatus: 'SUCCESS',
        processingStatus: 'AI_ANALYZED',
        verificationStatus: 'VERIFIED',
        confidence: 0.97,
        uploadedAt: '2026-09-29T14:32:15Z',
        analyzedAt: '2026-09-29T14:33:10Z',
        extractedFields: {
          gstin: '29ABCDE1234F1Z5',
          legalName: 'ABC Technologies Private Limited',
          tradeName: 'ABC Tech Solutions',
          status: 'Active',
          registrationDate: '01/07/2017',
          constitutionOfBusiness: 'Private Limited Company',
          address: 'Plot 42, Electronic City Phase 1, Hosur Road, Bengaluru, Karnataka - 560100',
        },
        aiSummary: 'Form GST REG-06 verified. Taxpayer is Active with no suspension or cancellation records.',
        pageCount: 3,
        mockEvidencePreview: {
          title: 'GOVERNMENT OF INDIA - REGISTRATION CERTIFICATE (FORM GST REG-06)',
          issuer: 'Central Board of Indirect Taxes and Customs',
          issueDate: '01/07/2017',
          certNumber: '29ABCDE1234F1Z5',
          entityName: 'ABC Technologies Private Limited',
          rawSnippet: 'Registration Number: 29ABCDE1234F1Z5\nLegal Name: ABC Technologies Private Limited\nTrade Name: ABC Tech Solutions\nConstitution: Private Limited Company\nAddress: Plot 42, Electronic City Phase 1, Hosur Road, Bengaluru, 560100\nStatus: ACTIVE',
        },
      },
      {
        id: 'doc-003',
        bidId: 'bid-001',
        bidderId: 'bidder-001',
        fileName: 'Udyam_Registration_ABC.pdf',
        fileType: 'application/pdf',
        fileSize: '512 KB',
        documentType: 'UDYAM',
        uploadStatus: 'SUCCESS',
        processingStatus: 'AI_ANALYZED',
        verificationStatus: 'VERIFIED',
        confidence: 0.94,
        uploadedAt: '2026-09-29T14:32:30Z',
        analyzedAt: '2026-09-29T14:33:20Z',
        extractedFields: {
          udyamNumber: 'UDYAM-KR-03-0049281',
          enterpriseName: 'ABC Technologies',
          organizationType: 'Small Enterprise',
          majorActivity: 'Manufacturing & IT Hardware Integration',
          registrationDate: '12/09/2021',
          nicCode: '26201 - Manufacture of computers and peripheral equipment',
          address: 'Industrial Area, Bommasandra, Bengaluru, Karnataka',
        },
        aiSummary: 'Udyam Registration Certificate verified under Ministry of MSME. Eligible for MSME purchase preference.',
        pageCount: 2,
        mockEvidencePreview: {
          title: 'UDYAM REGISTRATION CERTIFICATE',
          issuer: 'Ministry of Micro, Small and Medium Enterprises',
          issueDate: '12/09/2021',
          certNumber: 'UDYAM-KR-03-0049281',
          entityName: 'ABC Technologies',
          rawSnippet: 'UDYAM REGISTRATION NUMBER: UDYAM-KR-03-0049281\nNAME OF ENTERPRISE: ABC Technologies\nTYPE OF ENTERPRISE: SMALL (MANUFACTURING)\nMAJOR ACTIVITY: 26201 - Manufacture of computers and networking peripheral equipment',
        },
      },
      {
        id: 'doc-004',
        bidId: 'bid-001',
        bidderId: 'bidder-001',
        fileName: 'OEM_Authorization_XYZ_Corp.pdf',
        fileType: 'application/pdf',
        fileSize: '890 KB',
        documentType: 'OEM_AUTHORIZATION',
        uploadStatus: 'SUCCESS',
        processingStatus: 'AI_ANALYZED',
        verificationStatus: 'REVIEW_REQUIRED',
        confidence: 0.82,
        uploadedAt: '2026-09-29T14:33:00Z',
        analyzedAt: '2026-09-29T14:34:00Z',
        extractedFields: {
          oemName: 'XYZ Corporation Global Systems',
          authorizedBidder: 'ABC Technologies Pvt Ltd',
          authorizationNumber: 'OEM/2026/123-IN',
          validFrom: '01/01/2026',
          validUntil: '31/12/2026',
          productCategory: 'Enterprise Networking Switches & Routing Hardware',
          signatory: 'David Reynolds, VP - Asia Pacific Channels',
        },
        aiSummary: 'Manufacturer Authorization Form (MAF) successfully parsed. Direct manufacturer API verification could not be independently completed.',
        pageCount: 2,
        mockEvidencePreview: {
          title: 'MANUFACTURER AUTHORIZATION FORM (MAF)',
          issuer: 'XYZ Corporation Global Systems Ltd',
          issueDate: '01/01/2026',
          expiryDate: '31/12/2026',
          certNumber: 'OEM/2026/123-IN',
          entityName: 'ABC Technologies Pvt Ltd',
          rawSnippet: 'TO: Procurement Division, GeM\nSUBJECT: OEM Authorization for Bid GEM/2026/B/001245\nWe, XYZ Corporation Global Systems, confirm that M/s ABC Technologies Pvt Ltd is our authorized tier-1 system integrator and partner for supply, warranty, and support of Enterprise Networking Switches.\nRef No: OEM/2026/123-IN\nValid Until: 31 December 2026',
        },
      },
      {
        id: 'doc-005',
        bidId: 'bid-001',
        bidderId: 'bidder-001',
        fileName: 'EPFO_Challan_Aug2026.pdf',
        fileType: 'application/pdf',
        fileSize: '320 KB',
        documentType: 'EPFO',
        uploadStatus: 'SUCCESS',
        processingStatus: 'AI_ANALYZED',
        verificationStatus: 'VERIFIED',
        confidence: 0.98,
        uploadedAt: '2026-09-29T14:33:15Z',
        analyzedAt: '2026-09-29T14:34:10Z',
        extractedFields: {
          establishmentCode: 'DL/CPM/1048291',
          wageMonth: 'August 2026',
          trrn: '3182608019482',
          amount: '₹ 4,82,900',
          employeeCount: '142',
          paymentDate: '15/09/2026',
        },
        aiSummary: 'EPFO Electronic Challan cum Return (ECR) receipt confirmed. Timely remittance verified.',
        pageCount: 1,
        mockEvidencePreview: {
          title: 'EMPLOYEES PROVIDENT FUND ORGANISATION - COMBINED CHALLAN OF A/C 1, 2, 10, 21 & 22',
          issuer: 'Employees Provident Fund Organisation, India',
          issueDate: '15/09/2026',
          certNumber: 'TRRN 3182608019482',
          entityName: 'ABC TECHNOLOGIES PVT LTD',
          rawSnippet: 'Establishment Code: DL/CPM/1048291\nWage Month: 08/2026\nTotal Subscribers: 142\nTotal Remittance: INR 4,82,900\nPayment Status: Payment Confirmed by State Bank of India',
        },
      },
      {
        id: 'doc-006',
        bidId: 'bid-001',
        bidderId: 'bidder-001',
        fileName: 'ESIC_Monthly_Challan.pdf',
        fileType: 'application/pdf',
        fileSize: '290 KB',
        documentType: 'ESIC',
        uploadStatus: 'SUCCESS',
        processingStatus: 'AI_ANALYZED',
        verificationStatus: 'VERIFIED',
        confidence: 0.97,
        uploadedAt: '2026-09-29T14:33:30Z',
        analyzedAt: '2026-09-29T14:34:20Z',
        extractedFields: {
          employerCode: '11000984720001001',
          period: 'Apr 2026 - Sep 2026',
          challanNumber: '01126129847192',
          employeesCovered: '98',
          amount: '₹ 1,18,400',
        },
        aiSummary: 'ESIC contribution challan verified. Statutory social security deposits paid.',
        pageCount: 1,
        mockEvidencePreview: {
          title: 'EMPLOYEES STATE INSURANCE CORPORATION - E-CHALLAN PAYMENT RECEIPT',
          issuer: 'Employees State Insurance Corporation, Ministry of Labour',
          issueDate: '18/09/2026',
          certNumber: '01126129847192',
          entityName: 'ABC Technologies Pvt Ltd',
          rawSnippet: 'Employer Code No: 11000984720001001\nEmployer Name: ABC Technologies Pvt Ltd\nChallan Number: 01126129847192\nAmount: INR 1,18,400\nTransaction Status: Realized',
        },
      },
      {
        id: 'doc-007',
        bidId: 'bid-001',
        bidderId: 'bidder-001',
        fileName: 'MII_Local_Content_Affidavit.pdf',
        fileType: 'application/pdf',
        fileSize: '450 KB',
        documentType: 'MAKE_IN_INDIA',
        uploadStatus: 'SUCCESS',
        processingStatus: 'AI_ANALYZED',
        verificationStatus: 'DISCREPANCY',
        confidence: 0.76,
        uploadedAt: '2026-09-29T14:33:45Z',
        analyzedAt: '2026-09-29T14:34:40Z',
        extractedFields: {
          declaringEntity: 'ABC Technologies Inc',
          localContentPercentage: '58%',
          supplierClass: 'Class-I Local Supplier (>=50%)',
          tenderReference: 'GEM/2026/B/001245',
          location: 'Manufacturing facility at Plot 42, Electronic City, Bengaluru',
        },
        aiSummary: 'Entity name discrepancy detected: Declaring entity in affidavit is "ABC Technologies Inc" instead of bidding company "ABC Technologies Pvt Ltd".',
        pageCount: 1,
        mockEvidencePreview: {
          title: 'MAKE IN INDIA (MII) LOCAL CONTENT SELF-DECLARATION AFFIDAVIT',
          issuer: 'Notarized Self-Declaration Affidavit',
          issueDate: '24/09/2026',
          certNumber: 'AFF/MII/2026/902',
          entityName: 'ABC Technologies Inc',
          rawSnippet: 'AFFIDAVIT UNDER PUBLIC PROCUREMENT (PREFERENCE TO MAKE IN INDIA) ORDER\nI, the undersigned Director of M/s ABC Technologies Inc, do hereby solemnly declare that the local content in the offered networking goods for GeM Bid GEM/2026/B/001245 is 58% (Fifty-Eight Percent).\nLocation of Value Addition: Plot 42, Electronic City, Bengaluru, India\nSigned: Authorized Representative',
        },
      },

      // Documents for other bidders
      {
        id: 'doc-008',
        bidId: 'bid-001',
        bidderId: 'bidder-002',
        fileName: 'Bharat_Infotech_PAN.pdf',
        fileType: 'application/pdf',
        fileSize: '390 KB',
        documentType: 'PAN',
        uploadStatus: 'SUCCESS',
        processingStatus: 'AI_ANALYZED',
        verificationStatus: 'VERIFIED',
        confidence: 0.99,
        uploadedAt: '2026-09-25T10:00:00Z',
        extractedFields: { panNumber: 'AABCB9876K', name: 'BHARAT INFOTECH SOLUTIONS LLP' },
      },
      {
        id: 'doc-009',
        bidId: 'bid-001',
        bidderId: 'bidder-002',
        fileName: 'Bharat_Infotech_GST.pdf',
        fileType: 'application/pdf',
        fileSize: '710 KB',
        documentType: 'GST_CERTIFICATE',
        uploadStatus: 'SUCCESS',
        processingStatus: 'AI_ANALYZED',
        verificationStatus: 'VERIFIED',
        confidence: 0.98,
        uploadedAt: '2026-09-25T10:05:00Z',
        extractedFields: { gstin: '27AABCB9876K1Z9', legalName: 'Bharat Infotech Solutions LLP', status: 'Active' },
      },
      {
        id: 'doc-010',
        bidId: 'bid-001',
        bidderId: 'bidder-002',
        fileName: 'Bharat_Infotech_OEM.pdf',
        fileType: 'application/pdf',
        fileSize: '650 KB',
        documentType: 'OEM_AUTHORIZATION',
        uploadStatus: 'SUCCESS',
        processingStatus: 'AI_ANALYZED',
        verificationStatus: 'VERIFIED',
        confidence: 0.95,
        uploadedAt: '2026-09-25T10:10:00Z',
        extractedFields: { oemName: 'Cisco Systems India', authorizedBidder: 'Bharat Infotech Solutions LLP', authorizationNumber: 'CS-2026-992' },
      },
      {
        id: 'doc-011',
        bidId: 'bid-001',
        bidderId: 'bidder-002',
        fileName: 'Bharat_Infotech_MII.pdf',
        fileType: 'application/pdf',
        fileSize: '410 KB',
        documentType: 'MAKE_IN_INDIA',
        uploadStatus: 'SUCCESS',
        processingStatus: 'AI_ANALYZED',
        verificationStatus: 'VERIFIED',
        confidence: 0.96,
        uploadedAt: '2026-09-25T10:15:00Z',
        extractedFields: { declaringEntity: 'Bharat Infotech Solutions LLP', localContentPercentage: '62%' },
      },
      {
        id: 'doc-012',
        bidId: 'bid-001',
        bidderId: 'bidder-003',
        fileName: 'Shrestha_PAN.pdf',
        fileType: 'application/pdf',
        fileSize: '350 KB',
        documentType: 'PAN',
        uploadStatus: 'SUCCESS',
        processingStatus: 'AI_ANALYZED',
        verificationStatus: 'VERIFIED',
        confidence: 0.99,
        uploadedAt: '2026-09-26T12:00:00Z',
        extractedFields: { panNumber: 'AAECS4321P', name: 'SHRESTHA TELECOM DEVICES PVT LTD' },
      },
      {
        id: 'doc-013',
        bidId: 'bid-001',
        bidderId: 'bidder-003',
        fileName: 'Shrestha_GST.pdf',
        fileType: 'application/pdf',
        fileSize: '620 KB',
        documentType: 'GST_CERTIFICATE',
        uploadStatus: 'SUCCESS',
        processingStatus: 'AI_ANALYZED',
        verificationStatus: 'VERIFIED',
        confidence: 0.97,
        uploadedAt: '2026-09-26T12:05:00Z',
        extractedFields: { gstin: '07AAECS4321P1Z3', legalName: 'Shrestha Telecom Devices Private Limited', status: 'Active' },
      },
      {
        id: 'doc-014',
        bidId: 'bid-002',
        bidderId: 'bidder-004',
        fileName: 'Apex_PAN.pdf',
        fileType: 'application/pdf',
        fileSize: '380 KB',
        documentType: 'PAN',
        uploadStatus: 'SUCCESS',
        processingStatus: 'AI_ANALYZED',
        verificationStatus: 'VERIFIED',
        confidence: 0.99,
        uploadedAt: '2026-09-26T15:00:00Z',
        extractedFields: { panNumber: 'AALCA8912M', name: 'APEX DIGITAL INFRASTRUCTURE LTD' },
      },
      {
        id: 'doc-015',
        bidId: 'bid-002',
        bidderId: 'bidder-004',
        fileName: 'Apex_GST.pdf',
        fileType: 'application/pdf',
        fileSize: '690 KB',
        documentType: 'GST_CERTIFICATE',
        uploadStatus: 'SUCCESS',
        processingStatus: 'AI_ANALYZED',
        verificationStatus: 'VERIFIED',
        confidence: 0.98,
        uploadedAt: '2026-09-26T15:10:00Z',
        extractedFields: { gstin: '33AALCA8912M1Z4', legalName: 'Apex Digital Infrastructure Limited', status: 'Active' },
      },
      {
        id: 'doc-016',
        bidId: 'bid-003',
        bidderId: 'bidder-005',
        fileName: 'Garuda_PAN.pdf',
        fileType: 'application/pdf',
        fileSize: '340 KB',
        documentType: 'PAN',
        uploadStatus: 'SUCCESS',
        processingStatus: 'AI_ANALYZED',
        verificationStatus: 'VERIFIED',
        confidence: 0.99,
        uploadedAt: '2026-09-27T09:30:00Z',
        extractedFields: { panNumber: 'AABCG5544H', name: 'GARUDA SECURE COMM SYSTEMS' },
      },
    ];

    // 5. Pre-seed Compliance Items and Findings by evaluating bidder-001
    this.recalculateBidderCompliance('bidder-001');

    // 6. Pre-seed Audit Trail events (Section 22)
    this.auditEvents = [
      {
        id: 'audit-001',
        timestamp: '2026-09-29T14:32:00Z',
        bidId: 'bid-001',
        bidderId: 'bidder-001',
        actor: 'Officer R. Sharma',
        role: 'OFFICER',
        action: 'Document Uploaded',
        details: 'Officer uploaded PAN_ABC_Technologies.pdf',
      },
      {
        id: 'audit-002',
        timestamp: '2026-09-29T14:32:15Z',
        bidId: 'bid-001',
        bidderId: 'bidder-001',
        actor: 'Officer R. Sharma',
        role: 'OFFICER',
        action: 'Document Uploaded',
        details: 'Officer uploaded GST_Certificate_ABC_Tech.pdf',
      },
      {
        id: 'audit-003',
        timestamp: '2026-09-29T14:33:00Z',
        bidId: 'bid-001',
        bidderId: 'bidder-001',
        actor: 'BidShield AI',
        role: 'AI_ASSISTANT',
        action: 'Document Classified',
        details: 'AI classified document as GST Certificate (Confidence: 97%)',
      },
      {
        id: 'audit-004',
        timestamp: '2026-09-29T14:33:10Z',
        bidId: 'bid-001',
        bidderId: 'bidder-001',
        actor: 'BidShield AI',
        role: 'AI_ASSISTANT',
        action: 'Fields Extracted',
        details: 'Fields extracted: GSTIN=29ABCDE1234F1Z5, Legal Name=ABC Technologies Private Limited, Status=Active',
      },
      {
        id: 'audit-005',
        timestamp: '2026-09-29T14:34:00Z',
        bidId: 'bid-001',
        bidderId: 'bidder-001',
        actor: 'Rule Engine',
        role: 'RULE_ENGINE',
        action: 'Rule Executed',
        details: 'RULE-GST-001 executed: GSTIN present and active. Status set to VERIFIED.',
        ruleId: 'RULE-GST-001',
        statusAfter: 'VERIFIED',
      },
      {
        id: 'audit-006',
        timestamp: '2026-09-29T14:34:20Z',
        bidId: 'bid-001',
        bidderId: 'bidder-001',
        actor: 'Entity Resolution',
        role: 'SERVICE',
        action: 'Entity Matching Evaluated',
        details: 'Entity resolution cross-check: Bidder ("ABC Technologies Pvt Ltd") vs GST Legal Name ("ABC Technologies Private Limited") -> 96% Match (Legal Abbreviation).',
      },
      {
        id: 'audit-007',
        timestamp: '2026-09-29T14:34:40Z',
        bidId: 'bid-001',
        bidderId: 'bidder-001',
        actor: 'Rule Engine',
        role: 'RULE_ENGINE',
        action: 'Rule Executed',
        details: 'RULE-OEM-001 executed: OEM authorization from XYZ Corporation uploaded. Independent gateway check pending -> REVIEW_REQUIRED.',
        ruleId: 'RULE-OEM-001',
        statusAfter: 'REVIEW_REQUIRED',
      },
      {
        id: 'audit-008',
        timestamp: '2026-09-29T14:34:55Z',
        bidId: 'bid-001',
        bidderId: 'bidder-001',
        actor: 'Rule Engine',
        role: 'RULE_ENGINE',
        action: 'Rule Executed',
        details: 'RULE-MII-001 executed: Make in India declaration contains entity mismatch ("ABC Technologies Inc" vs "ABC Technologies Pvt Ltd") -> DISCREPANCY.',
        ruleId: 'RULE-MII-001',
        statusAfter: 'DISCREPANCY',
      },
      {
        id: 'audit-009',
        timestamp: '2026-09-29T14:35:10Z',
        bidId: 'bid-001',
        bidderId: 'bidder-001',
        actor: 'Officer R. Sharma',
        role: 'OFFICER',
        action: 'Report Inspected',
        details: 'Officer opened compliance matrix & executive summary report for ABC Technologies Pvt Ltd',
      },
    ];
  }
}

export const dbStore = new MemoryStore();
