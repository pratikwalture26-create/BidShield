import { Router, Request, Response } from 'express';
import { dbStore } from '../repositories/Store.js';
import { AIService } from '../services/AIService.js';
import {
  MockGSTConnector,
  MockUdyamConnector,
  MockEPFOConnector,
  MockESICConnector,
  MockOEMConnector,
  MockBlacklistConnector,
} from '../connectors/GovernmentVerificationConnectors.js';

export const apiRouter = Router();

// 1. Auth Login / Switch
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  const users = dbStore.getUsers();
  const matched = users.find(u => u.email === email) || users[0];
  res.json({
    user: matched,
    token: `demo-jwt-token-${matched.role.toLowerCase()}-${Date.now()}`,
  });
});

apiRouter.get('/auth/users', (_req: Request, res: Response) => {
  res.json({ users: dbStore.getUsers() });
});

// 2. Dashboard KPIs
apiRouter.get('/dashboard', (_req: Request, res: Response) => {
  const bids = dbStore.getBids();
  const bidders = dbStore.getBidders();
  const docs = dbStore.getDocuments();
  const findings = dbStore.getFindings();
  const complianceItems = dbStore.getComplianceItems();

  const totalBids = bids.length;
  const underReview = bids.filter(b => b.status === 'UNDER_REVIEW').length;
  const verifiedBidders = bidders.filter(b => b.overallStatus === 'VERIFIED').length;
  const reviewRequiredBidders = bidders.filter(b => b.overallStatus === 'REVIEW_REQUIRED').length;
  const criticalFindings = findings.filter(f => f.severity === 'CRITICAL').length;
  const documentsProcessed = docs.filter(d => d.processingStatus === 'AI_ANALYZED').length;

  const complianceStatusCounts = {
    VERIFIED: complianceItems.filter(c => c.status === 'VERIFIED').length,
    REVIEW_REQUIRED: complianceItems.filter(c => c.status === 'REVIEW_REQUIRED').length,
    DISCREPANCY: complianceItems.filter(c => c.status === 'DISCREPANCY').length,
    DOCUMENT_MISSING: complianceItems.filter(c => c.status === 'DOCUMENT_MISSING').length,
    EXPIRED: complianceItems.filter(c => c.status === 'EXPIRED').length,
  };

  const findingsByCategory = {
    ENTITY_MISMATCH: findings.filter(f => f.category === 'ENTITY_MISMATCH').length,
    OEM_AUTHORIZATION: findings.filter(f => f.category === 'OEM_AUTHORIZATION').length,
    MII_LOCAL_CONTENT: findings.filter(f => f.category === 'MII_LOCAL_CONTENT').length,
    MISSING_DOCUMENT: findings.filter(f => f.category === 'MISSING_DOCUMENT').length,
    EXPIRED_CERTIFICATE: findings.filter(f => f.category === 'EXPIRED_CERTIFICATE').length,
  };

  res.json({
    kpis: {
      totalBids,
      underReview,
      verifiedBidders,
      reviewRequiredBidders,
      criticalFindings,
      documentsProcessed,
    },
    complianceStatusCounts,
    findingsByCategory,
    recentAudits: dbStore.getAuditEvents().slice(0, 5),
    activeBidsSummary: bids.slice(0, 3),
  });
});

// 3. Bids
apiRouter.get('/bids', (_req: Request, res: Response) => {
  res.json({ bids: dbStore.getBids() });
});

apiRouter.post('/bids', (req: Request, res: Response) => {
  const { bidNumber, title, department, category, submissionDeadline, evaluationStartDate, requiredDocuments, complianceTemplate } = req.body;
  if (!bidNumber || !title) {
    res.status(400).json({ error: 'Bid ID and Title are required.' });
    return;
  }
  const newBid = dbStore.createBid({
    bidNumber,
    title,
    department: department || 'General Procurement Department',
    category: category || 'Goods & Equipment',
    submissionDeadline: submissionDeadline || new Date(Date.now() + 14 * 86400000).toISOString(),
    evaluationStartDate: evaluationStartDate || new Date().toISOString(),
    requiredDocuments: requiredDocuments || ['PAN', 'GST_CERTIFICATE', 'UDYAM', 'OEM_AUTHORIZATION', 'MAKE_IN_INDIA'],
    complianceTemplate: complianceTemplate || 'GeM Standard Technical Compliance Template',
    status: 'ACTIVE',
  });
  res.status(201).json({ bid: newBid });
});

apiRouter.get('/bids/:id', (req: Request, res: Response) => {
  const bid = dbStore.getBidById(req.params.id);
  if (!bid) {
    res.status(404).json({ error: 'Bid not found' });
    return;
  }
  const bidders = dbStore.getBidders(bid.id);
  res.json({ bid, bidders });
});

// 4. Bidders
apiRouter.get('/bids/:id/bidders', (req: Request, res: Response) => {
  const bid = dbStore.getBidById(req.params.id);
  const bidId = bid ? bid.id : req.params.id;
  const bidders = dbStore.getBidders(bidId);
  res.json({ bidders });
});

apiRouter.post('/bids/:id/bidders', (req: Request, res: Response) => {
  const bid = dbStore.getBidById(req.params.id);
  const bidId = bid ? bid.id : req.params.id;
  const { legalName, tradeName, pan, gstin, udyamNumber, address, contactPerson, contactEmail, contactPhone } = req.body;
  
  if (!legalName || !pan) {
    res.status(400).json({ error: 'Legal name and PAN are required' });
    return;
  }

  const newBidder = dbStore.createBidder({
    bidId,
    legalName,
    tradeName: tradeName || legalName,
    pan: pan.toUpperCase(),
    gstin: gstin || '',
    udyamNumber: udyamNumber || '',
    epfoNumber: '',
    esicNumber: '',
    address: address || '',
    contactPerson: contactPerson || 'Authorized Representative',
    contactEmail: contactEmail || 'info@bidder.demo',
    contactPhone: contactPhone || '+91 90000 00000',
    entityMatchScore: 100,
    entityMatchReason: 'New bidder profile registered.',
    riskLevel: 'LOW',
    riskScore: 0,
    riskFactors: [],
    overallStatus: 'PENDING',
  });

  res.status(201).json({ bidder: newBidder });
});

apiRouter.get('/bidders/:id', (req: Request, res: Response) => {
  const bidder = dbStore.getBidderById(req.params.id);
  if (!bidder) {
    res.status(404).json({ error: 'Bidder not found' });
    return;
  }
  const documents = dbStore.getDocuments(bidder.id);
  const complianceItems = dbStore.getComplianceItems(bidder.id);
  const findings = dbStore.getFindings(bidder.id);
  res.json({ bidder, documents, complianceItems, findings });
});

// 5. Document Upload & Extraction
apiRouter.get('/bids/:id/documents', (req: Request, res: Response) => {
  const bid = dbStore.getBidById(req.params.id);
  const bidId = bid ? bid.id : req.params.id;
  const bidderId = req.query.bidderId as string | undefined;
  let docs = dbStore.getDocuments(bidderId);
  if (!bidderId && bid) {
    docs = docs.filter(d => d.bidId === bid.id);
  }
  res.json({ documents: docs });
});

apiRouter.post('/bids/:id/documents', async (req: Request, res: Response) => {
  const bid = dbStore.getBidById(req.params.id);
  const bidId = bid ? bid.id : req.params.id;
  const { bidderId, fileName, fileType, fileSize, documentType, rawTextSnippet } = req.body;

  if (!bidderId || !fileName || !documentType) {
    res.status(400).json({ error: 'bidderId, fileName, and documentType are required' });
    return;
  }

  // Run AI structured extraction
  const aiResult = await AIService.analyzeDocument(fileName, documentType, rawTextSnippet);

  const doc = dbStore.addDocument({
    bidId,
    bidderId,
    fileName,
    fileType: fileType || 'application/pdf',
    fileSize: fileSize || '520 KB',
    documentType,
    uploadStatus: 'SUCCESS',
    processingStatus: 'AI_ANALYZED',
    verificationStatus: 'VERIFIED',
    confidence: aiResult.confidence,
    extractedFields: aiResult.fields,
    aiSummary: aiResult.explanation,
    pageCount: 1,
    mockEvidencePreview: {
      title: `${documentType} DOCUMENT`,
      issuer: 'Designated Government / Regulatory Authority',
      issueDate: new Date().toLocaleDateString(),
      certNumber: aiResult.fields['gstin'] || aiResult.fields['panNumber'] || aiResult.fields['udyamNumber'] || 'CERT-2026-X',
      entityName: aiResult.fields['legalName'] || aiResult.fields['name'] || 'ABC Technologies Pvt Ltd',
      rawSnippet: JSON.stringify(aiResult.fields, null, 2),
    },
  });

  res.status(201).json({ document: doc });
});

apiRouter.post('/documents/:id/analyze', async (req: Request, res: Response) => {
  const doc = dbStore.getDocumentById(req.params.id);
  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  const aiResult = await AIService.analyzeDocument(doc.fileName, doc.documentType);
  doc.extractedFields = aiResult.fields;
  doc.confidence = aiResult.confidence;
  doc.aiSummary = aiResult.explanation;
  doc.processingStatus = 'AI_ANALYZED';
  doc.analyzedAt = new Date().toISOString();

  // Recalculate
  dbStore.recalculateBidderCompliance(doc.bidderId);

  dbStore.addAuditEvent({
    bidId: doc.bidId,
    bidderId: doc.bidderId,
    actor: 'BidShield AI',
    role: 'AI_ASSISTANT',
    action: 'AI Re-Analysis Executed',
    details: `Re-extracted structured fields for ${doc.fileName} with confidence ${Math.round(doc.confidence * 100)}%`,
  });

  res.json({ document: doc });
});

// 6. Run Compliance Verification
apiRouter.post('/bids/:id/verify', (req: Request, res: Response) => {
  const bid = dbStore.getBidById(req.params.id);
  const bidId = bid ? bid.id : req.params.id;
  const { bidderId } = req.body;

  if (bidderId) {
    dbStore.recalculateBidderCompliance(bidderId);
  } else {
    const bidders = dbStore.getBidders(bidId);
    for (const b of bidders) {
      dbStore.recalculateBidderCompliance(b.id);
    }
  }

  dbStore.addAuditEvent({
    bidId,
    bidderId,
    actor: 'Rule Engine',
    role: 'RULE_ENGINE',
    action: 'Deterministic Compliance Batch Run',
    details: `Executed all compliance rules for bid ${bid?.bidNumber || bidId}`,
  });

  const compliance = dbStore.getComplianceItems(bidderId);
  const findings = dbStore.getFindings(bidderId);
  const bidder = bidderId ? dbStore.getBidderById(bidderId) : undefined;

  res.json({ success: true, compliance, findings, bidder });
});

// 7. Compliance Matrix, Findings, Evidence, Audit
apiRouter.get('/bids/:id/compliance', (req: Request, res: Response) => {
  const bidderId = req.query.bidderId as string | undefined;
  const items = dbStore.getComplianceItems(bidderId);
  res.json({ compliance: items });
});

apiRouter.get('/bids/:id/findings', (req: Request, res: Response) => {
  const bidderId = req.query.bidderId as string | undefined;
  const findings = dbStore.getFindings(bidderId);
  res.json({ findings });
});

apiRouter.get('/bids/:id/evidence', (req: Request, res: Response) => {
  const bidderId = req.query.bidderId as string | undefined;
  const docId = req.query.documentId as string | undefined;
  if (docId) {
    const doc = dbStore.getDocumentById(docId);
    res.json({ document: doc });
    return;
  }
  const docs = dbStore.getDocuments(bidderId);
  res.json({ documents: docs });
});

apiRouter.get('/bids/:id/audit', (req: Request, res: Response) => {
  const bid = dbStore.getBidById(req.params.id);
  const bidId = bid ? bid.id : req.params.id;
  const audits = dbStore.getAuditEvents(bidId);
  res.json({ auditTrail: audits });
});

// 8. Officer Decision
apiRouter.post('/bids/:id/bidders/:bidderId/decision', (req: Request, res: Response) => {
  const { bidderId } = req.params;
  const { status, notes, officerName, officerRole } = req.body;

  if (!status) {
    res.status(400).json({ error: 'Status is required (ACCEPTED, REJECTED, CLARIFICATION_REQUESTED)' });
    return;
  }

  const updatedBidder = dbStore.recordOfficerDecision(bidderId, {
    status,
    notes,
    officerName,
    officerRole,
  });

  if (!updatedBidder) {
    res.status(404).json({ error: 'Bidder not found' });
    return;
  }

  res.json({ bidder: updatedBidder });
});

// 9. Officer Override on Compliance Item
apiRouter.post('/compliance/override', (req: Request, res: Response) => {
  const { itemId, newStatus, reason, officer } = req.body;
  if (!itemId || !newStatus) {
    res.status(400).json({ error: 'itemId and newStatus are required' });
    return;
  }

  const item = dbStore.updateComplianceItemOverride(itemId, newStatus, reason || 'Officer manual override', officer || 'Officer R. Sharma');
  if (!item) {
    res.status(404).json({ error: 'Compliance item not found' });
    return;
  }

  res.json({ item });
});

// 10. Generate Compliance Report
apiRouter.get('/bids/:id/report', (req: Request, res: Response) => {
  const bid = dbStore.getBidById(req.params.id);
  const bidderId = (req.query.bidderId as string) || 'bidder-001';
  const bidder = dbStore.getBidderById(bidderId);

  if (!bid || !bidder) {
    res.status(404).json({ error: 'Bid or Bidder not found' });
    return;
  }

  const documents = dbStore.getDocuments(bidder.id);
  const compliance = dbStore.getComplianceItems(bidder.id);
  const findings = dbStore.getFindings(bidder.id);
  const auditTrail = dbStore.getAuditEvents(bid.id);

  res.json({
    report: {
      generatedAt: new Date().toISOString(),
      reportId: `BS-REP-${bid.bidNumber.replace(/\//g, '-')}-${bidder.pan}`,
      bid,
      bidder,
      summary: {
        totalDocsChecked: documents.length,
        verified: compliance.filter(c => c.status === 'VERIFIED').length,
        reviewRequired: compliance.filter(c => c.status === 'REVIEW_REQUIRED').length,
        discrepancies: compliance.filter(c => c.status === 'DISCREPANCY').length,
        missing: compliance.filter(c => c.status === 'DOCUMENT_MISSING').length,
        expired: compliance.filter(c => c.status === 'EXPIRED').length,
        riskLevel: bidder.riskLevel,
        riskScore: bidder.riskScore,
        humanReviewStatus: bidder.officerDecision ? bidder.officerDecision.status : 'PENDING_OFFICER_REVIEW',
      },
      documents,
      compliance,
      findings,
      auditTrail,
      legalDisclaimer:
        'BidShield provides AI-assisted compliance verification and decision support. Final procurement decisions remain with the authorized procurement officer. All external checks performed via prototype mock connectors.',
    },
  });
});

// 11. Connectors Status & Test
apiRouter.get('/connectors/status', async (_req: Request, res: Response) => {
  const gst = new MockGSTConnector();
  const udyam = new MockUdyamConnector();
  const epfo = new MockEPFOConnector();
  const esic = new MockESICConnector();
  const oem = new MockOEMConnector();
  const blacklist = new MockBlacklistConnector();

  const results = await Promise.all([
    gst.verify('29ABCDE1234F1Z5', 'ABC Technologies Private Limited'),
    udyam.verify('UDYAM-KR-03-0049281', 'ABC Technologies'),
    epfo.verify('DL/CPM/1048291', 'ABC Technologies'),
    esic.verify('11000984720001001', 'ABC Technologies'),
    oem.verify('OEM/2026/123-IN', 'XYZ Corporation Global Systems'),
    blacklist.verify('ABCDE1234F', 'ABC Technologies Pvt Ltd'),
  ]);

  res.json({ connectors: results });
});

// 12. Reset to Demo
apiRouter.post('/demo/reset', (_req: Request, res: Response) => {
  dbStore.resetToDemo();
  res.json({ message: 'Database reset to initial demo state successfully.' });
});
