import React, { useState } from 'react';
import { Bid, Bidder, BidDocument, ComplianceItem, Finding, AuditEvent } from '../types';
import { StatusBadge, SeverityBadge, RiskBadge, MockVerificationPill } from '../components/StatusBadge';
import { BidShieldLogo } from '../components/BidShieldLogo';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  UserCheck,
  FileCheck2,
  Lock,
} from 'lucide-react';

interface ComplianceReportPageProps {
  bid: Bid | null;
  bidder: Bidder | null;
  documents: BidDocument[];
  complianceItems: ComplianceItem[];
  findings: Finding[];
  auditTrail: AuditEvent[];
  onRecordDecision: (status: 'ACCEPTED' | 'REJECTED' | 'CLARIFICATION_REQUESTED', notes: string) => Promise<void>;
  isRecordingDecision?: boolean;
}

export const ComplianceReportPage: React.FC<ComplianceReportPageProps> = ({
  bid,
  bidder,
  documents,
  complianceItems,
  findings,
  auditTrail,
  onRecordDecision,
  isRecordingDecision = false,
}) => {
  const [decisionNotes, setDecisionNotes] = useState(bidder?.officerDecision?.notes || '');
  const [decisionStatus, setDecisionStatus] = useState<'ACCEPTED' | 'REJECTED' | 'CLARIFICATION_REQUESTED'>('ACCEPTED');
  const [showSignModal, setShowSignModal] = useState(false);
  const [message, setMessage] = useState('');

  if (!bid || !bidder) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
        Please select a bid and bidder to generate the compliance report.
      </div>
    );
  }

  const verifiedCount = complianceItems.filter(c => c.status === 'VERIFIED').length;
  const reviewCount = complianceItems.filter(c => c.status === 'REVIEW_REQUIRED').length;
  const discrepancyCount = complianceItems.filter(c => c.status === 'DISCREPANCY').length;
  const missingCount = complianceItems.filter(c => c.status === 'DOCUMENT_MISSING').length;
  const expiredCount = complianceItems.filter(c => c.status === 'EXPIRED').length;

  const handlePrint = () => {
    window.print();
  };

  const handleSubmitDecision = async () => {
    if (!decisionNotes.trim()) return;
    try {
      await onRecordDecision(decisionStatus, decisionNotes);
      setShowSignModal(false);
      setMessage(`Officer decision "${decisionStatus}" recorded in compliance report & audit log.`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to record decision');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Action Bar (Not printed) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              BidShield Official Compliance & Eligibility Verification Report
            </h1>
            <MockVerificationPill text="Formal Tender Document" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            GeM Tender: <span className="font-mono font-bold text-slate-800">{bid.bidNumber}</span> &bull; Bidder:{' '}
            <strong className="text-blue-900">{bidder.legalName}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={() => setShowSignModal(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Sign & Record Officer Decision</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-lg text-xs font-semibold">
          {message}
        </div>
      )}

      {/* Formal Printable Document Canvas */}
      <div className="bg-white border border-slate-300 rounded-xl p-8 sm:p-10 shadow-sm text-slate-800 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Section 1: Cover Header */}
        <div className="border-b-2 border-slate-900 pb-5 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
            <span>GOVERNMENT E-MARKETPLACE (GeM)</span>
            <span>&bull;</span>
            <span>PROCUREMENT COMPLIANCE DIVISION</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <BidShieldLogo size="lg" />
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 font-serif">
              BIDSHIELD COMPLIANCE VERIFICATION DOSSIER
            </h2>
          </div>
          <div className="text-xs font-mono text-slate-600">
            Report Reference: BS-REP-{bid.bidNumber.replace(/\//g, '-')}-{bidder.pan} &bull; Generated:{' '}
            {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Section 2 & 3: Bid & Bidder Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="border border-slate-200 rounded-lg p-4 space-y-2 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
              1. Tender & Procuring Entity Metadata
            </h3>
            <div className="space-y-1">
              <div><span className="text-slate-500">Bid Number:</span> <strong className="font-mono text-slate-900">{bid.bidNumber}</strong></div>
              <div><span className="text-slate-500">Title:</span> <strong className="text-slate-900">{bid.title}</strong></div>
              <div><span className="text-slate-500">Ministry / Org:</span> <span>{bid.department}</span></div>
              <div><span className="text-slate-500">Item Category:</span> <span>{bid.category}</span></div>
              <div><span className="text-slate-500">Evaluation Date:</span> <span>29 September 2026</span></div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 space-y-2 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">
              2. Registered Bidder Metadata
            </h3>
            <div className="space-y-1">
              <div><span className="text-slate-500">Legal Entity:</span> <strong className="text-slate-900">{bidder.legalName}</strong></div>
              <div><span className="text-slate-500">Trade Name:</span> <span>{bidder.tradeName}</span></div>
              <div><span className="text-slate-500">PAN:</span> <span className="font-mono font-bold">{bidder.pan}</span> | <span className="text-slate-500">GSTIN:</span> <span className="font-mono">{bidder.gstin}</span></div>
              <div><span className="text-slate-500">MSME Udyam:</span> <span className="font-mono">{bidder.udyamNumber || 'N/A'}</span></div>
              <div><span className="text-slate-500">Address:</span> <span>{bidder.address}</span></div>
            </div>
          </div>
        </div>

        {/* Section 4: Executive Summary (Section 24 Specification) */}
        <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
            <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider font-serif">
              3. BIDSHIELD COMPLIANCE EXECUTIVE SUMMARY
            </h3>
            <MockVerificationPill text="Decision Support Synthesis" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 text-center text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Docs Checked</span>
              <span className="text-xl font-bold font-mono text-slate-900">{documents.length}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-emerald-700 text-[10px] uppercase font-bold block">Verified</span>
              <span className="text-xl font-bold font-mono text-emerald-800">{verifiedCount}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-amber-700 text-[10px] uppercase font-bold block">Review Req</span>
              <span className="text-xl font-bold font-mono text-amber-800">{reviewCount}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-rose-700 text-[10px] uppercase font-bold block">Discrepancy</span>
              <span className="text-xl font-bold font-mono text-rose-800">{discrepancyCount}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Missing</span>
              <span className="text-xl font-bold font-mono text-slate-700">{missingCount}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Expired</span>
              <span className="text-xl font-bold font-mono text-slate-700">{expiredCount}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Risk Level</span>
              <span className="text-xs font-bold text-amber-800 block mt-1.5">{bidder.riskLevel} ({bidder.riskScore}/100)</span>
            </div>
          </div>

          <div className="text-xs text-slate-800 space-y-1.5 pt-1">
            <strong className="text-slate-950">Key Findings Identified:</strong>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1">
              <li>
                <strong>OEM Authorization Requires Review:</strong> Valid authorization letter uploaded from XYZ Corporation, but independent automated electronic check was unconfirmed via mock gateway.
              </li>
              <li>
                <strong>Make in India Declaration Contains Entity Mismatch:</strong> Affidavit cites corporate affiliate &ldquo;ABC Technologies Inc&rdquo; rather than bidding corporate name &ldquo;ABC Technologies Pvt Ltd&rdquo;.
              </li>
            </ol>
            <div className="pt-2 text-xs font-semibold text-blue-950">
              Human Officer Technical Verification: <span className="text-amber-800 font-bold uppercase underline">REQUIRED BEFORE CONTRACT AWARD</span>
            </div>
          </div>
        </div>

        {/* Section 5: Compliance Matrix Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            4. Statutory & Tender Compliance Matrix
          </h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Requirement</th>
                  <th className="py-2.5 px-3">Evidence Document</th>
                  <th className="py-2.5 px-3">Rule</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Evaluation Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complianceItems.map((ci) => (
                  <tr key={ci.id}>
                    <td className="py-2 px-3 font-semibold text-slate-900">{ci.requirement}</td>
                    <td className="py-2 px-3 font-mono text-slate-700">{ci.evidenceDocName}</td>
                    <td className="py-2 px-3 font-mono text-slate-500">{ci.ruleId}</td>
                    <td className="py-2 px-3"><StatusBadge status={ci.status} className="text-[10px] px-1.5" /></td>
                    <td className="py-2 px-3 font-mono font-bold text-blue-900">{Math.round(ci.confidence * 100)}%</td>
                    <td className="py-2 px-3 text-slate-600 max-w-xs">{ci.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 7 & 8: Cross-Document Checks & Entity Resolution */}
        <div className="border border-slate-200 rounded-lg p-4 space-y-2 text-xs bg-slate-50/40">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
            5. Entity Resolution & Cross-Document Consistency Analysis
          </h3>
          <p className="text-slate-700">
            Bidder identity comparison between GeM Bid Profile, Income Tax PAN, GST REG-06, and MSME Udyam yielded an overall <strong>{bidder.entityMatchScore}% similarity</strong> index.
          </p>
          <div className="text-slate-600 italic">
            &ldquo;{bidder.entityMatchReason}&rdquo;
          </div>
        </div>

        {/* Section 11: Verification Sources Disclaimer */}
        <div className="border border-slate-200 rounded-lg p-4 space-y-1.5 text-[11px] text-slate-600 bg-slate-50/40">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
            6. Verification Connectors & Sources
          </h3>
          <p>
            External data cross-checks conducted via BidShield Mock Verification Connectors: GSTN Mock Gateway, Udyam Portal Mock, EPFO ECR Validator, ESIC Registry Mock, and Central Debarment Database.
          </p>
          <MockVerificationPill text="All External Verifications in Prototype Mode" />
        </div>

        {/* Section 13: Officer Review & Decision Sign-off */}
        <div className="border-2 border-slate-900 rounded-xl p-6 space-y-4 bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider font-serif">
              7. Authorized Procurement Officer Review & Sign-Off
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Form GeM-EVAL-26100</span>
          </div>

          {bidder.officerDecision ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Final Recorded Decision:</span>
                <span className={`px-2.5 py-0.5 rounded font-bold text-xs ${
                  bidder.officerDecision.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                  bidder.officerDecision.status === 'REJECTED' ? 'bg-red-100 text-red-800 border border-red-300' :
                  'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {bidder.officerDecision.status}
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  on {new Date(bidder.officerDecision.decidedAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Officer Justification & Notes:</span>
                <p className="mt-1 p-3 bg-white border border-slate-200 rounded text-slate-900 leading-relaxed font-sans">
                  {bidder.officerDecision.notes}
                </p>
              </div>
              <div className="pt-4 flex items-end justify-between text-xs">
                <div>
                  <div className="text-slate-400 font-mono text-[10px]">DIGITALLY ATTESTED:</div>
                  <strong className="text-slate-900">{bidder.officerDecision.officerName}</strong>
                  <div className="text-slate-500 text-[11px]">{bidder.officerDecision.officerRole}</div>
                </div>
                <div className="text-right text-[10px] text-slate-400 font-mono">
                  Attestation Checksum: 9a7f...41e2
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                A formal officer decision has not yet been logged for this bidder. Click the button below to record technical acceptance, rejection, or request for clarification.
              </p>
              <button
                onClick={() => setShowSignModal(true)}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold text-xs"
              >
                Record Technical Decision Now
              </button>
            </div>
          )}
        </div>

        {/* Mandatory Legal Disclaimer (Section 23 Requirement) */}
        <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            &ldquo;BidShield provides AI-assisted compliance verification and decision support. Final procurement decisions remain with the authorized procurement officer.&rdquo;
          </p>
          <p className="text-[10px] text-slate-400">
            Demonstration prototype for Problem Statement 26100.
          </p>
        </div>
      </div>

      {/* Officer Decision Sign-off Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-700" />
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Record Officer Procurement Decision
                </h3>
              </div>
              <button
                onClick={() => setShowSignModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600">
              As the authorized procurement officer, specify your evaluation outcome for <strong>{bidder.legalName}</strong>:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Evaluation Outcome Decision *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecisionStatus('ACCEPTED')}
                    className={`py-2 px-3 rounded-lg border font-bold text-xs text-center transition-all ${
                      decisionStatus === 'ACCEPTED'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Accept Bidder
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionStatus('CLARIFICATION_REQUESTED')}
                    className={`py-2 px-3 rounded-lg border font-bold text-xs text-center transition-all ${
                      decisionStatus === 'CLARIFICATION_REQUESTED'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Request Clarification
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecisionStatus('REJECTED')}
                    className={`py-2 px-3 rounded-lg border font-bold text-xs text-center transition-all ${
                      decisionStatus === 'REJECTED'
                        ? 'border-red-600 bg-red-50 text-red-900 ring-2 ring-red-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    Reject Bidder
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Official Justification & Audit Notes *
                </label>
                <textarea
                  required
                  rows={4}
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="e.g. 'Clarification requested regarding MII declaration entity name (ABC Technologies Inc vs ABC Technologies Pvt Ltd). OEM authorization validated via OEM portal confirmation.'..."
                  className="w-full border border-slate-300 rounded p-2.5 text-slate-900 focus:outline-blue-600 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSignModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitDecision}
                  disabled={isRecordingDecision || !decisionNotes.trim()}
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold transition-all disabled:opacity-50"
                >
                  {isRecordingDecision ? 'Signing...' : 'Sign & Record Decision'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
