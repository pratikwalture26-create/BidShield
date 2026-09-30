import React, { useState } from 'react';
import { ComplianceItem, Bidder, Bid } from '../types';
import { StatusBadge, MockVerificationPill } from '../components/StatusBadge';
import { TableProperties, Eye, CheckCircle2, AlertTriangle, Filter, Sparkles } from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface ComplianceMatrixPageProps {
  bidder: Bidder | null;
  bid: Bid | null;
  complianceItems: ComplianceItem[];
  onSelectEvidenceItem: (item: ComplianceItem) => void;
  onNavigate: (tab: NavTab) => void;
  onVerifyNow: () => void;
  isVerifying?: boolean;
}

export const ComplianceMatrixPage: React.FC<ComplianceMatrixPageProps> = ({
  bidder,
  bid,
  complianceItems,
  onSelectEvidenceItem,
  onNavigate,
  onVerifyNow,
  isVerifying = false,
}) => {
  const [filter, setFilter] = useState<string>('ALL');

  if (!bidder) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
        Please select a bidder to view their compliance matrix.
      </div>
    );
  }

  const filteredItems = complianceItems.filter((item) => {
    if (filter === 'ALL') return true;
    return item.status === filter;
  });

  const verifiedCount = complianceItems.filter(c => c.status === 'VERIFIED').length;
  const reviewCount = complianceItems.filter(c => c.status === 'REVIEW_REQUIRED').length;
  const discrepancyCount = complianceItems.filter(c => c.status === 'DISCREPANCY' || c.status === 'DOCUMENT_MISSING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Tender Compliance Matrix
            </h1>
            <MockVerificationPill text="Deterministic Rule Engine" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Bidder: <strong className="text-slate-800">{bidder.legalName}</strong> &bull; Tender: <span className="font-mono text-blue-700">{bid?.bidNumber || bidder.bidId}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onVerifyNow}
            disabled={isVerifying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isVerifying ? 'Evaluating...' : 'Re-Evaluate Matrix'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs">
          <span className="text-slate-500 font-medium">Total Requirements</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {complianceItems.length}
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs">
          <span className="text-emerald-700 font-semibold">Verified Requirements</span>
          <div className="text-xl font-bold font-mono text-emerald-800 mt-1">
            {verifiedCount}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
          <span className="text-amber-800 font-semibold">Review Required</span>
          <div className="text-xl font-bold font-mono text-amber-900 mt-1">
            {reviewCount}
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs">
          <span className="text-rose-800 font-semibold">Discrepancies / Missing</span>
          <div className="text-xl font-bold font-mono text-rose-900 mt-1">
            {discrepancyCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {['ALL', 'VERIFIED', 'REVIEW_REQUIRED', 'DISCREPANCY'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                filter === f
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          Showing <strong>{filteredItems.length}</strong> of {complianceItems.length} items
        </span>
      </div>

      {/* Main Compliance Matrix Table (Section 15 Specification) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Requirement</th>
              <th className="py-3 px-4">Evidence Document</th>
              <th className="py-3 px-4">Rule Ref</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Verification Source</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => (
              <tr
                key={item.id}
                onClick={() => {
                  onSelectEvidenceItem(item);
                  onNavigate('evidence');
                }}
                className="hover:bg-blue-50/40 cursor-pointer transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">
                    {item.requirement}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {item.reason}
                  </div>
                </td>

                <td className="py-3 px-4 font-mono font-medium text-slate-800">
                  {item.evidenceDocName}
                </td>

                <td className="py-3 px-4 font-mono text-slate-600 font-semibold text-[11px]">
                  {item.ruleId}
                </td>

                <td className="py-3 px-4">
                  <StatusBadge status={item.status} className="text-[10px] px-2 py-0.5" />
                </td>

                <td className="py-3 px-4 font-mono font-bold text-blue-900">
                  {Math.round(item.confidence * 100)}%
                </td>

                <td className="py-3 px-4 text-[11px] text-slate-500">
                  <div className="truncate max-w-[200px]" title={item.verificationSource}>
                    {item.verificationSource}
                  </div>
                  {item.mockMode && (
                    <span className="text-[9px] text-slate-400 font-mono uppercase block mt-0.5">
                      Prototype / Mock Verification
                    </span>
                  )}
                </td>

                <td className="py-3 px-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvidenceItem(item);
                      onNavigate('evidence');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-100 text-blue-800 font-bold text-xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
