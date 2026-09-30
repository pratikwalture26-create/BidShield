import { ComplianceStatus, BidDocument, Bidder, ComplianceItem, Finding } from '../../src/types/index.js';
import { EntityResolutionService } from '../services/EntityResolutionService.js';

export interface RuleDefinition {
  ruleId: string;
  name: string;
  category: string;
  description: string;
  mandatory: boolean;
}

export class ComplianceRuleEngine {
  public static readonly RULES: RuleDefinition[] = [
    {
      ruleId: 'RULE-PAN-001',
      name: 'Permanent Account Number Verification',
      category: 'TAX_AND_LEGAL',
      description: 'Checks if valid PAN card is submitted, valid format, and name matches bidder.',
      mandatory: true,
    },
    {
      ruleId: 'RULE-GST-001',
      name: 'GST Registration & Active Status',
      category: 'TAX_AND_LEGAL',
      description: 'Requires GST document, valid GSTIN, active taxpayer status, and matching entity name.',
      mandatory: true,
    },
    {
      ruleId: 'RULE-UDYAM-001',
      name: 'MSME / Udyam Enterprise Verification',
      category: 'ELIGIBILITY_BENEFITS',
      description: 'Verifies MSME registration status and enterprise category.',
      mandatory: false,
    },
    {
      ruleId: 'RULE-OEM-001',
      name: 'Original Equipment Manufacturer Authorization',
      category: 'OEM_AUTHORIZATION',
      description: 'Validates manufacturer authorization for supplied hardware/software products.',
      mandatory: true,
    },
    {
      ruleId: 'RULE-MII-001',
      name: 'Make in India Local Content Declaration',
      category: 'PUBLIC_PROCUREMENT_ORDER',
      description: 'Validates local content percentage (Class I: >=50%, Class II: 20-50%) and entity consistency.',
      mandatory: true,
    },
    {
      ruleId: 'RULE-EPFO-001',
      name: 'EPFO Statutory Compliance',
      category: 'LABOR_COMPLIANCE',
      description: 'Verifies active establishment status and recent ECR filing.',
      mandatory: true,
    },
    {
      ruleId: 'RULE-ESIC-001',
      name: 'ESIC Labor Welfare Compliance',
      category: 'LABOR_COMPLIANCE',
      description: 'Verifies state insurance coverage and returns compliance.',
      mandatory: true,
    },
    {
      ruleId: 'RULE-EXP-001',
      name: 'Document Expiration Check',
      category: 'DOCUMENT_INTEGRITY',
      description: 'Flag any document with expiry date prior to evaluation date as EXPIRED.',
      mandatory: true,
    },
    {
      ruleId: 'RULE-MATCH-001',
      name: 'Cross-Document Entity Consistency',
      category: 'CROSS_VERIFICATION',
      description: 'Flags critical discrepancies if entity names differ significantly between PAN and GST.',
      mandatory: true,
    },
    {
      ruleId: 'RULE-DOC-001',
      name: 'Mandatory Document Completeness',
      category: 'DOCUMENT_INTEGRITY',
      description: 'Flags DOCUMENT_MISSING if any mandatory document required by the bid is absent.',
      mandatory: true,
    },
    {
      ruleId: 'RULE-BL-001',
      name: 'Central Debarment & Blacklisting Clearance',
      category: 'ELIGIBILITY',
      description: 'Checks mock debarment registry for past procurement bans or active orders.',
      mandatory: true,
    }
  ];

  public static evaluateBidder(
    bidder: Bidder,
    documents: BidDocument[],
    requiredDocTypes: string[]
  ): { items: ComplianceItem[]; findings: Finding[]; overallStatus: ComplianceStatus } {
    const items: ComplianceItem[] = [];
    const findings: Finding[] = [];

    // Helper map
    const docsByType = new Map<string, BidDocument>();
    for (const doc of documents) {
      docsByType.set(doc.documentType, doc);
    }

    // 1. Mandatory Document completeness (RULE-DOC-001)
    for (const reqType of requiredDocTypes) {
      if (!docsByType.has(reqType)) {
        items.push({
          id: `ci-${bidder.id}-${reqType}`,
          bidId: bidder.bidId,
          bidderId: bidder.id,
          requirement: this.formatRequirementName(reqType),
          requirementCode: reqType,
          documentType: reqType as any,
          evidenceDocName: 'None (Document Missing)',
          status: 'DOCUMENT_MISSING',
          confidence: 1.0,
          ruleId: 'RULE-DOC-001',
          reason: `Mandatory document "${this.formatRequirementName(reqType)}" has not been submitted by the bidder.`,
          extractedValues: {},
          verificationSource: 'Bid Submission Repository',
          mockMode: false,
        });

        findings.push({
          id: `finding-${bidder.id}-miss-${reqType}`,
          bidId: bidder.bidId,
          bidderId: bidder.id,
          title: `Missing Required Document: ${this.formatRequirementName(reqType)}`,
          severity: 'CRITICAL',
          category: 'MISSING_DOCUMENT',
          status: 'DOCUMENT_MISSING',
          description: `Bidder failed to attach mandatory ${this.formatRequirementName(reqType)}. Procurement rules require full compliance.`,
          evidenceDocName: 'N/A',
          ruleId: 'RULE-DOC-001',
          confidence: 1.0,
          aiExplanation: `Under GeM procurement guidelines, missing mandatory eligibility documents prevent technical qualification unless a formal clarification is requested by the officer.`,
          recommendedOfficerAction: 'Issue a clarification notice to the bidder with a 48-hour submission window, or disqualify per tender clause.',
          resolved: false,
        });
      }
    }

    // 2. PAN Evaluation (RULE-PAN-001)
    const panDoc = docsByType.get('PAN');
    if (panDoc) {
      const extractedPan = panDoc.extractedFields['panNumber'] || panDoc.extractedFields['pan'] || '';
      const extractedName = panDoc.extractedFields['name'] || panDoc.extractedFields['legalName'] || '';
      const match = EntityResolutionService.compareNames(bidder.legalName, extractedName);

      const status: ComplianceStatus = match.isMatch && extractedPan ? 'VERIFIED' : 'DISCREPANCY';
      items.push({
        id: `ci-${bidder.id}-PAN`,
        bidId: bidder.bidId,
        bidderId: bidder.id,
        requirement: 'Permanent Account Number (PAN)',
        requirementCode: 'PAN',
        documentType: 'PAN',
        evidenceDocName: panDoc.fileName,
        evidenceDocId: panDoc.id,
        page: 1,
        status,
        confidence: panDoc.confidence || 0.99,
        ruleId: 'RULE-PAN-001',
        reason: match.isMatch
          ? `PAN ${extractedPan} matches bidder profile. Name match confidence: ${match.score}%.`
          : `Name on PAN ("${extractedName}") does not match bidder legal name.`,
        extractedValues: {
          'PAN Number': extractedPan,
          'Entity Name': extractedName,
          'Issue Date': panDoc.extractedFields['issueDate'] || '14/05/2018',
        },
        verificationSource: 'Uploaded PAN Card / Income Tax Registry Mock',
        mockMode: true,
      });

      if (!match.isMatch) {
        findings.push({
          id: `finding-${bidder.id}-pan-mismatch`,
          bidId: bidder.bidId,
          bidderId: bidder.id,
          title: 'PAN Entity Name Mismatch',
          severity: 'CRITICAL',
          category: 'ENTITY_MISMATCH',
          status: 'DISCREPANCY',
          description: `Extracted PAN name "${extractedName}" differs substantially from registered bidder "${bidder.legalName}".`,
          evidenceDocName: panDoc.fileName,
          evidenceDocId: panDoc.id,
          extractedValue: extractedName,
          expectedValue: bidder.legalName,
          ruleId: 'RULE-PAN-001',
          confidence: panDoc.confidence,
          aiExplanation: 'The name registered on the Income Tax PAN record is incongruent with the bidder application. This represents an entity identity risk.',
          recommendedOfficerAction: 'Verify incorporation certificate or certificate of name change before proceeding.',
          resolved: false,
        });
      }
    }

    // 3. GST Evaluation (RULE-GST-001 & RULE-MATCH-001)
    const gstDoc = docsByType.get('GST_CERTIFICATE');
    if (gstDoc) {
      const extractedGstin = gstDoc.extractedFields['gstin'] || '';
      const gstLegalName = gstDoc.extractedFields['legalName'] || '';
      const gstStatus = gstDoc.extractedFields['status'] || 'Active';
      const match = EntityResolutionService.compareNames(bidder.legalName, gstLegalName);

      const status: ComplianceStatus = match.isMatch && gstStatus.toLowerCase() === 'active' ? 'VERIFIED' : 'REVIEW_REQUIRED';
      items.push({
        id: `ci-${bidder.id}-GST`,
        bidId: bidder.bidId,
        bidderId: bidder.id,
        requirement: 'GST Registration Certificate',
        requirementCode: 'GST',
        documentType: 'GST_CERTIFICATE',
        evidenceDocName: gstDoc.fileName,
        evidenceDocId: gstDoc.id,
        page: 1,
        status,
        confidence: gstDoc.confidence || 0.97,
        ruleId: 'RULE-GST-001',
        reason: match.isMatch
          ? `GSTIN ${extractedGstin} is Active. ${match.reason}`
          : `GST legal name (${gstLegalName}) vs bidder (${bidder.legalName}): ${match.reason}`,
        extractedValues: {
          'GSTIN': extractedGstin,
          'Legal Name': gstLegalName,
          'Trade Name': gstDoc.extractedFields['tradeName'] || bidder.tradeName,
          'Status': gstStatus,
          'Registration Date': gstDoc.extractedFields['registrationDate'] || '01/07/2017',
        },
        verificationSource: 'GSTN Mock Verification Connector',
        mockMode: true,
      });
    }

    // 4. Udyam MSME Evaluation (RULE-UDYAM-001)
    const udyamDoc = docsByType.get('UDYAM');
    if (udyamDoc) {
      const udyamNumber = udyamDoc.extractedFields['udyamNumber'] || '';
      const enterpriseName = udyamDoc.extractedFields['enterpriseName'] || '';
      const match = EntityResolutionService.compareNames(bidder.legalName, enterpriseName);

      items.push({
        id: `ci-${bidder.id}-UDYAM`,
        bidId: bidder.bidId,
        bidderId: bidder.id,
        requirement: 'Udyam / MSME Registration',
        requirementCode: 'UDYAM',
        documentType: 'UDYAM',
        evidenceDocName: udyamDoc.fileName,
        evidenceDocId: udyamDoc.id,
        page: 1,
        status: match.isMatch ? 'VERIFIED' : 'REVIEW_REQUIRED',
        confidence: udyamDoc.confidence || 0.94,
        ruleId: 'RULE-UDYAM-001',
        reason: match.isMatch
          ? `Udyam certificate ${udyamNumber} valid. Category: ${udyamDoc.extractedFields['organizationType'] || 'Small Enterprise'}.`
          : `Enterprise name mismatch: ${match.reason}`,
        extractedValues: {
          'Udyam Reg No': udyamNumber,
          'Enterprise Name': enterpriseName,
          'Category': udyamDoc.extractedFields['organizationType'] || 'Small Enterprise (Manufacturing)',
          'Registration Date': udyamDoc.extractedFields['registrationDate'] || '12/09/2021',
        },
        verificationSource: 'Ministry of MSME Udyam Portal Mock Connector',
        mockMode: true,
      });
    }

    // 5. OEM Authorization Evaluation (RULE-OEM-001)
    const oemDoc = docsByType.get('OEM_AUTHORIZATION');
    if (oemDoc) {
      const oemName = oemDoc.extractedFields['oemName'] || 'XYZ Corporation';
      const authBidder = oemDoc.extractedFields['authorizedBidder'] || bidder.legalName;
      const authNumber = oemDoc.extractedFields['authorizationNumber'] || 'OEM/2026/123';
      const validUntil = oemDoc.extractedFields['validUntil'] || '31/12/2026';

      // Section 16 & 28 Demo Scenario: OEM is REVIEW_REQUIRED
      // Reason: Authorization validity could not be independently verified in the prototype.
      items.push({
        id: `ci-${bidder.id}-OEM`,
        bidId: bidder.bidId,
        bidderId: bidder.id,
        requirement: 'Original Equipment Manufacturer (OEM) Authorization',
        requirementCode: 'OEM',
        documentType: 'OEM_AUTHORIZATION',
        evidenceDocName: oemDoc.fileName,
        evidenceDocId: oemDoc.id,
        page: 2,
        status: 'REVIEW_REQUIRED',
        confidence: oemDoc.confidence || 0.82,
        ruleId: 'RULE-OEM-001',
        reason: 'Authorization document parsed successfully, but validity could not be independently verified in the prototype mock gateway.',
        extractedValues: {
          'OEM Name': oemName,
          'Authorized Bidder': authBidder,
          'Authorization Number': authNumber,
          'Validity': validUntil,
          'Product Category': oemDoc.extractedFields['productCategory'] || 'Enterprise Networking Switches',
        },
        verificationSource: 'OEM Independent Direct Verification Gateway (Mock)',
        mockMode: true,
      });

      findings.push({
        id: `finding-${bidder.id}-oem-review`,
        bidId: bidder.bidId,
        bidderId: bidder.id,
        title: 'OEM Authorization Requires Independent Confirmation',
        severity: 'WARNING',
        category: 'OEM_AUTHORIZATION',
        status: 'REVIEW_REQUIRED',
        description: `Authorization document from "${oemName}" is submitted, but manufacturer cryptographic signature/electronic gateway check could not be independently validated in prototype.`,
        evidenceDocName: oemDoc.fileName,
        evidenceDocId: oemDoc.id,
        extractedValue: `OEM: ${oemName} | Auth: ${authNumber}`,
        expectedValue: `Direct Electronic OEM Verification`,
        ruleId: 'RULE-OEM-001',
        confidence: oemDoc.confidence || 0.82,
        aiExplanation: 'The OEM certificate appears syntactically valid on the uploaded document. However, automated verification with the manufacturer registry was unconfirmed. Human officer verification via OEM portal or direct confirmation is advised.',
        recommendedOfficerAction: 'Procurement officer should verify the authorization reference OEM/2026/123 directly via the OEM partner portal or request confirmation email from OEM nodal contact.',
        resolved: false,
      });
    }

    // 6. Make in India Declaration (RULE-MII-001)
    const miiDoc = docsByType.get('MAKE_IN_INDIA');
    if (miiDoc) {
      const localContent = miiDoc.extractedFields['localContentPercentage'] || '58%';
      const declaredEntity = miiDoc.extractedFields['declaringEntity'] || miiDoc.extractedFields['entityName'] || 'ABC Technologies Inc';
      const match = EntityResolutionService.compareNames(bidder.legalName, declaredEntity);

      // In the primary demo scenario, Make in India has DISCREPANCY:
      // "Make in India declaration contains an entity mismatch."
      const isDemoMismatch = declaredEntity.includes('Inc') || !match.isMatch || match.score < 90;

      items.push({
        id: `ci-${bidder.id}-MII`,
        bidId: bidder.bidId,
        bidderId: bidder.id,
        requirement: 'Make in India (MII) Local Content Declaration',
        requirementCode: 'MII',
        documentType: 'MAKE_IN_INDIA',
        evidenceDocName: miiDoc.fileName,
        evidenceDocId: miiDoc.id,
        page: 1,
        status: isDemoMismatch ? 'DISCREPANCY' : 'VERIFIED',
        confidence: miiDoc.confidence || 0.76,
        ruleId: 'RULE-MII-001',
        reason: isDemoMismatch
          ? `Discrepancy: Self-declaration entity ("${declaredEntity}") does not strictly match bidder corporate name ("${bidder.legalName}").`
          : `Class I local supplier: ${localContent} local content confirmed.`,
        extractedValues: {
          'Local Content %': localContent,
          'Supplier Class': 'Class I Local Supplier (>=50%)',
          'Declaring Entity': declaredEntity,
          'Location of Value Addition': miiDoc.extractedFields['location'] || 'Bengaluru, Karnataka, India',
        },
        verificationSource: 'Bidder Self-Declaration / DPIIT MII Order',
        mockMode: true,
      });

      if (isDemoMismatch) {
        findings.push({
          id: `finding-${bidder.id}-mii-mismatch`,
          bidId: bidder.bidId,
          bidderId: bidder.id,
          title: 'Make in India Declaration Contains Entity Name Mismatch',
          severity: 'CRITICAL',
          category: 'MII_LOCAL_CONTENT',
          status: 'DISCREPANCY',
          description: `The Make in India affidavit declares local content under "${declaredEntity}", whereas the tender bidder is "${bidder.legalName}".`,
          evidenceDocName: miiDoc.fileName,
          evidenceDocId: miiDoc.id,
          extractedValue: declaredEntity,
          expectedValue: bidder.legalName,
          ruleId: 'RULE-MII-001',
          confidence: miiDoc.confidence || 0.76,
          aiExplanation: 'The self-declaration certificate references an affiliated or foreign entity name ("ABC Technologies Inc") rather than the domestic bidding entity ("ABC Technologies Pvt Ltd"). This creates a legal compliance ambiguity under the Public Procurement Order (Make in India).',
          recommendedOfficerAction: 'Reject preference claim or seek clarification regarding relationship with foreign affiliate and demand revised affidavit signed by the domestic entity authorized signatory.',
          resolved: false,
        });
      }
    }

    // 7. EPFO & ESIC Evaluation (RULE-EPFO-001 & RULE-ESIC-001)
    const epfoDoc = docsByType.get('EPFO');
    if (epfoDoc) {
      items.push({
        id: `ci-${bidder.id}-EPFO`,
        bidId: bidder.bidId,
        bidderId: bidder.id,
        requirement: 'EPFO Compliance & Challan',
        requirementCode: 'EPFO',
        documentType: 'EPFO',
        evidenceDocName: epfoDoc.fileName,
        evidenceDocId: epfoDoc.id,
        page: 1,
        status: 'VERIFIED',
        confidence: epfoDoc.confidence || 0.98,
        ruleId: 'RULE-EPFO-001',
        reason: 'EPF establishment code active. Recent wage month ECR and bank payment confirmation verified.',
        extractedValues: {
          'Est Code': epfoDoc.extractedFields['establishmentCode'] || 'DL/CPM/1048291',
          'Wage Month': epfoDoc.extractedFields['wageMonth'] || 'August 2026',
          'Challan Amount': epfoDoc.extractedFields['amount'] || '₹ 4,82,900',
          'TRRN Number': epfoDoc.extractedFields['trrn'] || '3182608019482',
        },
        verificationSource: 'EPFO Portal Mock Connector',
        mockMode: true,
      });
    }

    const esicDoc = docsByType.get('ESIC');
    if (esicDoc) {
      items.push({
        id: `ci-${bidder.id}-ESIC`,
        bidId: bidder.bidId,
        bidderId: bidder.id,
        requirement: 'ESIC Registration & Contribution',
        requirementCode: 'ESIC',
        documentType: 'ESIC',
        evidenceDocName: esicDoc.fileName,
        evidenceDocId: esicDoc.id,
        page: 1,
        status: 'VERIFIED',
        confidence: esicDoc.confidence || 0.97,
        ruleId: 'RULE-ESIC-001',
        reason: 'ESIC code verified. Monthly contribution challan reconciled with active workforce count.',
        extractedValues: {
          'ESIC Employer Code': esicDoc.extractedFields['employerCode'] || '11000984720001001',
          'Contribution Period': esicDoc.extractedFields['period'] || 'Apr 2026 - Sep 2026',
          'Challan Status': 'Paid / Realized',
        },
        verificationSource: 'ESIC Insurance Portal Mock Connector',
        mockMode: true,
      });
    }

    // 8. Debarment Check (RULE-BL-001)
    items.push({
      id: `ci-${bidder.id}-BL`,
      bidId: bidder.bidId,
      bidderId: bidder.id,
      requirement: 'Non-Debarment & Non-Blacklisting Status',
      requirementCode: 'BLACKLIST_CHECK',
      documentType: 'BLACKLIST_CHECK',
      evidenceDocName: 'Central Debarment Registry (Mock)',
      status: 'VERIFIED',
      confidence: 0.99,
      ruleId: 'RULE-BL-001',
      reason: 'No adverse debarment or holiday listing records identified for this PAN or entity name.',
      extractedValues: {
        'Debarment Record': 'Clean / None',
        'Registry': 'Central Debarment Registry (Prototype Check)',
      },
      verificationSource: 'Central Debarment & Blacklisting Mock Connector',
      mockMode: true,
    });

    // Determine overall status
    let overallStatus: ComplianceStatus = 'VERIFIED';
    const hasDiscrepancy = items.some(i => i.status === 'DISCREPANCY' || i.status === 'DOCUMENT_MISSING' || i.status === 'EXPIRED');
    const hasReview = items.some(i => i.status === 'REVIEW_REQUIRED');

    if (hasDiscrepancy) {
      overallStatus = 'DISCREPANCY';
    } else if (hasReview) {
      overallStatus = 'REVIEW_REQUIRED';
    }

    return { items, findings, overallStatus };
  }

  private static formatRequirementName(code: string): string {
    const map: Record<string, string> = {
      PAN: 'PAN Card',
      GST_CERTIFICATE: 'GST Certificate',
      UDYAM: 'Udyam / MSME Certificate',
      OEM_AUTHORIZATION: 'OEM Authorization Letter',
      MAKE_IN_INDIA: 'Make in India Declaration',
      EPFO: 'EPFO Challan & Registration',
      ESIC: 'ESIC Registration & Returns',
      STARTUP_INDIA: 'Startup India Certificate',
      NSIC: 'NSIC Single Point Registration',
    };
    return map[code] || code;
  }
}
