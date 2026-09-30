import React, { useState } from 'react';
import { Bid, Bidder, DocumentType } from '../types';
import { StatusBadge, RiskBadge } from '../components/StatusBadge';
import { NavTab } from '../components/Sidebar';
import {
  FolderKanban,
  Users,
  Calendar,
  Building,
  Plus,
  ArrowRight,
  Sparkles,
  FileCheck2,
  CheckCircle,
} from 'lucide-react';

interface BidDetailPageProps {
  bid: Bid | null;
  bidders: Bidder[];
  selectedBidder: Bidder | null;
  onSelectBidder: (bidder: Bidder) => void;
  onNavigate: (tab: NavTab) => void;
  onCreateBidder: (bidderData: Partial<Bidder>) => Promise<void>;
  onVerifyNow: () => void;
  isVerifying?: boolean;
}

export const BidDetailPage: React.FC<BidDetailPageProps> = ({
  bid,
  bidders,
  selectedBidder,
  onSelectBidder,
  onNavigate,
  onCreateBidder,
  onVerifyNow,
  isVerifying = false,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [pan, setPan] = useState('');
  const [gstin, setGstin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!bid) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-500">
        Please select a bid tender to view details.
      </div>
    );
  }

  const handleCreateBidder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalName || !pan) return;
    setIsSubmitting(true);
    try {
      await onCreateBidder({
        legalName,
        tradeName: tradeName || legalName,
        pan: pan.toUpperCase(),
        gstin,
      });
      setIsAddModalOpen(false);
      setLegalName('');
      setTradeName('');
      setPan('');
      setGstin('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bid Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {bid.bidNumber}
              </span>
              <span className="text-xs text-slate-500">|</span>
              <span className="text-xs font-semibold text-slate-600">{bid.category}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1 font-serif">
              {bid.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onVerifyNow}
              disabled={isVerifying}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isVerifying ? 'Verifying...' : 'Batch Verify All Bidders'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div>
            <span className="text-slate-500 block">Department / Ministry:</span>
            <strong className="text-slate-900">{bid.department}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Submission Deadline:</span>
            <strong className="text-slate-900">{new Date(bid.submissionDeadline).toLocaleString()}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Compliance Template:</span>
            <strong className="text-slate-900">{bid.complianceTemplate}</strong>
          </div>
        </div>
      </div>

      {/* Bidders in this Bid */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Submitted Bidders ({bidders.length})
            </h2>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bidder</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Legal Name</th>
                <th className="py-2.5 px-3">PAN</th>
                <th className="py-2.5 px-3">GSTIN</th>
                <th className="py-2.5 px-3">Entity Match</th>
                <th className="py-2.5 px-3">Prototype Risk</th>
                <th className="py-2.5 px-3">Compliance Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bidders.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => {
                    onSelectBidder(b);
                    onNavigate('bidders');
                  }}
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                    selectedBidder?.id === b.id ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {b.legalName}
                  </td>
                  <td className="py-3 px-3 font-mono font-medium">{b.pan}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{b.gstin || 'N/A'}</td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-900">
                    {b.entityMatchScore}%
                  </td>
                  <td className="py-3 px-3">
                    <RiskBadge level={b.riskLevel} score={b.riskScore} />
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={b.overallStatus} className="text-[10px] px-1.5" />
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBidder(b);
                        onNavigate('bidders');
                      }}
                      className="text-xs font-bold text-blue-700 hover:text-blue-900 underline"
                    >
                      Open Profile &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Bidder Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">Add Bidder to Tender</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-base">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateBidder} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Legal Entity Name *</label>
                <input
                  type="text"
                  required
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="e.g. Bharat Infotech Solutions LLP"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Trade Name</label>
                <input
                  type="text"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  placeholder="e.g. Bharat Infotech"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">PAN Number *</label>
                <input
                  type="text"
                  required
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                  placeholder="AABCB9876K"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono uppercase text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">GSTIN</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="27AABCB9876K1Z9"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono uppercase text-slate-900 focus:outline-blue-600"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded"
                >
                  {isSubmitting ? 'Adding...' : 'Add Bidder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
