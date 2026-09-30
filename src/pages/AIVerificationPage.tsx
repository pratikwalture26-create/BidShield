import React, { useState } from 'react';
import { BidDocument, Bidder } from '../types';
import { StatusBadge, MockVerificationPill } from '../components/StatusBadge';
import {
  FileCheck2,
  Code2,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface AIVerificationPageProps {
  bidder: Bidder | null;
  documents: BidDocument[];
  onAnalyzeDocument: (docId: string) => Promise<void>;
}

export const AIVerificationPage: React.FC<AIVerificationPageProps> = ({
  bidder,
  documents,
  onAnalyzeDocument,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(
    documents[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const selectedDoc = documents.find(d => d.id === selectedDocId) || documents[0];

  if (!bidder || !selectedDoc) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
        No documents uploaded for AI verification.
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedDoc.extractedFields, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReanalyze = async () => {
    setIsReanalyzing(true);
    try {
      await onAnalyzeDocument(selectedDoc.id);
    } finally {
      setIsReanalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Gemini AI Structured Extraction & Document Understanding
            </h1>
            <MockVerificationPill text="Structured JSON Mode" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Bidder: <strong className="text-slate-800">{bidder.legalName}</strong> &bull; Model: <span className="font-mono text-blue-700">gemini-3.8-flash</span>
          </p>
        </div>

        <button
          onClick={handleReanalyze}
          disabled={isReanalyzing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin' : ''}`} />
          <span>{isReanalyzing ? 'Extracting with Gemini...' : 'Re-Run Gemini Extraction'}</span>
        </button>
      </div>

      {/* Principle Reminder Banner */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Gemini Boundary Principle:</strong> Gemini models extract structured data and generate factual explanations of variances. Gemini does <em>not</em> decide final tender eligibility. Compliance rules determine status; the authorized procurement officer retains final decision-making power.
        </div>
      </div>

      {/* Document Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {documents.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setSelectedDocId(doc.id)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
              selectedDoc.id === doc.id
                ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>{doc.documentType}</span>
            <span className="text-[10px] font-mono opacity-80">
              ({Math.round(doc.confidence * 100)}%)
            </span>
          </button>
        ))}
      </div>

      {/* Two Column Layout: Structured Fields on Left, Raw JSON on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Structured Fields Table & AI Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Document Details
              </span>
              <h3 className="text-base font-bold text-slate-900 font-mono">
                {selectedDoc.fileName}
              </h3>
            </div>
            <div className="text-right">
              <StatusBadge status={selectedDoc.verificationStatus} />
              <span className="block text-[11px] font-mono text-slate-500 mt-1">
                Confidence: <strong className="text-blue-800">{Math.round(selectedDoc.confidence * 100)}%</strong>
              </span>
            </div>
          </div>

          {/* AI Explanation Callout */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Gemini Document Understanding Note:</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {selectedDoc.aiSummary || 'Document verified against schema. Optical check digit and field completeness confirmed.'}
            </p>
          </div>

          {/* Extracted Key-Value Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Normalized Field Schema
            </h4>

            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
              {Object.entries(selectedDoc.extractedFields).map(([key, val]) => (
                <div key={key} className="flex py-2 px-3 hover:bg-slate-50/50">
                  <span className="w-1/3 font-semibold text-slate-600 capitalize truncate">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="w-2/3 font-mono font-medium text-slate-900 break-words">
                    {String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Raw JSON Output View */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs text-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold font-mono text-emerald-400">
                  Structured JSON Output (Gemini API)
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <pre className="text-xs font-mono bg-slate-950 p-4 rounded-lg overflow-x-auto text-emerald-300 border border-slate-800/80 max-h-[420px] leading-relaxed">
{JSON.stringify(
  {
    documentType: selectedDoc.documentType,
    fileName: selectedDoc.fileName,
    confidence: selectedDoc.confidence,
    extractedFields: selectedDoc.extractedFields,
    aiExplanation: selectedDoc.aiSummary,
    timestamp: selectedDoc.uploadedAt,
  },
  null,
  2
)}
            </pre>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Encoding: UTF-8 Application/JSON</span>
            <span>Schema: GeM PPO 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
