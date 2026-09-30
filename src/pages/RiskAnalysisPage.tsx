import React from 'react';
import { Bidder, ComplianceItem, Finding } from '../types';
import { RiskBadge, MockVerificationPill } from '../components/StatusBadge';
import { Activity, ShieldAlert, Cpu, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface RiskAnalysisPageProps {
  bidder: Bidder | null;
  complianceItems: ComplianceItem[];
  findings: Finding[];
}

export const RiskAnalysisPage: React.FC<RiskAnalysisPageProps> = ({
  bidder,
  complianceItems,
  findings,
}) => {
  if (!bidder) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
        Please select a bidder to view risk and anomaly analysis.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Prototype Risk & Anomaly Analysis
            </h1>
            <MockVerificationPill text="Transparent Deterministic Scoring" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Bidder: <strong className="text-slate-800">{bidder.legalName}</strong> &bull; Tender Reference: <span className="font-mono text-blue-700">{bidder.bidId}</span>
          </p>
        </div>
      </div>

      {/* Prominent Prototype Notice Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 shadow-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-amber-300">
            Prototype Risk Analysis Architecture Note:
          </div>
          <p className="text-slate-300 leading-relaxed">
            This module evaluates risk based on transparent, deterministic rule weighting rather than an ungrounded black box. In the future production architecture, this interface communicates with a dedicated <strong>Python FastAPI + XGBoost</strong> anomaly classification service. This is <em>not</em> an official government risk rating.
          </p>
        </div>
      </div>

      {/* Main Score & Gauge Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Score Gauge */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Prototype Risk Score
          </span>

          <div className="relative flex items-center justify-center">
            <div className={`w-36 h-36 rounded-full border-8 flex flex-col items-center justify-center ${
              bidder.riskLevel === 'HIGH' ? 'border-red-500 text-red-600 bg-red-50/30' :
              bidder.riskLevel === 'MEDIUM' ? 'border-amber-500 text-amber-600 bg-amber-50/30' :
              'border-emerald-500 text-emerald-600 bg-emerald-50/30'
            }`}>
              <span className="text-4xl font-extrabold font-mono">
                {bidder.riskScore}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">
                Out of 100
              </span>
            </div>
          </div>

          <RiskBadge level={bidder.riskLevel} />

          <p className="text-[11px] text-slate-500 max-w-xs">
            Normalized based on document completeness, entity consistency, and independent gateway checks.
          </p>
        </div>

        {/* Scoring Weights Reference */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-bold text-slate-900">
              Deterministic Risk Factor Breakdown
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Total Points: <strong className="text-slate-900">{bidder.riskScore}</strong>
            </span>
          </div>

          <div className="space-y-3">
            {bidder.riskFactors.length === 0 ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>No risk penalty indicators flagged for this bidder profile.</span>
              </div>
            ) : (
              bidder.riskFactors.map((rf, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">
                      {rf.factor}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      {rf.description}
                    </p>
                  </div>

                  <span className="font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded shrink-0">
                    +{rf.points} pts
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Model Weights Standard Table */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-2">
              Standard Factor Penalty Matrix
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-600">
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                Missing Required Doc: <strong className="text-slate-900">+20</strong>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                Expired Certificate: <strong className="text-slate-900">+20</strong>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                Entity Mismatch: <strong className="text-slate-900">+30</strong>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                Address Disparity: <strong className="text-slate-900">+10</strong>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                Low OCR Confidence (&lt;85%): <strong className="text-slate-900">+10</strong>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200">
                Unresolved OEM Verification: <strong className="text-slate-900">+10</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Production Architecture Roadmap Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2.5 text-xs text-slate-700">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Cpu className="w-4 h-4 text-blue-700" />
          <span>Future Production ML Service Roadmap:</span>
        </div>
        <p className="leading-relaxed">
          In full production, the Node.js / Express verification layer streams extracted features to a containerized Python FastAPI service running a trained XGBoost classifier alongside historical GeM bid disqualification telemetry.
        </p>
        <div className="font-mono text-[11px] text-blue-900 bg-white p-2.5 rounded border border-slate-200">
          React SPA &rarr; Node.js + TS API &rarr; Python FastAPI AI/ML &rarr; PaddleOCR + Gemini 3.8 + XGBoost &rarr; MongoDB &rarr; Amazon S3
        </div>
      </div>
    </div>
  );
};
