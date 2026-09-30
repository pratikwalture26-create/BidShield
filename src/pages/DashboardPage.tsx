import React from 'react';
import {
  FolderKanban,
  FileCheck2,
  AlertTriangle,
  FileQuestion,
  Users,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Bid, Bidder, Finding, AuditEvent } from '../types';
import { StatusBadge, SeverityBadge, MockVerificationPill } from '../components/StatusBadge';
import { NavTab } from '../components/Sidebar';

interface DashboardPageProps {
  bids: Bid[];
  selectedBid: Bid | null;
  selectedBidder: Bidder | null;
  findings: Finding[];
  auditTrail: AuditEvent[];
  onNavigate: (tab: NavTab) => void;
  onSelectBid: (bid: Bid) => void;
  onSelectBidder: (bidder: Bidder) => void;
  onLoadDemo: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  bids,
  selectedBid,
  selectedBidder,
  findings,
  auditTrail,
  onNavigate,
  onSelectBid,
  onSelectBidder,
  onLoadDemo,
}) => {
  // Aggregate stats
  const totalBids = bids.length;
  const underReview = bids.filter(b => b.status === 'UNDER_REVIEW').length;
  const criticalFindings = findings.filter(f => f.severity === 'CRITICAL').length;
  const warningFindings = findings.filter(f => f.severity === 'WARNING').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Demo Callout */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-900/60 rounded-xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase">
              Tender Compliance Command Center
            </span>
            <MockVerificationPill text="Decision-Support Prototype" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-serif">
            GeM Procurement Compliance & Verification Overview
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Automating cross-document consistency checks, statutory identifier validation, and entity resolution while keeping final approval authority with authorized officers.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onLoadDemo}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Primary Demo Bid</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Active Bids</span>
            <FolderKanban className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {totalBids}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across 3 Ministries</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Under Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2 font-mono">
            {underReview}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">Technical evaluation</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Verified Docs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 font-mono">
            11
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">High confidence &ge; 90%</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Review Required</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2 font-mono">
            {warningFindings || 2}
          </div>
          <div className="text-[11px] text-amber-600 mt-0.5">e.g. OEM Authorization</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Critical Findings</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2 font-mono">
            {criticalFindings || 1}
          </div>
          <div className="text-[11px] text-rose-600 mt-0.5">e.g. MII Entity Mismatch</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Processed Docs</span>
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700 mt-2 font-mono">
            16
          </div>
          <div className="text-[11px] text-indigo-600 mt-0.5">OCR + Gemini Structured</div>
        </div>
      </div>

      {/* Primary Active Evaluation Focus Card */}
      {selectedBid && selectedBidder && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-mono">
                  {selectedBid.bidNumber}
                </span>
                <span className="text-xs text-slate-500">|</span>
                <span className="text-xs font-semibold text-slate-700">
                  {selectedBid.title}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Active Evaluation: {selectedBidder.legalName}
              </h2>
            </div>

            <div className="flex items-center gap-2.5">
              <StatusBadge status={selectedBidder.overallStatus} />
              <button
                onClick={() => onNavigate('compliance-matrix')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs"
              >
                <span>View Compliance Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Entity Match Score
              </span>
              <div className="text-xl font-bold text-blue-900 mt-1 font-mono">
                {selectedBidder.entityMatchScore}%
              </div>
              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                {selectedBidder.entityMatchReason}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Prototype Risk Score
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-slate-900">
                  {selectedBidder.riskScore}/100
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  selectedBidder.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' :
                  selectedBidder.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedBidder.riskLevel}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Deterministic rule weights (+30 entity mismatch, +10 OEM)
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Statutory Identifiers
              </span>
              <div className="text-xs text-slate-700 mt-1 space-y-0.5 font-mono">
                <div>PAN: <span className="font-semibold">{selectedBidder.pan}</span></div>
                <div>GST: <span className="font-semibold truncate">{selectedBidder.gstin}</span></div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                Officer Decision
              </span>
              <div className="text-xs mt-1 font-semibold text-slate-800">
                {selectedBidder.officerDecision ? (
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Decision Recorded: {selectedBidder.officerDecision.status}
                  </span>
                ) : (
                  <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Pending Officer Sign-off
                  </span>
                )}
              </div>
              <button
                onClick={() => onNavigate('report')}
                className="mt-2 text-xs text-blue-700 hover:text-blue-900 font-semibold underline block"
              >
                Review Report & Sign &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Critical Findings & Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Critical Findings Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Identified Findings & Discrepancies
              </h3>
            </div>
            <button
              onClick={() => onNavigate('findings')}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold"
            >
              View All ({findings.length}) &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {findings.slice(0, 3).map((f) => (
              <div
                key={f.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => onNavigate('findings')}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    {f.title}
                  </span>
                  <SeverityBadge severity={f.severity} />
                </div>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                  {f.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                  <span>Rule: {f.ruleId}</span>
                  <span className="text-blue-700 font-semibold hover:underline">
                    Inspect Evidence &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Trail Snippet */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Recent Audit Trail Events
              </h3>
            </div>
            <button
              onClick={() => onNavigate('audit')}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold"
            >
              View Audit Log ({auditTrail.length}) &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {auditTrail.slice(0, 4).map((evt) => (
              <div
                key={evt.id}
                className="flex items-start gap-2.5 text-xs border-b border-slate-100 pb-2 last:border-b-0"
              >
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800">
                      {evt.action}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">
                    {evt.details}
                  </p>
                  <span className="text-[9px] text-slate-400 font-medium">
                    By: {evt.actor} ({evt.role})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
