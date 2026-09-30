import React, { useState } from 'react';
import { Bid, DocumentType } from '../types';
import { FolderKanban, Plus, Calendar, Building, FileText, CheckSquare, ExternalLink } from 'lucide-react';

interface BidsPageProps {
  bids: Bid[];
  selectedBid: Bid | null;
  onSelectBid: (bid: Bid) => void;
  onCreateBid: (bidData: Partial<Bid>) => Promise<void>;
  onNavigateToBidDetail: () => void;
}

export const BidsPage: React.FC<BidsPageProps> = ({
  bids,
  selectedBid,
  onSelectBid,
  onCreateBid,
  onNavigateToBidDetail,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [bidNumber, setBidNumber] = useState(`GEM/2026/B/00${Math.floor(1000 + Math.random() * 9000)}`);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Ministry of Electronics & Information Technology');
  const [category, setCategory] = useState('IT Hardware & Infrastructure');
  const [submissionDeadline, setSubmissionDeadline] = useState('2026-10-31T18:00');
  const [evaluationStartDate, setEvaluationStartDate] = useState('2026-10-01T10:00');
  const [complianceTemplate, setComplianceTemplate] = useState('GeM Standard Technical Compliance Template v2.4');

  const [selectedDocs, setSelectedDocs] = useState<DocumentType[]>([
    'PAN',
    'GST_CERTIFICATE',
    'UDYAM',
    'OEM_AUTHORIZATION',
    'MAKE_IN_INDIA',
    'EPFO',
    'ESIC',
  ]);

  const docOptions: { type: DocumentType; label: string }[] = [
    { type: 'PAN', label: 'Permanent Account Number (PAN)' },
    { type: 'GST_CERTIFICATE', label: 'GST Registration Certificate (Active)' },
    { type: 'UDYAM', label: 'Udyam / MSME Registration Certificate' },
    { type: 'OEM_AUTHORIZATION', label: 'OEM Authorization Letter (MAF)' },
    { type: 'MAKE_IN_INDIA', label: 'Make in India Local Content Declaration' },
    { type: 'EPFO', label: 'EPFO Registration & ECR Payment Challan' },
    { type: 'ESIC', label: 'ESIC Registration & Returns' },
    { type: 'STARTUP_INDIA', label: 'DPIIT Startup India Recognition' },
    { type: 'NSIC', label: 'NSIC Single Point Registration' },
  ];

  const handleToggleDoc = (docType: DocumentType) => {
    setSelectedDocs(prev =>
      prev.includes(docType) ? prev.filter(t => t !== docType) : [...prev, docType]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !bidNumber.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateBid({
        bidNumber,
        title,
        department,
        category,
        submissionDeadline: new Date(submissionDeadline).toISOString(),
        evaluationStartDate: new Date(evaluationStartDate).toISOString(),
        requiredDocuments: selectedDocs,
        complianceTemplate,
      });
      setIsModalOpen(false);
      // Reset form
      setTitle('');
      setBidNumber(`GEM/2026/B/00${Math.floor(1000 + Math.random() * 9000)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-serif">
            GeM Procurement Tenders & Bids
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage procurement bids, mandatory document checklists, and compliance rules.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Tender Notice</span>
        </button>
      </div>

      {/* Bids Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bids.map((b) => {
          const isSelected = selectedBid?.id === b.id;
          return (
            <div
              key={b.id}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {b.bidNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      b.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {b.status.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-2.5 line-clamp-2">
                  {b.title}
                </h3>

                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{b.department}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FolderKanban className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{b.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Deadline: {new Date(b.submissionDeadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                    Required Documents ({b.requiredDocuments.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {b.requiredDocuments.map((doc) => (
                      <span
                        key={doc}
                        className="bg-slate-100 text-slate-700 text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-200"
                      >
                        {doc.replace('_CERTIFICATE', '').replace('_AUTHORIZATION', '')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Bidders: <strong className="text-slate-800">{b.totalBidders}</strong>
                </span>

                <div className="flex items-center gap-2">
                  {isSelected ? (
                    <button
                      onClick={onNavigateToBidDetail}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                    >
                      <span>Open Evaluation</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectBid(b)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
                    >
                      Select Bid
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Bid Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  Create GeM Procurement Tender
                </h3>
                <p className="text-xs text-slate-500">
                  Configure required documents for automated AI compliance verification.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Bid ID / GeM Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={bidNumber}
                    onChange={(e) => setBidNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono text-slate-900 focus:outline-blue-600"
                    placeholder="GEM/2026/B/001245"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Tender Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-blue-600"
                  placeholder="e.g. Enterprise Network Infrastructure Switches"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Department / Ministry Organization *
                </label>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Submission Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={submissionDeadline}
                    onChange={(e) => setSubmissionDeadline(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-blue-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Evaluation Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={evaluationStartDate}
                    onChange={(e) => setEvaluationStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Mandatory Required Documents Checklist
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {docOptions.map(opt => (
                    <label
                      key={opt.type}
                      className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDocs.includes(opt.type)}
                        onChange={() => handleToggleDoc(opt.type)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Compliance Rule Template
                </label>
                <input
                  type="text"
                  value={complianceTemplate}
                  onChange={(e) => setComplianceTemplate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Tender'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
