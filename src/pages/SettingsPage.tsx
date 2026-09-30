import React, { useState } from 'react';
import { MockConnectorResult } from '../types';
import { MockVerificationPill } from '../components/StatusBadge';
import { Sliders, RefreshCw, Server, ShieldCheck, Database, Cpu, CheckCircle } from 'lucide-react';

interface SettingsPageProps {
  connectors: MockConnectorResult[];
  onResetDemo: () => Promise<void>;
  isLoadingConnectors?: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  connectors,
  onResetDemo,
  isLoadingConnectors = false,
}) => {
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleReset = async () => {
    if (!window.confirm('Reset all demo tenders, bidders, and documents back to original state?')) {
      return;
    }
    setResetting(true);
    try {
      await onResetDemo();
      setResetMessage('Database restored to initial evaluation demo dataset.');
      setTimeout(() => setResetMessage(''), 4000);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              System Configuration & Government Connectors
            </h1>
            <MockVerificationPill text="Connector Architecture" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Decoupled connector layer configured with prototype mock interfaces for evaluation.
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{resetting ? 'Resetting Store...' : 'Reset Demo Store to Factory State'}</span>
        </button>
      </div>

      {resetMessage && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-lg text-xs font-semibold">
          {resetMessage}
        </div>
      )}

      {/* Mock Connectors Architecture Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Government API Connectors (Prototype Mocks)
            </h3>
            <p className="text-xs text-slate-500">
              Designed as pluggable interfaces ready for official production OAuth/REST endpoints.
            </p>
          </div>
          <MockVerificationPill text="Prototype / Mock Verification" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {connectors.map((c, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{c.connectorName}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {c.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                {c.message}
              </p>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Query: {c.queryParam}</span>
                <span className="text-indigo-700 font-semibold">{c.source} / {c.verificationMode}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Extraction Engine Config */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 text-xs">
        <h3 className="text-sm font-bold text-slate-900">
          AI Model & Extraction Configuration
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Primary Model</span>
            <strong className="text-slate-900 font-mono text-sm">gemini-3.8-flash</strong>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Output Mode</span>
            <strong className="text-slate-900 font-mono text-sm">responseMimeType: JSON</strong>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Telemetry Header</span>
            <strong className="text-slate-900 font-mono text-sm">User-Agent: aistudio-build</strong>
          </div>
        </div>
      </div>

      {/* Architectural Stack Notice */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs text-xs space-y-2 font-mono">
        <div className="text-amber-400 font-bold text-xs uppercase tracking-wider">
          Production Architecture Interface Abstractions:
        </div>
        <p className="text-slate-300 font-sans leading-relaxed text-xs">
          The database layer implements the <strong>MongoDB Repository</strong> interface contract, the document storage layer implements the <strong>Amazon S3 Object Store</strong> contract, and the risk analysis layer implements the <strong>Python FastAPI + XGBoost ML</strong> contract.
        </p>
      </div>
    </div>
  );
};
