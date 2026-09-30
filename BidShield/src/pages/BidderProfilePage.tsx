import React from 'react';
import { Bidder, BidDocument, ComplianceItem, Bid } from '../types';
import { StatusBadge, RiskBadge, MockVerificationPill } from '../components/StatusBadge';
import { NavTab } from '../components/Sidebar';
import {
  Building2,
  FileText,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Upload,
  ArrowRight,
  Sparkles,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

interface BidderProfilePageProps {
  bidder: Bidder | null;
  bidders: Bidder[];
  bid: Bid | null;
  documents: BidDocument[];
  complianceItems: ComplianceItem[];
  onSelectBidder: (bidder: Bidder) => void;
  onNavigate: (tab: NavTab) => void;
  onVerifyNow: () => void;
  isVerifying?: boolean;
}

export const BidderProfilePage: React.FC<BidderProfilePageProps> = ({
  bidder,
  bidders,
  bid,
  documents,
  complianceItems,
  onSelectBidder,
  onNavigate,
  onVerifyNow,
  isVerifying = false,
}) => {
  if (!bidder) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
        Please select a bidder to view profile details.
      </div>
    );
  }

  // Calculate compliance pills
  const docStatusMap = [
    { label: 'PAN', key: 'PAN' },
    { label: 'GST', key: 'GST_CERTIFICATE' },
    { label: 'UDYAM', key: 'UDYAM' },
    { label: 'OEM', key: 'OEM_AUTHORIZATION' },
    { label: 'EPFO', key: 'EPFO' },
    { label: 'ESIC', key: 'ESIC' },
    { label: 'MII', key: 'MAKE_IN_INDIA' },
  ];

  return (
    <div className="space-y-6">
      {/* Bidder Switcher Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-2 shrink-0">
          Tender Bidders:
        </span>
        {bidders.map((b) => (
          <button
            key={b.id}
            onClick={() => onSelectBidder(b)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              b.id === bidder.id
                ? 'bg-blue-800 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>{b.legalName}</span>
            <span className={`w-2 h-2 rounded-full ${
              b.overallStatus === 'VERIFIED' ? 'bg-emerald-400' :
              b.overallStatus === 'REVIEW_REQUIRED' ? 'bg-amber-400' :
              'bg-rose-400'
            }`}></span>
          </button>
        ))}
      </div>

      {/* Main Profile Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 font-serif">
                {bidder.legalName}
              </h1>
              <StatusBadge status={bidder.overallStatus} />
              <RiskBadge level={bidder.riskLevel} score={bidder.riskScore} />
            </div>

            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>Trade Name: <strong className="text-slate-700">{bidder.tradeName}</strong></span>
              <span>&bull;</span>
              <span>Bid: <strong className="text-blue-800 font-mono">{bid?.bidNumber || bidder.bidId}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('upload')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>

            <button
              onClick={onVerifyNow}
              disabled={isVerifying}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isVerifying ? 'Running Rules...' : 'Re-Run Compliance Engine'}</span>
            </button>
          </div>
        </div>

        {/* Document Status Summary Strip (Section 9 Requirement) */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
              Document Compliance Verification Summary
            </span>
            <MockVerificationPill text="Deterministic Rule Status" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {docStatusMap.map(item => {
              const matchedItem = complianceItems.find(c => c.requirementCode === item.key || c.documentType === item.key);
              const status = matchedItem ? matchedItem.status : 'PENDING';
              return (
                <div
                  key={item.key}
                  className="bg-white border border-slate-200 rounded-md p-2 flex flex-col justify-between"
                >
                  <span className="text-[11px] font-bold text-slate-800">
                    {item.label}
                  </span>
                  <div className="mt-1">
                    <StatusBadge status={status} className="text-[10px] px-1.5 py-0.2" showIcon={false} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Entity Resolution Card (Section 12 Requirement) */}
        <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-700" />
                <h3 className="text-sm font-bold text-blue-950 font-serif">
                  Entity Resolution & Statutory Name Reconciliation
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Fuzzy identity & corporate abbreviation matching across Bidder Record, PAN Card, GST Registration, and Udyam Portal.
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-blue-900">
                {bidder.entityMatchScore}%
              </span>
              <span className="block text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                Entity Match Score
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-blue-200/60 flex flex-col md:flex-row md:items-center justify-between text-xs text-slate-700 gap-2">
            <div>
              <strong className="text-slate-900">Reason:</strong> {bidder.entityMatchReason}
            </div>
            <button
              onClick={() => onNavigate('compliance-matrix')}
              className="text-blue-800 hover:text-blue-950 font-bold underline shrink-0"
            >
              Inspect Cross-Check Details &rarr;
            </button>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Statutory Identifiers */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              Statutory Identifiers
            </h4>

            <div className="space-y-1.5 text-xs text-slate-700 divide-y divide-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">PAN:</span>
                <span className="font-mono font-semibold text-slate-900">{bidder.pan}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">GSTIN:</span>
                <span className="font-mono font-semibold text-slate-900">{bidder.gstin}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Udyam Registration:</span>
                <span className="font-mono font-semibold text-slate-900">{bidder.udyamNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">EPFO Code:</span>
                <span className="font-mono font-semibold text-slate-900">{bidder.epfoNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">ESIC Employer Code:</span>
                <span className="font-mono font-semibold text-slate-900">{bidder.esicNumber || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Contact & Address */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Registered Address & Contact
            </h4>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span>{bidder.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Contact Person: <strong className="text-slate-900">{bidder.contactPerson}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono">{bidder.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono">{bidder.contactPhone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Documents Table */}
        <div className="border-t border-slate-200 pt-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-900">
              Uploaded Bidder Documents ({documents.length})
            </h4>
            <button
              onClick={() => onNavigate('upload')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900"
            >
              Upload / Replace Documents &rarr;
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">AI Confidence</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-medium text-slate-900 font-mono">
                      {doc.fileName}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">
                      {doc.documentType}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">
                      {doc.fileSize}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-800">
                      {Math.round(doc.confidence * 100)}%
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={doc.verificationStatus} className="text-[10px] px-1.5" />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => onNavigate('evidence')}
                        className="text-blue-700 hover:text-blue-900 font-semibold underline text-xs"
                      >
                        Inspect Evidence
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
