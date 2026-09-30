import { MockConnectorResult } from '../../src/types/index.js';

export interface GovernmentVerificationConnector {
  connectorName: string;
  systemName: string;
  verify(identifier: string, legalName: string): Promise<MockConnectorResult>;
}

export class MockGSTConnector implements GovernmentVerificationConnector {
  connectorName = 'GSTN / Goods & Services Tax Network';
  systemName = 'GST';

  async verify(gstin: string, legalName: string): Promise<MockConnectorResult> {
    const isValidFormat = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin.trim());
    return {
      connectorName: this.connectorName,
      source: 'MOCK',
      verificationMode: 'PROTOTYPE',
      status: isValidFormat ? 'VERIFIED' : 'DISCREPANCY',
      verifiedAt: new Date().toISOString(),
      queryParam: gstin,
      message: isValidFormat
        ? `Mock GST verification succeeded for GSTIN ${gstin}. Legal entity: ${legalName}. Status: Active.`
        : `GSTIN format invalid or inactive record in mock registry.`,
      disclaimer: 'Prototype / Mock Verification - For demonstration only. Not connected to live GSTN APIs.',
    };
  }
}

export class MockUdyamConnector implements GovernmentVerificationConnector {
  connectorName = 'Ministry of MSME / Udyam Registration Portal';
  systemName = 'Udyam';

  async verify(udyamNumber: string, legalName: string): Promise<MockConnectorResult> {
    const isValid = udyamNumber.toUpperCase().startsWith('UDYAM-');
    return {
      connectorName: this.connectorName,
      source: 'MOCK',
      verificationMode: 'PROTOTYPE',
      status: isValid ? 'VERIFIED' : 'REVIEW_REQUIRED',
      verifiedAt: new Date().toISOString(),
      queryParam: udyamNumber,
      message: isValid
        ? `Mock MSME enterprise status verified for ${udyamNumber}. Category: Small Enterprise. Manufacturing.`
        : `Udyam registration number could not be validated in mock registry.`,
      disclaimer: 'Prototype / Mock Verification - For demonstration only. Not connected to Ministry of MSME.',
    };
  }
}

export class MockEPFOConnector implements GovernmentVerificationConnector {
  connectorName = 'Employees Provident Fund Organisation (EPFO)';
  systemName = 'EPFO';

  async verify(epfoNumber: string, _legalName: string): Promise<MockConnectorResult> {
    return {
      connectorName: this.connectorName,
      source: 'MOCK',
      verificationMode: 'PROTOTYPE',
      status: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
      queryParam: epfoNumber || 'MOCK-EPFO-EST-001',
      message: 'Establishment code active in mock database. Electronic Challan Return (ECR) up-to-date.',
      disclaimer: 'Prototype / Mock Verification - Not connected to real EPFO portal.',
    };
  }
}

export class MockESICConnector implements GovernmentVerificationConnector {
  connectorName = 'Employees State Insurance Corporation (ESIC)';
  systemName = 'ESIC';

  async verify(esicNumber: string, _legalName: string): Promise<MockConnectorResult> {
    return {
      connectorName: this.connectorName,
      source: 'MOCK',
      verificationMode: 'PROTOTYPE',
      status: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
      queryParam: esicNumber || 'MOCK-ESIC-UNIT-009',
      message: 'Employer contribution verified in mock database. No outstanding liabilities flagged.',
      disclaimer: 'Prototype / Mock Verification - Not connected to real ESIC portal.',
    };
  }
}

export class MockStartupConnector implements GovernmentVerificationConnector {
  connectorName = 'DPIIT Startup India Hub';
  systemName = 'Startup India';

  async verify(dppitNumber: string, _legalName: string): Promise<MockConnectorResult> {
    return {
      connectorName: this.connectorName,
      source: 'MOCK',
      verificationMode: 'PROTOTYPE',
      status: dppitNumber ? 'VERIFIED' : 'NOT_APPLICABLE',
      verifiedAt: new Date().toISOString(),
      queryParam: dppitNumber || 'N/A',
      message: dppitNumber ? 'Recognized startup certificate verified.' : 'Bidder has not claimed DPIIT Startup status.',
      disclaimer: 'Prototype / Mock Verification - Not connected to DPIIT portal.',
    };
  }
}

export class MockNSICConnector implements GovernmentVerificationConnector {
  connectorName = 'National Small Industries Corporation (NSIC)';
  systemName = 'NSIC';

  async verify(nsicNumber: string, _legalName: string): Promise<MockConnectorResult> {
    return {
      connectorName: this.connectorName,
      source: 'MOCK',
      verificationMode: 'PROTOTYPE',
      status: nsicNumber ? 'VERIFIED' : 'NOT_APPLICABLE',
      verifiedAt: new Date().toISOString(),
      queryParam: nsicNumber || 'N/A',
      message: nsicNumber ? 'Single point registration scheme valid.' : 'No NSIC exemption claim provided.',
      disclaimer: 'Prototype / Mock Verification - Not connected to NSIC registry.',
    };
  }
}

export class MockOEMConnector implements GovernmentVerificationConnector {
  connectorName = 'OEM Independent Direct Verification Gateway';
  systemName = 'OEM Gateway';

  async verify(authNumber: string, oemName: string): Promise<MockConnectorResult> {
    // For our primary demo, OEM requires review because independent electronic verification is pending
    return {
      connectorName: this.connectorName,
      source: 'MOCK',
      verificationMode: 'PROTOTYPE',
      status: 'REVIEW_REQUIRED',
      verifiedAt: new Date().toISOString(),
      queryParam: `${oemName} / ${authNumber}`,
      message: `OEM Authorization (${authNumber}) uploaded, but direct cryptographic validation from OEM (${oemName}) could not be independently completed. Officer review required.`,
      disclaimer: 'Prototype / Mock Verification - Real OEM authorization verification requires direct enterprise API integration.',
    };
  }
}

export class MockBlacklistConnector implements GovernmentVerificationConnector {
  connectorName = 'Central Debarment & Blacklisting Registry';
  systemName = 'Central Debarment';

  async verify(pan: string, legalName: string): Promise<MockConnectorResult> {
    // Clean mock verification for primary demo bidder
    return {
      connectorName: this.connectorName,
      source: 'MOCK',
      verificationMode: 'PROTOTYPE',
      status: 'NO_RECORD_FOUND',
      verifiedAt: new Date().toISOString(),
      queryParam: `${legalName} (PAN: ${pan})`,
      message: 'No matching debarment, blacklisting, or holiday list record identified in mock registry.',
      disclaimer: 'Prototype / Mock Verification - This is a prototype check and does not query actual Ministry/Departmental debarment lists.',
    };
  }
}
