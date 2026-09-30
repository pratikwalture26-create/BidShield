import React, { useState } from 'react';
import { BidDocument, Bidder, DocumentType } from '../types';
import { StatusBadge, MockVerificationPill } from '../components/StatusBadge';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RefreshCw,
  PlusCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';

interface DocumentUploadPageProps {
  bidder: Bidder | null;
  documents: BidDocument[];
  onUploadDocument: (data: {
    bidderId: string;
    fileName: string;
    documentType: string;
    fileSize?: string;
    rawTextSnippet?: string;
  }) => Promise<void>;
  onAnalyzeDocument: (docId: string) => Promise<void>;
  onNavigate: (tab: NavTab) => void;
}

export const DocumentUploadPage: React.FC<DocumentUploadPageProps> = ({
  bidder,
  documents,
  onUploadDocument,
  onAnalyzeDocument,
  onNavigate,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>('GST_CERTIFICATE');
  const [customFileName, setCustomFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [analyzingDocId, setAnalyzingDocId] = useState<string | null>(null);

  if (!bidder) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
        Please select a bidder before uploading tender documents.
      </div>
    );
  }

  const handleSimulatedUpload = async (presetType?: DocumentType, presetFileName?: string) => {
    setIsUploading(true);
    try {
      const type = presetType || selectedType;
      const fName = presetFileName || customFileName || `${type}_Verification_Doc.pdf`;
      await onUploadDocument({
        bidderId: bidder.id,
        fileName: fName,
        documentType: type,
        fileSize: `${Math.floor(250 + Math.random() * 600)} KB`,
        rawTextSnippet: `Simulated OCR content for ${type} of ${bidder.legalName}. Issue date: 2026.`,
      });
      setCustomFileName('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReAnalyze = async (docId: string) => {
    setAnalyzingDocId(docId);
    try {
      await onAnalyzeDocument(docId);
    } finally {
      setAnalyzingDocId(null);
    }
  };

  const samplePresets: { label: string; type: DocumentType; file: string }[] = [
    { label: '+ Add Supplementary GST REG-06', type: 'GST_CERTIFICATE', file: 'Supplementary_GST_Return.pdf' },
    { label: '+ Add ISO 9001 Quality Certificate', type: 'OTHER', file: 'ISO_9001_Quality_System.pdf' },
    { label: '+ Add NSIC Single Point Exemption', type: 'NSIC', file: 'NSIC_Exemption_Registration.pdf' },
    { label: '+ Add DPIIT Startup Certificate', type: 'STARTUP_INDIA', file: 'DPIIT_Startup_Hub_Certificate.pdf' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Tender Document Upload & OCR Ingestion
            </h1>
            <MockVerificationPill text="AI Vision & Document Extraction" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Bidder: <strong className="text-slate-800">{bidder.legalName}</strong> (PAN: {bidder.pan})
          </p>
        </div>

        <button
          onClick={() => onNavigate('compliance-matrix')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs"
        >
          <span>Proceed to Compliance Matrix</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Upload Zone & Document Classification Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              const file = e.dataTransfer.files[0];
              handleSimulatedUpload(selectedType, file.name);
            }
          }}
          className={`lg:col-span-2 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all bg-white ${
            dragActive
              ? 'border-blue-600 bg-blue-50/50'
              : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>

          <h3 className="text-sm font-bold text-slate-900">
            Drag & Drop Bidder Eligibility Documents Here
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Supported formats: PDF, PNG, JPG, JPEG (Max file size: 25MB per document).
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs">
              <span className="text-slate-500 font-semibold">Classify as:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="GST_CERTIFICATE">GST Certificate (Active)</option>
                <option value="PAN">PAN Card</option>
                <option value="UDYAM">Udyam MSME Certificate</option>
                <option value="OEM_AUTHORIZATION">OEM Authorization Letter (MAF)</option>
                <option value="MAKE_IN_INDIA">Make in India Declaration</option>
                <option value="EPFO">EPFO Challan Receipt</option>
                <option value="ESIC">ESIC Challan Receipt</option>
                <option value="STARTUP_INDIA">Startup India Certificate</option>
                <option value="NSIC">NSIC Certificate</option>
                <option value="INCOME_TAX">Income Tax ITR Verification</option>
                <option value="OTHER">Other Technical Document</option>
              </select>
            </div>

            <button
              onClick={() => handleSimulatedUpload()}
              disabled={isUploading}
              className="px-4 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Analyzing via Gemini...' : 'Upload & Extract Document'}</span>
            </button>
          </div>
        </div>

        {/* Quick Presets / Test Injection Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-blue-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Quick Test Ingestion
            </h3>
          </div>
          <p className="text-[11px] text-slate-500">
            Click any sample document below to immediately trigger automated Gemini parsing and compliance checks for this bidder:
          </p>

          <div className="space-y-2 pt-1">
            {samplePresets.map((preset) => (
              <button
                key={preset.file}
                onClick={() => handleSimulatedUpload(preset.type, preset.file)}
                disabled={isUploading}
                className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 text-xs transition-all disabled:opacity-50"
              >
                <div className="font-semibold text-slate-800">{preset.label}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{preset.file}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Uploaded Tender Documents ({documents.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {documents.filter(d => d.processingStatus === 'AI_ANALYZED').length} AI Analyzed
          </span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">File Name</th>
                <th className="py-2.5 px-3">Document Type</th>
                <th className="py-2.5 px-3">Upload Status</th>
                <th className="py-2.5 px-3">Processing</th>
                <th className="py-2.5 px-3">Verification</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => {
                const isAnalyzing = analyzingDocId === doc.id;
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 font-mono">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{doc.fileName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      {doc.documentType}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        SUCCESS
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.2 rounded border border-indigo-200">
                        {doc.processingStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={doc.verificationStatus} className="text-[10px] px-1.5" />
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-900">
                      {Math.round(doc.confidence * 100)}%
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {new Date(doc.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      <button
                        onClick={() => handleReAnalyze(doc.id)}
                        disabled={isAnalyzing}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                        <span>{isAnalyzing ? 'Extracting...' : 'Re-Extract'}</span>
                      </button>
                      <button
                        onClick={() => onNavigate('evidence')}
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline"
                      >
                        Evidence &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
