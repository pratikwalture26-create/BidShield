import React, { useState } from 'react';
import { BidDocument, Bidder, ComplianceItem, Finding, ComplianceStatus } from '../types';
import { StatusBadge, MockVerificationPill } from '../components/StatusBadge';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ShieldCheck,
  Edit3,
  Save,
} from 'lucide-react';

interface EvidenceViewerPageProps {
  bidder: Bidder | null;
  documents: BidDocument[];
  complianceItems: ComplianceItem[];
  findings: Finding[];
  selectedEvidenceItem: ComplianceItem | null;
  onOverrideCompliance: (itemId: string, newStatus: ComplianceStatus, reason: string) => Promise<void>;
}

export const EvidenceViewerPage: React.FC<EvidenceViewerPageProps> = ({
  bidder,
  documents,
  complianceItems,
  findings,
  selectedEvidenceItem,
  onOverrideCompliance,
}) => {
  const [activeItem, setActiveItem] = useState<ComplianceItem | null>(
    selectedEvidenceItem || complianceItems.find(c => c.status === 'REVIEW_REQUIRED' || c.status === 'DISCREPANCY') || complianceItems[0] || null
  );

  const [overrideStatus, setOverrideStatus] = useState<ComplianceStatus>('VERIFIED');
  const [overrideReason, setOverrideReason] = useState('');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);
  const [overrideSuccessMessage, setOverrideSuccessMessage] = useState('');

  if (!bidder || !activeItem) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
        Please select a requirement from the compliance matrix to inspect evidence.
      </div>
    );
  }

  // Find corresponding document
  const activeDoc = documents.find(d =>
    d.documentType === activeItem.documentType ||
    d.fileName.toLowerCase() === activeItem.evidenceDocName.toLowerCase()
  );

  const activeFinding = findings.find(f => f.ruleId === activeItem.ruleId);

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;
    setIsSubmittingOverride(true);
    try {
      await onOverrideCompliance(activeItem.id, overrideStatus, overrideReason);
      setOverrideSuccessMessage('Officer manual override and audit justification recorded.');
      setTimeout(() => setOverrideSuccessMessage(''), 4000);
      setOverrideReason('');
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Evidence Viewer & Document Inspection Canvas
            </h1>
            <MockVerificationPill text="Evidence Grounding" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspecting: <strong className="text-slate-800">{activeItem.requirement}</strong> for{' '}
            <strong className="text-blue-900">{bidder.legalName}</strong>
          </p>
        </div>

        {/* Quick Requirement Selector */}
        <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs shadow-2xs">
          <span className="text-slate-500 font-medium">Select Requirement:</span>
          <select
            value={activeItem.id}
            onChange={(e) => {
              const item = complianceItems.find(c => c.id === e.target.value);
              if (item) setActiveItem(item);
            }}
            className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
          >
            {complianceItems.map((ci) => (
              <option key={ci.id} value={ci.id}>
                {ci.requirement} ({ci.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Split Screen Layout (Section 17 Requirement) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[580px]">
        {/* Left Side: Document Preview (Col 7) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-sm">
          {/* Document Viewer Toolbar */}
          <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="font-mono font-bold truncate">
                {activeDoc?.fileName || activeItem.evidenceDocName}
              </span>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-400">
                Page {activeItem.page || 1} of {activeDoc?.pageCount || 1}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-[10px] uppercase font-mono">100% OCR Scan</span>
            </div>
          </div>

          {/* Document Paper Preview Canvas */}
          <div className="flex-1 p-6 overflow-y-auto bg-slate-800 flex items-center justify-center">
            <div className="bg-white text-slate-900 w-full max-w-lg min-h-[460px] p-8 shadow-2xl rounded-sm border border-slate-300 font-serif relative">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none">
                <span className="text-6xl font-bold uppercase rotate-45 text-slate-950">
                  OFFICIAL COPY
                </span>
              </div>

              {/* Document Header */}
              <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                <div className="text-[10px] uppercase tracking-widest font-sans font-bold text-slate-500">
                  {activeDoc?.mockEvidencePreview?.issuer || 'GOVERNMENT OF INDIA / STATUTORY ISSUING AUTHORITY'}
                </div>
                <h3 className="text-base font-bold uppercase tracking-tight mt-1">
                  {activeDoc?.mockEvidencePreview?.title || activeItem.requirement}
                </h3>
                <div className="text-[11px] font-sans text-slate-600 mt-0.5">
                  Reference No: <span className="font-mono font-bold">{activeDoc?.mockEvidencePreview?.certNumber || 'REF/2026/0912'}</span>
                </div>
              </div>

              {/* Document Body with Highlighted Extracted Sections */}
              <div className="space-y-4 text-xs font-sans">
                <div className="flex justify-between text-[11px] text-slate-600 pb-2 border-b border-dashed border-slate-200">
                  <span>Issue Date: <strong>{activeDoc?.mockEvidencePreview?.issueDate || '2026-09-24'}</strong></span>
                  <span>Valid Until: <strong>{activeDoc?.mockEvidencePreview?.expiryDate || 'PERPETUAL / ACTIVE'}</strong></span>
                </div>

                <div className="bg-blue-50/80 border border-blue-300 p-3 rounded-md">
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wide block mb-1">
                    [AI Extracted Entity Text]
                  </span>
                  <div className="font-mono font-bold text-sm text-blue-950">
                    {activeDoc?.mockEvidencePreview?.entityName || bidder.legalName}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 font-mono leading-relaxed whitespace-pre-line">
                    {activeDoc?.mockEvidencePreview?.rawSnippet || JSON.stringify(activeItem.extractedValues, null, 2)}
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 leading-relaxed font-sans">
                  This electronic transcript was ingested and validated using BidShield document OCR and Gemini vision models.
                </div>
              </div>

              {/* Document Footer Stamp */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] font-sans text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-700 text-emerald-800 font-bold flex items-center justify-center text-[8px] uppercase rotate-12">
                    VERIFIED
                  </div>
                  <span>Digital Checksum Valid</span>
                </div>
                <div className="font-mono">
                  SHA-256: e8b9...3f1a
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Finding Details, Metadata, and Officer Override (Col 5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Header info */}
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Compliance Finding Details
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {activeItem.requirement}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={activeItem.status} />
                <span className="font-mono text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Confidence: {Math.round(activeItem.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Extracted Values Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Extracted Ground Truth
              </h4>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 text-xs font-mono">
                {Object.entries(activeItem.extractedValues).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-slate-500">{k}:</span>
                    <span className="font-bold text-slate-900">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Metadata (Section 17 fields) */}
            <div className="space-y-1.5 text-xs text-slate-700 divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Registered Bidder:</span>
                <span className="font-semibold text-slate-900">{bidder.legalName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Rule Executed:</span>
                <span className="font-mono font-bold text-slate-900">{activeItem.ruleId}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Verification Source:</span>
                <span className="text-slate-800 truncate max-w-[200px]">{activeItem.verificationSource}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Mode:</span>
                <MockVerificationPill text="Prototype / Mock Verification" />
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Evaluation Timestamp:</span>
                <span className="font-mono text-slate-600">29 September 2026</span>
              </div>
            </div>

            {/* Rationale Callout */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700">
              <strong className="text-slate-900 block mb-0.5">Verification Rationale:</strong>
              {activeItem.reason}
            </div>

            {/* If there's an active finding with AI explanation */}
            {activeFinding && (
              <div className="bg-blue-50/70 border border-blue-200 rounded-lg p-3 text-xs text-slate-800">
                <strong className="text-blue-900 block mb-0.5">AI Assistance Note:</strong>
                <p className="italic text-slate-700">&ldquo;{activeFinding.aiExplanation}&rdquo;</p>
              </div>
            )}
          </div>

          {/* Officer Override Form (Human Decision Maker) */}
          <div className="border-t border-slate-200 pt-4 bg-slate-50/50 -mx-5 -mb-5 p-5 rounded-b-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Edit3 className="w-3.5 h-3.5 text-blue-700" />
                <span>Authorized Officer Override & Annotations</span>
              </div>
              <span className="text-[10px] text-slate-500">CAG & Vigilance Logged</span>
            </div>

            {overrideSuccessMessage && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-2 rounded text-xs font-semibold">
                {overrideSuccessMessage}
              </div>
            )}

            <form onSubmit={handleSaveOverride} className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-600 font-medium">New Status:</span>
                <select
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value as ComplianceStatus)}
                  className="bg-white border border-slate-300 rounded px-2 py-1 font-bold text-xs focus:outline-blue-600"
                >
                  <option value="VERIFIED">VERIFIED (Accept with Justification)</option>
                  <option value="REVIEW_REQUIRED">REVIEW REQUIRED (Pending Direct Query)</option>
                  <option value="DISCREPANCY">DISCREPANCY (Reject Claim)</option>
                </select>
              </div>

              <div>
                <textarea
                  required
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Officer rationale for override (e.g., 'Verified directly via OEM partner portal confirmation on 29-09-2026')..."
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-blue-600 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingOverride}
                className="w-full py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSubmittingOverride ? 'Saving...' : 'Record Officer Override in Audit Log'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
