import React from 'react';
import { Bid, Bidder, User } from '../types';
import { Sparkles, Building2, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { BidShieldLogo } from './BidShieldLogo';

interface HeaderProps {
  bids: Bid[];
  selectedBid: Bid | null;
  onSelectBid: (bid: Bid) => void;
  bidders: Bidder[];
  selectedBidder: Bidder | null;
  onSelectBidder: (bidder: Bidder) => void;
  currentUser: User;
  users: User[];
  onSwitchUser: (user: User) => void;
  onLoadDemoBid: () => void;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  bids,
  selectedBid,
  onSelectBid,
  bidders,
  selectedBidder,
  onSelectBidder,
  currentUser,
  users,
  onSwitchUser,
  onLoadDemoBid,
  isLoading = false,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 border-b border-blue-900/40 px-4 py-1 text-xs flex flex-wrap items-center justify-between text-slate-300">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wide">
            PROBLEM STATEMENT 26100
          </span>
          <span className="hidden sm:inline text-slate-300 font-medium">
            Government e-Marketplace (GeM) Verification Support
          </span>
          <span className="text-slate-400 text-[11px] hidden md:inline">
            | Prototype / Mock Verification Architecture
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Officer Decision-Support Mode
          </span>
          <span className="hidden lg:inline text-slate-400">
            AI assists verification; human officer retains final authority.
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <BidShieldLogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white font-serif flex items-center gap-1.5">
                BidShield
              </span>
              <span className="bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                GeM v26100
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-none">
              AI-Powered Integrated Bid Compliance Verification Platform
            </p>
          </div>
        </div>

        {/* Action Controls & Selectors */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Demo Button */}
          <button
            onClick={onLoadDemoBid}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
            title="Load the primary evaluation demo: GEM/2026/B/001245 & ABC Technologies Pvt Ltd"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Bid</span>
          </button>

          {/* Bid Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-md px-2.5 py-1 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              Bid:
            </span>
            <select
              value={selectedBid?.id || ''}
              onChange={(e) => {
                const b = bids.find(item => item.id === e.target.value);
                if (b) onSelectBid(b);
              }}
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer max-w-[190px] truncate"
            >
              {bids.map(b => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                  {b.bidNumber} - {b.title.substring(0, 24)}...
                </option>
              ))}
            </select>
          </div>

          {/* Bidder Selector */}
          {bidders.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-md px-2.5 py-1 text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                Bidder:
              </span>
              <select
                value={selectedBidder?.id || ''}
                onChange={(e) => {
                  const bdr = bidders.find(item => item.id === e.target.value);
                  if (bdr) onSelectBidder(bdr);
                }}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer max-w-[180px] truncate"
              >
                {bidders.map(b => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    {b.legalName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* User Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 rounded-md px-2.5 py-1 text-xs">
            <span className="text-slate-400 text-[11px]">Role:</span>
            <select
              value={currentUser.email}
              onChange={(e) => {
                const u = users.find(user => user.email === e.target.value);
                if (u) onSwitchUser(u);
              }}
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
            >
              {users.map(u => (
                <option key={u.id} value={u.email} className="bg-slate-900 text-white">
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
