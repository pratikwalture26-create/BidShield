import React from 'react';
import { ComplianceStatus } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, Clock, FileQuestion, HelpCircle, ShieldAlert } from 'lucide-react';

interface StatusBadgeProps {
  status: ComplianceStatus | string;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', showIcon = true }) => {
  const norm = (status || '').toUpperCase();

  switch (norm) {
    case 'VERIFIED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 ${className}`}>
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
          VERIFIED
        </span>
      );
    case 'REVIEW_REQUIRED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 ${className}`}>
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
          REVIEW REQUIRED
        </span>
      );
    case 'DISCREPANCY':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-900 border border-rose-300 ${className}`}>
          {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
          DISCREPANCY
        </span>
      );
    case 'DOCUMENT_MISSING':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300 ${className}`}>
          {showIcon && <FileQuestion className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
          DOCUMENT MISSING
        </span>
      );
    case 'EXPIRED':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-orange-50 text-orange-900 border border-orange-300 ${className}`}>
          {showIcon && <Clock className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
          EXPIRED
        </span>
      );
    case 'NOT_APPLICABLE':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300 ${className}`}>
          {showIcon && <HelpCircle className="w-3.5 h-3.5 text-gray-500 shrink-0" />}
          NOT APPLICABLE
        </span>
      );
    case 'PENDING':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 ${className}`}>
          {showIcon && <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
          PENDING
        </span>
      );
  }
};

export const SeverityBadge: React.FC<{ severity: 'CRITICAL' | 'WARNING' | 'INFO' }> = ({ severity }) => {
  if (severity === 'CRITICAL') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
        <ShieldAlert className="w-3 h-3 text-red-700" />
        CRITICAL
      </span>
    );
  }
  if (severity === 'WARNING') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
        <AlertTriangle className="w-3 h-3 text-amber-700" />
        WARNING
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
      INFO
    </span>
  );
};

export const RiskBadge: React.FC<{ level: 'LOW' | 'MEDIUM' | 'HIGH'; score?: number }> = ({ level, score }) => {
  if (level === 'HIGH') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-300">
        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
        HIGH RISK {score !== undefined && `(${score}/100)`}
      </span>
    );
  }
  if (level === 'MEDIUM') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        MEDIUM RISK {score !== undefined && `(${score}/100)`}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
      LOW RISK {score !== undefined && `(${score}/100)`}
    </span>
  );
};

export const MockVerificationPill: React.FC<{ text?: string }> = ({ text = 'Prototype / Mock Verification' }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300 text-[10px] font-mono tracking-tight uppercase">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
      {text}
    </span>
  );
};
