import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  UploadCloud,
  FileCheck2,
  TableProperties,
  AlertOctagon,
  Eye,
  Activity,
  History,
  FileText,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { User } from '../types';
import { BidShieldLogo } from './BidShieldLogo';

export type NavTab =
  | 'dashboard'
  | 'bids'
  | 'bidders'
  | 'upload'
  | 'ai-extract'
  | 'compliance-matrix'
  | 'findings'
  | 'evidence'
  | 'risk'
  | 'audit'
  | 'report'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser: User;
  findingsCount?: number;
  unresolvedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  findingsCount = 0,
  unresolvedCount = 0,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bids', label: 'Bids & Tenders', icon: FolderKanban },
    { id: 'bidders', label: 'Bidder Profiles', icon: Users },
    { id: 'upload', label: 'Document Upload', icon: UploadCloud },
    { id: 'ai-extract', label: 'AI Document Analysis', icon: FileCheck2 },
    { id: 'compliance-matrix', label: 'Compliance Matrix', icon: TableProperties },
    {
      id: 'findings',
      label: 'Findings & Discrepancies',
      icon: AlertOctagon,
      badge: findingsCount,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'evidence', label: 'Evidence Viewer', icon: Eye },
    { id: 'risk', label: 'Prototype Risk Analysis', icon: Activity },
    { id: 'audit', label: 'Audit Trail', icon: History },
    { id: 'report', label: 'Compliance Report', icon: FileText },
    { id: 'settings', label: 'Settings & Connectors', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 select-none">
      {/* Platform Value Proposition Tagline */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center gap-2.5">
        <BidShieldLogo size="sm" />
        <div>
          <div className="text-xs font-bold text-white tracking-tight flex items-center gap-1 font-serif">
            BidShield Platform
          </div>
          <p className="text-[10px] text-slate-400 font-medium italic leading-tight mt-0.5">
            &ldquo;Verify once. Decide with confidence.&rdquo;
          </p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Verification Workflow
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    item.badgeColor || 'bg-blue-500 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/80">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-300 font-bold text-xs shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white truncate">
                {currentUser.name}
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-mono px-1 rounded">
                {currentUser.role}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {currentUser.roleTitle}
            </p>
            <p className="text-[9px] text-slate-500 truncate mt-0.5">
              {currentUser.department}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
