import React, { useState } from 'react';
import { Finding, Bidder } from '../types';
import { StatusBadge, SeverityBadge, MockVerificationPill } from '../components/StatusBadge';
import { AlertOctagon, Sparkles, Eye, ShieldAlert, CheckCircle, ArrowRight, HelpCircle } from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface FindingsPageProps {
  bidder: Bidder | null;
  findings: Finding[];
  onInspectEvidence: (finding: Finding) => void;
  onNavigate: (tab: NavTab) => void;
}

export const FindingsPage: React.FC<FindingsPageProps> = ({
  bidder,
  findings,
  onInspectEvidence,
  onNavigate,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  if (!bidder) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
        Please select a bidder to view findings and discrepancies.
      </div>
    );
  }

  const categories = ['ALL', 'CRITICAL', 'WARNING'];
  const filteredFindings = findings.filter((f) => {
    if (activeCategory === 'ALL') return true;
    return f.severity === activeCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Compliance Findings & Discrepancies
            </h1>
            <MockVerificationPill text="AI Explanation & Audit Support" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Bidder: <strong className="text-slate-800">{bidder.legalName}</strong> &bull; Total Identified Findings: <strong className="text-rose-700">{findings.length}</strong>
          </p>
        </div>

        <button
          onClick={() => onNavigate('report')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs"
        >
          <span>Generate Official Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              activeCategory === c
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {c} ({c === 'ALL' ? findings.length : findings.filter(f => f.severity === c).length})
          </button>
        ))}
      </div>

      {/* Findings Cards List */}
      <div className="space-y-4">
        {filteredFindings.map((finding, idx) => (
          <div
            key={finding.id}
            className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
              finding.severity === 'CRITICAL'
                ? 'border-rose-200 border-l-4 border-l-rose-600'
                : 'border-amber-200 border-l-4 border-l-amber-500'
            }`}
          >
            {/* Top Bar of Finding */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-slate-500">
                    Finding #{idx + 1}
                  </span>
                  <SeverityBadge severity={finding.severity} />
                  <StatusBadge status={finding.status} className="text-[10px] px-1.5" />
                  <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                    Rule: {finding.ruleId}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {finding.title}
                </h3>
              </div>

              <button
                onClick={() => onInspectEvidence(finding)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Evidence Canvas</span>
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-700 mt-3 leading-relaxed">
              {finding.description}
            </p>

            {/* Variance Comparison Box */}
            {(finding.extractedValue || finding.expectedValue) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wide">
                    Extracted Document Value:
                  </span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                    {finding.extractedValue || 'N/A'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Source: {finding.evidenceDocName}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold block text-[11px] uppercase tracking-wide">
                    Expected / Registered Value:
                  </span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                    {finding.expectedValue || 'N/A'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Source: GeM Bidder Profile Master
                  </span>
                </div>
              </div>
            )}

            {/* Gemini AI Explanation Section (Section 19 Requirement) */}
            <div className="mt-3.5 bg-blue-50/70 border border-blue-200 rounded-lg p-3.5 text-xs text-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Technical Explanation (Decision Support):</span>
              </div>
              <p className="leading-relaxed text-slate-700 italic">
                &ldquo;{finding.aiExplanation}&rdquo;
              </p>
            </div>

            {/* Recommended Officer Action */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between text-xs text-slate-700 gap-2">
              <div>
                <strong className="text-slate-900">Recommended Officer Action:</strong>{' '}
                <span className="text-slate-700">{finding.recommendedOfficerAction}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                Evidence: {finding.evidenceDocName}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
