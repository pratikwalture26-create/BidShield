import React, { useState, useEffect } from 'react';
import {
  Bid,
  Bidder,
  BidDocument,
  ComplianceItem,
  Finding,
  AuditEvent,
  User,
  MockConnectorResult,
  ComplianceStatus,
} from './types';
import { ApiClient } from './services/apiClient';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { BidsPage } from './pages/BidsPage';
import { BidDetailPage } from './pages/BidDetailPage';
import { BidderProfilePage } from './pages/BidderProfilePage';
import { DocumentUploadPage } from './pages/DocumentUploadPage';
import { AIVerificationPage } from './pages/AIVerificationPage';
import { ComplianceMatrixPage } from './pages/ComplianceMatrixPage';
import { FindingsPage } from './pages/FindingsPage';
import { EvidenceViewerPage } from './pages/EvidenceViewerPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { ComplianceReportPage } from './pages/ComplianceReportPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'u-1',
    name: 'R. Sharma (IA&AS)',
    email: 'officer@bidshield.demo',
    role: 'OFFICER',
    roleTitle: 'Chief Procurement Officer',
    department: 'Government e-Marketplace (GeM)',
  });

  const [bids, setBids] = useState<Bid[]>([]);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);

  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [selectedBidder, setSelectedBidder] = useState<Bidder | null>(null);

  const [documents, setDocuments] = useState<BidDocument[]>([]);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>([]);
  const [connectors, setConnectors] = useState<MockConnectorResult[]>([]);

  const [selectedEvidenceItem, setSelectedEvidenceItem] = useState<ComplianceItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, bidsRes, connRes] = await Promise.all([
        ApiClient.getUsers(),
        ApiClient.getBids(),
        ApiClient.getConnectorsStatus(),
      ]);

      setUsers(usersRes.users);
      if (usersRes.users.length > 0) {
        setCurrentUser(usersRes.users[0]);
      }

      setBids(bidsRes.bids);
      setConnectors(connRes.connectors);

      // Default to primary demo bid (GEM/2026/B/001245)
      const primaryBid = bidsRes.bids.find(b => b.bidNumber === 'GEM/2026/B/001245') || bidsRes.bids[0];
      if (primaryBid) {
        setSelectedBid(primaryBid);
        await loadBidDetails(primaryBid.id);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBidDetails = async (bidId: string, preferredBidderId?: string) => {
    try {
      const [bidRes, auditRes] = await Promise.all([
        ApiClient.getBid(bidId),
        ApiClient.getAuditTrail(bidId),
      ]);

      setBidders(bidRes.bidders);
      setAuditTrail(auditRes.auditTrail);

      const targetBidder = preferredBidderId
        ? bidRes.bidders.find(b => b.id === preferredBidderId)
        : (bidRes.bidders.find(b => b.legalName.includes('ABC Technologies')) || bidRes.bidders[0]);

      if (targetBidder) {
        setSelectedBidder(targetBidder);
        await loadBidderDetails(targetBidder.id);
      } else {
        setSelectedBidder(null);
        setDocuments([]);
        setComplianceItems([]);
        setFindings([]);
      }
    } catch (err) {
      console.error('Failed to load bid details:', err);
    }
  };

  const loadBidderDetails = async (bidderId: string) => {
    try {
      const res = await ApiClient.getBidder(bidderId);
      setSelectedBidder(res.bidder);
      setDocuments(res.documents);
      setComplianceItems(res.complianceItems);
      setFindings(res.findings);
    } catch (err) {
      console.error('Failed to load bidder details:', err);
    }
  };

  const handleSelectBid = async (bid: Bid) => {
    setSelectedBid(bid);
    await loadBidDetails(bid.id);
  };

  const handleSelectBidder = async (bidder: Bidder) => {
    setSelectedBidder(bidder);
    await loadBidderDetails(bidder.id);
  };

  const handleLoadDemoBid = async () => {
    setIsLoading(true);
    try {
      const bidsRes = await ApiClient.getBids();
      setBids(bidsRes.bids);
      const demoBid = bidsRes.bids.find(b => b.bidNumber === 'GEM/2026/B/001245') || bidsRes.bids[0];
      if (demoBid) {
        setSelectedBid(demoBid);
        const bidRes = await ApiClient.getBid(demoBid.id);
        setBidders(bidRes.bidders);
        const demoBidder = bidRes.bidders.find(b => b.legalName.includes('ABC Technologies')) || bidRes.bidders[0];
        if (demoBidder) {
          setSelectedBidder(demoBidder);
          await loadBidderDetails(demoBidder.id);
        }
        const auditRes = await ApiClient.getAuditTrail(demoBid.id);
        setAuditTrail(auditRes.auditTrail);
      }
      setActiveTab('dashboard');
      showToast('Loaded Primary Demo Tender: GEM/2026/B/001245 & ABC Technologies Pvt Ltd');
    } catch (err) {
      console.error('Failed to load demo bid:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBid = async (bidData: Partial<Bid>) => {
    const res = await ApiClient.createBid(bidData);
    setBids(prev => [res.bid, ...prev]);
    setSelectedBid(res.bid);
    await loadBidDetails(res.bid.id);
    setActiveTab('bids');
    showToast(`Tender ${res.bid.bidNumber} created successfully.`);
  };

  const handleCreateBidder = async (bidderData: Partial<Bidder>) => {
    if (!selectedBid) return;
    const res = await ApiClient.createBidder(selectedBid.id, bidderData);
    setBidders(prev => [...prev, res.bidder]);
    setSelectedBidder(res.bidder);
    await loadBidderDetails(res.bidder.id);
    showToast(`Bidder ${res.bidder.legalName} added to tender.`);
  };

  const handleUploadDocument = async (data: {
    bidderId: string;
    fileName: string;
    documentType: string;
    fileSize?: string;
    rawTextSnippet?: string;
  }) => {
    if (!selectedBid) return;
    const res = await ApiClient.uploadDocument(selectedBid.id, data);
    setDocuments(prev => [res.document, ...prev]);
    await loadBidderDetails(data.bidderId);
    if (selectedBid) {
      const a = await ApiClient.getAuditTrail(selectedBid.id);
      setAuditTrail(a.auditTrail);
    }
    showToast(`Uploaded and extracted ${res.document.fileName} with Gemini.`);
  };

  const handleAnalyzeDocument = async (docId: string) => {
    const res = await ApiClient.analyzeDocument(docId);
    setDocuments(prev => prev.map(d => (d.id === docId ? res.document : d)));
    if (selectedBidder) {
      await loadBidderDetails(selectedBidder.id);
    }
    showToast(`Document ${res.document.fileName} re-extracted via Gemini.`);
  };

  const handleVerifyNow = async () => {
    if (!selectedBid || !selectedBidder) return;
    setIsVerifying(true);
    try {
      const res = await ApiClient.verifyBid(selectedBid.id, selectedBidder.id);
      setComplianceItems(res.compliance);
      setFindings(res.findings);
      if (res.bidder) {
        setSelectedBidder(res.bidder);
      }
      const auditRes = await ApiClient.getAuditTrail(selectedBid.id);
      setAuditTrail(auditRes.auditTrail);
      showToast('Deterministic compliance rules and risk scoring re-evaluated.');
    } catch (err: any) {
      alert(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOverrideCompliance = async (
    itemId: string,
    newStatus: ComplianceStatus,
    reason: string
  ) => {
    const res = await ApiClient.overrideComplianceItem(itemId, newStatus, reason, currentUser.name);
    setComplianceItems(prev => prev.map(c => (c.id === itemId ? res.item : c)));
    if (selectedBid) {
      const auditRes = await ApiClient.getAuditTrail(selectedBid.id);
      setAuditTrail(auditRes.auditTrail);
    }
    showToast('Officer compliance override recorded in immutable audit log.');
  };

  const handleRecordDecision = async (
    status: 'ACCEPTED' | 'REJECTED' | 'CLARIFICATION_REQUESTED',
    notes: string
  ) => {
    if (!selectedBid || !selectedBidder) return;
    const res = await ApiClient.recordDecision(selectedBid.id, selectedBidder.id, {
      status,
      notes,
      officerName: currentUser.name,
      officerRole: currentUser.roleTitle,
    });
    setSelectedBidder(res.bidder);
    setBidders(prev => prev.map(b => (b.id === res.bidder.id ? res.bidder : b)));
    const auditRes = await ApiClient.getAuditTrail(selectedBid.id);
    setAuditTrail(auditRes.auditTrail);
    showToast(`Decision recorded: ${status}`);
  };

  const handleResetDemo = async () => {
    await ApiClient.resetDemo();
    await loadInitialData();
    showToast('Database reset to default demo scenario.');
  };

  const handleSwitchUser = async (user: User) => {
    setCurrentUser(user);
    showToast(`Switched active view role to ${user.name} (${user.role})`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 font-sans">
      {/* Top Header */}
      <Header
        bids={bids}
        selectedBid={selectedBid}
        onSelectBid={handleSelectBid}
        bidders={bidders}
        selectedBidder={selectedBidder}
        onSelectBidder={handleSelectBidder}
        currentUser={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        onLoadDemoBid={handleLoadDemoBid}
        isLoading={isLoading}
      />

      {/* Main Workspace with Sidebar & Dynamic Page */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentUser={currentUser}
          findingsCount={findings.length}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {/* Toast Alert */}
          {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white border border-blue-500/40 px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              {toastMessage}
            </div>
          )}

          {activeTab === 'dashboard' && (
            <DashboardPage
              bids={bids}
              selectedBid={selectedBid}
              selectedBidder={selectedBidder}
              findings={findings}
              auditTrail={auditTrail}
              onNavigate={setActiveTab}
              onSelectBid={handleSelectBid}
              onSelectBidder={handleSelectBidder}
              onLoadDemo={handleLoadDemoBid}
            />
          )}

          {activeTab === 'bids' && (
            <BidsPage
              bids={bids}
              selectedBid={selectedBid}
              onSelectBid={handleSelectBid}
              onCreateBid={handleCreateBid}
              onNavigateToBidDetail={() => setActiveTab('bidders')}
            />
          )}

          {activeTab === 'bidders' && (
            <BidderProfilePage
              bidder={selectedBidder}
              bidders={bidders}
              bid={selectedBid}
              documents={documents}
              complianceItems={complianceItems}
              onSelectBidder={handleSelectBidder}
              onNavigate={setActiveTab}
              onVerifyNow={handleVerifyNow}
              isVerifying={isVerifying}
            />
          )}

          {activeTab === 'upload' && (
            <DocumentUploadPage
              bidder={selectedBidder}
              documents={documents}
              onUploadDocument={handleUploadDocument}
              onAnalyzeDocument={handleAnalyzeDocument}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'ai-extract' && (
            <AIVerificationPage
              bidder={selectedBidder}
              documents={documents}
              onAnalyzeDocument={handleAnalyzeDocument}
            />
          )}

          {activeTab === 'compliance-matrix' && (
            <ComplianceMatrixPage
              bidder={selectedBidder}
              bid={selectedBid}
              complianceItems={complianceItems}
              onSelectEvidenceItem={(item) => setSelectedEvidenceItem(item)}
              onNavigate={setActiveTab}
              onVerifyNow={handleVerifyNow}
              isVerifying={isVerifying}
            />
          )}

          {activeTab === 'findings' && (
            <FindingsPage
              bidder={selectedBidder}
              findings={findings}
              onInspectEvidence={(f) => {
                const ci = complianceItems.find(c => c.ruleId === f.ruleId);
                if (ci) setSelectedEvidenceItem(ci);
                setActiveTab('evidence');
              }}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'evidence' && (
            <EvidenceViewerPage
              bidder={selectedBidder}
              documents={documents}
              complianceItems={complianceItems}
              findings={findings}
              selectedEvidenceItem={selectedEvidenceItem}
              onOverrideCompliance={handleOverrideCompliance}
            />
          )}

          {activeTab === 'risk' && (
            <RiskAnalysisPage
              bidder={selectedBidder}
              complianceItems={complianceItems}
              findings={findings}
            />
          )}

          {activeTab === 'audit' && (
            <AuditTrailPage
              auditTrail={auditTrail}
              bid={selectedBid}
            />
          )}

          {activeTab === 'report' && (
            <ComplianceReportPage
              bid={selectedBid}
              bidder={selectedBidder}
              documents={documents}
              complianceItems={complianceItems}
              findings={findings}
              auditTrail={auditTrail}
              onRecordDecision={handleRecordDecision}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              connectors={connectors}
              onResetDemo={handleResetDemo}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
