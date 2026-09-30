import React, { useState } from 'react';
import { AuditEvent, Bid } from '../types';
import { History, Search, Download, Filter, ShieldCheck, UserCheck, Cpu, Sparkles } from 'lucide-react';
import { MockVerificationPill } from '../components/StatusBadge';

interface AuditTrailPageProps {
  auditTrail: AuditEvent[];
  bid: Bid | null;
}

export const AuditTrailPage: React.FC<AuditTrailPageProps> = ({ auditTrail, bid }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filteredEvents = auditTrail.filter((evt) => {
    const matchesSearch =
      evt.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.actor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || evt.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Actor', 'Role', 'Action', 'Details', 'RuleId'];
    const rows = filteredEvents.map(e => [
      e.timestamp,
      `"${e.actor}"`,
      e.role,
      `"${e.action}"`,
      `"${e.details.replace(/"/g, '""')}"`,
      e.ruleId || '',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BidShield_Audit_Trail_${bid?.bidNumber || 'DEMO'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActorIcon = (role: string) => {
    if (role === 'OFFICER' || role === 'AUDITOR') {
      return <UserCheck className="w-3.5 h-3.5 text-blue-600" />;
    }
    if (role === 'AI_ASSISTANT') {
      return <Sparkles className="w-3.5 h-3.5 text-indigo-600" />;
    }
    return <Cpu className="w-3.5 h-3.5 text-emerald-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-serif">
              Immutable Procurement Audit Trail
            </h1>
            <MockVerificationPill text="CAG & Vigilance Ready" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically timestamped action history for tender:{' '}
            <strong className="text-slate-800 font-mono">{bid?.bidNumber || 'GEM/2026/B/001245'}</strong>
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm border border-slate-300 rounded px-2.5 py-1 bg-slate-50">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit actions, rules, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-slate-800 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Filter by Actor:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 bg-white font-semibold text-slate-800 focus:outline-blue-600"
          >
            <option value="ALL">All Actors</option>
            <option value="OFFICER">Procurement Officer</option>
            <option value="AI_ASSISTANT">BidShield AI</option>
            <option value="RULE_ENGINE">Rule Engine</option>
            <option value="SERVICE">Internal Services</option>
          </select>
        </div>
      </div>

      {/* Audit Log Chronology */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Chronological Events ({filteredEvents.length})
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Timezone: Indian Standard Time (IST / UTC+5:30)
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-start gap-4">
              <div className="text-[11px] font-mono text-slate-500 shrink-0 w-36 pt-0.5">
                <div>{new Date(evt.timestamp).toLocaleDateString()}</div>
                <div className="text-slate-400">{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
              </div>

              <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                {getActorIcon(evt.role)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {evt.action}
                    </span>
                    {evt.ruleId && (
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold border border-slate-200">
                        {evt.ruleId}
                      </span>
                    )}
                    {evt.statusAfter && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 rounded">
                        &rarr; {evt.statusAfter}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-500 font-medium">
                    {evt.actor} <span className="text-slate-400 font-mono">({evt.role})</span>
                  </span>
                </div>

                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {evt.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
