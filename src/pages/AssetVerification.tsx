import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { assetService, Asset } from '@/lib/assets';
import { authService } from '@/lib/auth';
import { auditService } from '@/lib/audit';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Search, X, AlertTriangle, Eye, Trash2, Pause, Play, Plus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// Import new components
import VerificationSessionManager from '@/components/verification/VerificationSessionManager';
import QRScanVerification from '@/components/verification/QRScanVerification';
import DisposalQueue from '@/components/verification/DisposalQueue';
import AssetDetails from '@/components/qr/AssetDetails';

interface VerificationSession {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'paused';
  totalAssets: number;
  verifiedAssets: number;
  disposedAssets: number;
  createdBy: string;
  createdAt: string;
  departments?: string[];
  companies?: string[];
  categories?: string[];
}

interface AssetVerificationRecord {
  assetId: string;
  sessionId: string;
  status: 'verified' | 'not_verified' | 'disposed' | 'escalated';
  verifiedBy?: string;
  verifiedAt?: string;
  remarks?: string;
  attachments?: string[];
  location?: string;
}

interface DisposalQueueItem {
  assetId: string;
  sessionId: string;
  reason: string;
  suggestedMethod: 'sale' | 'writeoff' | 'transfer' | 'scrap';
  addedBy: string;
  addedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  finalDisposalMethod?: string;
}

const AssetVerification = () => {
  const [assets, setAssets] = useState<Asset[]>(assetService.getAllAssets());
  const [sessions, setSessions] = useState<VerificationSession[]>([]);
  const [activeSession, setActiveSession] = useState<VerificationSession | null>(null);
  const [verificationRecords, setVerificationRecords] = useState<AssetVerificationRecord[]>([]);
  const [disposalQueue, setDisposalQueue] = useState<DisposalQueueItem[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showAssetDetailDialog, setShowAssetDetailDialog] = useState(false);
  const [selectedAssetForVerification, setSelectedAssetForVerification] = useState<Asset | null>(null);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null);
  const [verificationRemarks, setVerificationRemarks] = useState('');
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionFilters, setNewSessionFilters] = useState({
    departments: [] as string[],
    companies: [] as string[],
    categories: [] as string[]
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load data from localStorage
  useEffect(() => {
    const storedSessions = localStorage.getItem('verification-sessions');
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    }

    const storedRecords = localStorage.getItem('verification-records');
    if (storedRecords) {
      setVerificationRecords(JSON.parse(storedRecords));
    }

    const storedDisposalQueue = localStorage.getItem('disposal-queue');
    if (storedDisposalQueue) {
      setDisposalQueue(JSON.parse(storedDisposalQueue));
    }

    const storedActiveSession = localStorage.getItem('active-verification-session');
    if (storedActiveSession) {
      const sessionId = JSON.parse(storedActiveSession);
      const session = sessions.find(s => s.id === sessionId);
      if (session) setActiveSession(session);
    }
  }, []);

  // Save data to localStorage and update session progress
  const saveSessions = (data: VerificationSession[]) => {
    localStorage.setItem('verification-sessions', JSON.stringify(data));
    setSessions(data);
  };

  const saveVerificationRecords = (data: AssetVerificationRecord[]) => {
    localStorage.setItem('verification-records', JSON.stringify(data));
    setVerificationRecords(data);
    updateSessionProgress(data);
  };

  const saveDisposalQueue = (data: DisposalQueueItem[]) => {
    localStorage.setItem('disposal-queue', JSON.stringify(data));
    setDisposalQueue(data);
  };

  // Update session progress instantly
  const updateSessionProgress = (records: AssetVerificationRecord[]) => {
    if (!activeSession) return;

    const sessionRecords = records.filter(r => r.sessionId === activeSession.id);
    const verifiedCount = sessionRecords.filter(r => r.status === 'verified').length;
    const disposedCount = sessionRecords.filter(r => r.status === 'disposed').length;

    const updatedSession = {
      ...activeSession,
      verifiedAssets: verifiedCount,
      disposedAssets: disposedCount
    };

    const updatedSessions = sessions.map(s => 
      s.id === activeSession.id ? updatedSession : s
    );
    
    saveSessions(updatedSessions);
    setActiveSession(updatedSession);
  };

  // Filter assets based on session and user filters
  const getSessionAssets = () => {
    if (!activeSession) return assets;

    return assets.filter(asset => {
      // Filter by session criteria
      if (activeSession.departments && activeSession.departments.length > 0) {
        if (!activeSession.departments.includes(asset.department)) return false;
      }
      if (activeSession.companies && activeSession.companies.length > 0) {
        if (!activeSession.companies.includes(asset.company)) return false;
      }
      if (activeSession.categories && activeSession.categories.length > 0) {
        if (!activeSession.categories.includes(asset.category)) return false;
      }
      return true;
    });
  };

  const sessionAssets = getSessionAssets();

  const filteredAssets = sessionAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'all' && activeSession) {
      const record = verificationRecords.find(r => r.assetId === asset.id && r.sessionId === activeSession.id);
      if (statusFilter === 'verified') matchesStatus = !!record && record.status === 'verified';
      else if (statusFilter === 'not_verified') matchesStatus = !record || record.status === 'not_verified';
      else if (statusFilter === 'disposed') matchesStatus = !!record && record.status === 'disposed';
      else if (statusFilter === 'escalated') matchesStatus = !!record && record.status === 'escalated';
    }
    
    const matchesDepartment = departmentFilter === 'all' || asset.department === departmentFilter;
    const matchesLocation = locationFilter === 'all' || asset.location === locationFilter;
    const matchesCompany = companyFilter === 'all' || asset.company === companyFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesLocation && matchesCompany;
  });

  const departments = [...new Set(assets.map(asset => asset.department))].filter(dept => dept && dept.trim() !== '');
  const locations = [...new Set(assets.map(asset => asset.location))].filter(loc => loc && loc.trim() !== '');
  const companies = [...new Set(assets.map(asset => asset.company))].filter(comp => comp && comp.trim() !== '');
  const categories = [...new Set(assets.map(asset => asset.category))].filter(cat => cat && cat.trim() !== '');

  // Session Management with filters
  const createNewSession = (name: string) => {
    const sessionAssetCount = assets.filter(asset => {
      if (newSessionFilters.departments.length > 0 && !newSessionFilters.departments.includes(asset.department)) return false;
      if (newSessionFilters.companies.length > 0 && !newSessionFilters.companies.includes(asset.company)) return false;
      if (newSessionFilters.categories.length > 0 && !newSessionFilters.categories.includes(asset.category)) return false;
      return true;
    }).length;

    const newSession: VerificationSession = {
      id: Date.now().toString(),
      name,
      startDate: new Date().toISOString(),
      status: 'active',
      totalAssets: sessionAssetCount,
      verifiedAssets: 0,
      disposedAssets: 0,
      createdBy: authService.getCurrentUser()?.name || 'System',
      createdAt: new Date().toISOString(),
      departments: newSessionFilters.departments.length > 0 ? newSessionFilters.departments : undefined,
      companies: newSessionFilters.companies.length > 0 ? newSessionFilters.companies : undefined,
      categories: newSessionFilters.categories.length > 0 ? newSessionFilters.categories : undefined
    };

    const updatedSessions = [...sessions, newSession];
    saveSessions(updatedSessions);
    setActiveSession(newSession);
    localStorage.setItem('active-verification-session', JSON.stringify(newSession.id));
    
    // Reset filters
    setNewSessionFilters({ departments: [], companies: [], categories: [] });
    
    auditService.log('Verification Session Created', 'session', newSession.id, { sessionName: name });
    
    toast({
      title: 'Session Created',
      description: `Verification session "${name}" has been started with ${sessionAssetCount} assets.`,
    });
  };

  const handleSetActiveSession = (session: VerificationSession) => {
    setActiveSession(session);
    localStorage.setItem('active-verification-session', JSON.stringify(session.id));
  };

  const pauseSession = () => {
    if (!activeSession) return;
    
    const updatedSession = { ...activeSession, status: 'paused' as const };
    const updatedSessions = sessions.map(s => s.id === activeSession.id ? updatedSession : s);
    saveSessions(updatedSessions);
    setActiveSession(updatedSession);
    
    auditService.log('Verification Session Paused', 'session', activeSession.id, {});
    
    toast({
      title: 'Session Paused',
      description: 'Verification session has been paused.',
    });
  };

  const resumeSession = () => {
    if (!activeSession) return;
    
    const updatedSession = { ...activeSession, status: 'active' as const };
    const updatedSessions = sessions.map(s => s.id === activeSession.id ? updatedSession : s);
    saveSessions(updatedSessions);
    setActiveSession(updatedSession);
    
    auditService.log('Verification Session Resumed', 'session', activeSession.id, {});
    
    toast({
      title: 'Session Resumed',
      description: 'Verification session has been resumed.',
    });
  };

  const completeSession = () => {
    if (!activeSession) return;
    
    const verifiedCount = verificationRecords.filter(r => r.sessionId === activeSession.id && r.status === 'verified').length;
    const disposedCount = verificationRecords.filter(r => r.sessionId === activeSession.id && r.status === 'disposed').length;
    
    const updatedSession = { 
      ...activeSession, 
      status: 'completed' as const,
      endDate: new Date().toISOString(),
      verifiedAssets: verifiedCount,
      disposedAssets: disposedCount
    };
    
    const updatedSessions = sessions.map(s => s.id === activeSession.id ? updatedSession : s);
    saveSessions(updatedSessions);
    setActiveSession(null);
    localStorage.removeItem('active-verification-session');
    
    auditService.log('Verification Session Completed', 'session', activeSession.id, {
      totalAssets: activeSession.totalAssets,
      verifiedAssets: verifiedCount,
      disposedAssets: disposedCount
    });
    
    toast({
      title: 'Session Completed',
      description: `Verification session completed. ${verifiedCount} assets verified, ${disposedCount} disposed.`,
    });
  };

  // Bulk selection functions
  const handleSelectAsset = (assetId: string, checked: boolean) => {
    if (checked) {
      setSelectedAssets([...selectedAssets, assetId]);
    } else {
      setSelectedAssets(selectedAssets.filter(id => id !== assetId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssets(filteredAssets.map(asset => asset.id));
    } else {
      setSelectedAssets([]);
    }
  };

  // Bulk verification function
  const bulkVerifyAssets = () => {
    if (!activeSession || selectedAssets.length === 0) return;

    selectedAssets.forEach(assetId => {
      verifyAsset(assetId, 'Bulk verification');
    });

    setSelectedAssets([]);
    toast({
      title: 'Bulk Verification Complete',
      description: `${selectedAssets.length} assets have been verified.`,
    });
  };

  // Bulk disposal function
  const bulkDisposeAssets = () => {
    if (!activeSession || selectedAssets.length === 0) return;

    selectedAssets.forEach(assetId => {
      markAssetAsDisposed(assetId, 'Bulk disposal', 'writeoff');
    });

    setSelectedAssets([]);
    toast({
      title: 'Bulk Disposal Complete',
      description: `${selectedAssets.length} assets have been marked for disposal.`,
    });
  };

  // Bulk escalation function
  const bulkEscalateAssets = () => {
    if (!activeSession || selectedAssets.length === 0) return;

    selectedAssets.forEach(assetId => {
      escalateAsset(assetId, 'Bulk escalation - requires review');
    });

    setSelectedAssets([]);
    toast({
      title: 'Bulk Escalation Complete',
      description: `${selectedAssets.length} assets have been escalated.`,
    });
  };

  const escalateAsset = (assetId: string, remarks: string = '') => {
    if (!activeSession) return;

    const record: AssetVerificationRecord = {
      assetId,
      sessionId: activeSession.id,
      status: 'escalated',
      verifiedBy: authService.getCurrentUser()?.name || 'System',
      verifiedAt: new Date().toISOString(),
      remarks: `Escalated: ${remarks}`
    };

    const updatedRecords = [...verificationRecords, record];
    saveVerificationRecords(updatedRecords);

    const asset = assets.find(a => a.id === assetId);
    auditService.log('Asset Escalated', 'asset', assetId, {
      sessionId: activeSession.id,
      assetName: asset?.name,
      remarks
    });
  };

  // Asset Verification
  const verifyAsset = (assetId: string, remarks: string = '', attachments: string[] = []) => {
    if (!activeSession) {
      toast({
        title: 'Error',
        description: 'No active verification session.',
        variant: 'destructive',
      });
      return;
    }

    const existingRecord = verificationRecords.find(r => r.assetId === assetId && r.sessionId === activeSession.id);
    const newRecord: AssetVerificationRecord = {
      assetId,
      sessionId: activeSession.id,
      status: 'verified',
      verifiedBy: authService.getCurrentUser()?.name || 'System',
      verifiedAt: new Date().toISOString(),
      remarks,
      attachments
    };

    let updatedRecords;
    if (existingRecord) {
      updatedRecords = verificationRecords.map(r => 
        r.assetId === assetId && r.sessionId === activeSession.id ? newRecord : r
      );
    } else {
      updatedRecords = [...verificationRecords, newRecord];
    }

    saveVerificationRecords(updatedRecords);
    
    const asset = assets.find(a => a.id === assetId);
    auditService.log('Asset Verified', 'asset', assetId, { 
      sessionId: activeSession.id,
      assetName: asset?.name,
      remarks 
    });
  };

  const markAssetAsDisposed = (assetId: string, reason: string, suggestedMethod: 'sale' | 'writeoff' | 'transfer' | 'scrap') => {
    if (!activeSession) return;

    const disposalItem: DisposalQueueItem = {
      assetId,
      sessionId: activeSession.id,
      reason,
      suggestedMethod,
      addedBy: authService.getCurrentUser()?.name || 'System',
      addedAt: new Date().toISOString(),
      status: 'pending'
    };

    const updatedQueue = [...disposalQueue, disposalItem];
    saveDisposalQueue(updatedQueue);

    const record: AssetVerificationRecord = {
      assetId,
      sessionId: activeSession.id,
      status: 'disposed',
      verifiedBy: authService.getCurrentUser()?.name || 'System',
      verifiedAt: new Date().toISOString(),
      remarks: `Marked for disposal: ${reason}`
    };

    const updatedRecords = [...verificationRecords, record];
    saveVerificationRecords(updatedRecords);

    const asset = assets.find(a => a.id === assetId);
    auditService.log('Asset Marked for Disposal', 'asset', assetId, {
      sessionId: activeSession.id,
      assetName: asset?.name,
      reason,
      suggestedMethod
    });
  };

  // QR Scan Verification
  const handleQRAssetFound = (asset: Asset) => {
    setSelectedAssetForVerification(asset);
    setShowVerificationDialog(true);
  };

  const handleDisposalStatusUpdate = (item: DisposalQueueItem, status: 'approved' | 'rejected') => {
    const updatedQueue = disposalQueue.map(qi => 
      qi === item ? { 
        ...qi, 
        status,
        reviewedBy: authService.getCurrentUser()?.name || 'System',
        reviewedAt: new Date().toISOString()
      } : qi
    );
    saveDisposalQueue(updatedQueue);
  };

  const getVerificationStatus = (asset: Asset) => {
    if (!activeSession) return { status: 'not_verified', label: 'Not Verified', color: 'bg-gray-500' };
    
    const record = verificationRecords.find(r => r.assetId === asset.id && r.sessionId === activeSession.id);
    if (!record) return { status: 'not_verified', label: 'Not Verified', color: 'bg-gray-500' };
    
    switch (record.status) {
      case 'verified':
        return { status: 'verified', label: 'Verified', color: 'bg-green-500' };
      case 'disposed':
        return { status: 'disposed', label: 'Disposed', color: 'bg-red-500' };
      case 'escalated':
        return { status: 'escalated', label: 'Escalated', color: 'bg-orange-500' };
      default:
        return { status: 'not_verified', label: 'Not Verified', color: 'bg-gray-500' };
    }
  };

  const getSessionStats = () => {
    if (!activeSession) return { verified: 0, notVerified: 0, disposed: 0, escalated: 0 };
    
    const sessionRecords = verificationRecords.filter(r => r.sessionId === activeSession.id);
    return {
      verified: sessionRecords.filter(r => r.status === 'verified').length,
      notVerified: activeSession.totalAssets - sessionRecords.length,
      disposed: sessionRecords.filter(r => r.status === 'disposed').length,
      escalated: sessionRecords.filter(r => r.status === 'escalated').length
    };
  };

  const stats = getSessionStats();

  // Add function to view session details/report
  const viewSessionDetails = (session: VerificationSession) => {
    const sessionRecords = verificationRecords.filter(r => r.sessionId === session.id);
    const sessionAssets = assets.filter(asset => {
      if (session.departments && session.departments.length > 0) {
        if (!session.departments.includes(asset.department)) return false;
      }
      if (session.companies && session.companies.length > 0) {
        if (!session.companies.includes(asset.company)) return false;
      }
      if (session.categories && session.categories.length > 0) {
        if (!session.categories.includes(asset.category)) return false;
      }
      return true;
    });

    // Create a simple alert for now - this could be enhanced to a proper modal
    const verified = sessionRecords.filter(r => r.status === 'verified').length;
    const disposed = sessionRecords.filter(r => r.status === 'disposed').length;
    const escalated = sessionRecords.filter(r => r.status === 'escalated').length;
    const notVerified = sessionAssets.length - sessionRecords.length;

    alert(`Session Details for "${session.name}":
    
Total Assets: ${sessionAssets.length}
Verified: ${verified}
Disposed: ${disposed}
Escalated: ${escalated}
Not Verified: ${notVerified}

Session created by: ${session.createdBy}
Created on: ${format(new Date(session.createdAt), 'dd/MM/yyyy HH:mm')}
${session.endDate ? `Completed on: ${format(new Date(session.endDate), 'dd/MM/yyyy HH:mm')}` : ''}`);
  };

  // Modified function to handle asset detail viewing
  const handleViewAssetDetails = (asset: Asset) => {
    // Instead of navigating away, show asset details in a dialog
    setSelectedAssetForDetail(asset);
    setShowAssetDetailDialog(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Asset Verification</h1>
          <p className="text-gray-400">Complete verification management with sessions and QR scanning</p>
        </div>
        <QRScanVerification 
          assets={assets} 
          onAssetFound={handleQRAssetFound}
        />
      </div>

      {/* Active Session Info */}
      {activeSession && (
        <Card className="bg-black/60 border-green-500/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white">Active Session: {activeSession.name}</CardTitle>
                <CardDescription className="text-gray-400">
                  Started: {format(new Date(activeSession.startDate), 'dd/MM/yyyy HH:mm')} • Status: {activeSession.status}
                  {(activeSession.departments || activeSession.companies || activeSession.categories) && (
                    <div className="mt-2 text-sm">
                      Filters: {activeSession.departments?.join(', ')} {activeSession.companies?.join(', ')} {activeSession.categories?.join(', ')}
                    </div>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {activeSession.status === 'active' && (
                  <Button onClick={pauseSession} variant="outline" size="sm">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
                {activeSession.status === 'paused' && (
                  <Button onClick={resumeSession} variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                )}
                <Button onClick={completeSession} className="bg-red-500 hover:bg-red-600" size="sm">
                  Complete Session
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-black/60 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-400">Verified</p>
                <p className="text-xl font-bold text-white">{stats.verified}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-black/60 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <X className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-400">Not Verified</p>
                <p className="text-xl font-bold text-white">{stats.notVerified}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-black/60 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-400">Disposed</p>
                <p className="text-xl font-bold text-white">{stats.disposed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-black/60 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-400">Escalated</p>
                <p className="text-xl font-bold text-white">{stats.escalated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="verification" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/60">
          <TabsTrigger value="verification" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            Asset Verification
          </TabsTrigger>
          <TabsTrigger value="sessions" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            Sessions
          </TabsTrigger>
          <TabsTrigger value="disposal" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            Disposal Queue
          </TabsTrigger>
          <TabsTrigger value="escalated" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            Escalated Assets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="space-y-4">
          {/* Filters */}
          <Card className="bg-black/60 border-green-500/20">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-green-500/30">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="not_verified">Not Verified</SelectItem>
                    <SelectItem value="disposed">Disposed</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-green-500/30">
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-green-500/30">
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(loc => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Company" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-green-500/30">
                    <SelectItem value="all">All Companies</SelectItem>
                    {companies.map(comp => (
                      <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDepartmentFilter('all');
                    setLocationFilter('all');
                    setCompanyFilter('all');
                  }}
                  variant="outline"
                  className="border-gray-600 text-gray-400 hover:bg-gray-800"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedAssets.length > 0 && (
            <Card className="bg-black/60 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    {selectedAssets.length} asset(s) selected
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={bulkVerifyAssets}
                      disabled={!activeSession || activeSession.status !== 'active'}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-black"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Selected
                    </Button>
                    <Button
                      onClick={bulkDisposeAssets}
                      disabled={!activeSession || activeSession.status !== 'active'}
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Dispose Selected
                    </Button>
                    <Button
                      onClick={bulkEscalateAssets}
                      disabled={!activeSession || activeSession.status !== 'active'}
                      size="sm"
                      variant="outline"
                      className="border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Escalate Selected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assets Table */}
          <Card className="bg-black/60 border-green-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Assets for Verification ({filteredAssets.length})</CardTitle>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={filteredAssets.length > 0 && selectedAssets.length === filteredAssets.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-white text-sm">Select All</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-600">
                      <TableHead className="text-gray-300">Select</TableHead>
                      <TableHead className="text-gray-300">Asset</TableHead>
                      <TableHead className="text-gray-300">Department</TableHead>
                      <TableHead className="text-gray-300">Location</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Verification Status</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.map((asset) => {
                      const verificationStatus = getVerificationStatus(asset);
                      const isSelected = selectedAssets.includes(asset.id);
                      return (
                        <TableRow key={asset.id} className="border-gray-600 hover:bg-gray-800/30">
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleSelectAsset(asset.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-white">{asset.name}</p>
                              <p className="text-sm text-gray-400">{asset.type}</p>
                              {asset.serialNumber && (
                                <p className="text-xs text-gray-500">{asset.serialNumber}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-white">{asset.department}</TableCell>
                          <TableCell className="text-white">{asset.location}</TableCell>
                          <TableCell>
                            <Badge className={`${asset.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                              {asset.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${verificationStatus.color}/20 text-white`}>
                              {verificationStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedAssetForVerification(asset);
                                  setShowVerificationDialog(true);
                                }}
                                className="text-green-500 hover:bg-green-500/20"
                                disabled={!activeSession || activeSession.status !== 'active'}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewAssetDetails(asset)}
                                className="text-blue-500 hover:bg-blue-500/20"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          {/* Create New Session */}
          <div className="flex justify-end">
            <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-600 text-black">
                  <Plus className="w-4 h-4 mr-2" />
                  New Session
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/90 border-green-500/30 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">Create Verification Session</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Start a new asset verification session with optional filters
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Session Name (e.g., Annual 2025, Q2 Ad-hoc)"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-white text-sm font-medium">Departments (Optional)</label>
                      <Select value="" onValueChange={(value) => {
                        if (value && !newSessionFilters.departments.includes(value)) {
                          setNewSessionFilters(prev => ({
                            ...prev,
                            departments: [...prev.departments, value]
                          }));
                        }
                      }}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Add Department" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-green-500/30">
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {newSessionFilters.departments.map(dept => (
                          <Badge key={dept} className="bg-blue-500/20 text-blue-300">
                            {dept}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1"
                              onClick={() => setNewSessionFilters(prev => ({
                                ...prev,
                                departments: prev.departments.filter(d => d !== dept)
                              }))}
                            >
                              ×
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-white text-sm font-medium">Companies (Optional)</label>
                      <Select value="" onValueChange={(value) => {
                        if (value && !newSessionFilters.companies.includes(value)) {
                          setNewSessionFilters(prev => ({
                            ...prev,
                            companies: [...prev.companies, value]
                          }));
                        }
                      }}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Add Company" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-green-500/30">
                          {companies.map(comp => (
                            <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {newSessionFilters.companies.map(comp => (
                          <Badge key={comp} className="bg-purple-500/20 text-purple-300">
                            {comp}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1"
                              onClick={() => setNewSessionFilters(prev => ({
                                ...prev,
                                companies: prev.companies.filter(c => c !== comp)
                              }))}
                            >
                              ×
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-white text-sm font-medium">Categories (Optional)</label>
                      <Select value="" onValueChange={(value) => {
                        if (value && !newSessionFilters.categories.includes(value)) {
                          setNewSessionFilters(prev => ({
                            ...prev,
                            categories: [...prev.categories, value]
                          }));
                        }
                      }}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Add Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-black/90 border-green-500/30">
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {newSessionFilters.categories.map(cat => (
                          <Badge key={cat} className="bg-green-500/20 text-green-300">
                            {cat}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1"
                              onClick={() => setNewSessionFilters(prev => ({
                                ...prev,
                                categories: prev.categories.filter(c => c !== cat)
                              }))}
                            >
                              ×
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      createNewSession(newSessionName);
                      setShowNewSessionDialog(false);
                      setNewSessionName('');
                    }} 
                    className="w-full bg-green-500 hover:bg-green-600 text-black"
                    disabled={!newSessionName.trim()}
                  >
                    Create Session
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <VerificationSessionManager
            sessions={sessions}
            activeSession={activeSession}
            onCreateSession={createNewSession}
            onSetActiveSession={handleSetActiveSession}
            onPauseSession={pauseSession}
            onResumeSession={resumeSession}
            onCompleteSession={completeSession}
            verificationRecords={verificationRecords}
            assets={assets}
          />
        </TabsContent>

        <TabsContent value="disposal" className="space-y-4">
          <DisposalQueue
            disposalQueue={disposalQueue}
            assets={assets}
            onUpdateDisposalStatus={handleDisposalStatusUpdate}
          />
        </TabsContent>

        <TabsContent value="escalated" className="space-y-4">
          <Card className="bg-black/60 border-green-500/20">
            <CardHeader>
              <CardTitle className="text-white">Escalated Assets</CardTitle>
              <CardDescription className="text-gray-400">
                Assets that require special attention or review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-600">
                      <TableHead className="text-gray-300">Asset</TableHead>
                      <TableHead className="text-gray-300">Session</TableHead>
                      <TableHead className="text-gray-300">Escalated By</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Remarks</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {verificationRecords
                      .filter(record => record.status === 'escalated')
                      .map((record) => {
                        const asset = assets.find(a => a.id === record.assetId);
                        const session = sessions.find(s => s.id === record.sessionId);
                        if (!asset) return null;
                        
                        return (
                          <TableRow key={`${record.assetId}-${record.sessionId}`} className="border-gray-600 hover:bg-gray-800/30">
                            <TableCell>
                              <div>
                                <p className="font-medium text-white">{asset.name}</p>
                                <p className="text-sm text-gray-400">{asset.type}</p>
                                <p className="text-xs text-gray-500">{asset.department}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-white">{session?.name || 'Unknown'}</TableCell>
                            <TableCell className="text-white">{record.verifiedBy}</TableCell>
                            <TableCell className="text-white">
                              {record.verifiedAt ? format(new Date(record.verifiedAt), 'dd/MM/yyyy HH:mm') : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-gray-300 max-w-xs truncate">{record.remarks}</p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewAssetDetails(asset)}
                                  className="text-blue-500 hover:bg-blue-500/20"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAssetForVerification(asset);
                                    setShowVerificationDialog(true);
                                  }}
                                  className="text-green-500 hover:bg-green-500/20"
                                  disabled={!activeSession || activeSession.status !== 'active'}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
              {verificationRecords.filter(record => record.status === 'escalated').length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No escalated assets found.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Asset Detail Dialog */}
      <Dialog open={showAssetDetailDialog} onOpenChange={setShowAssetDetailDialog}>
        <DialogContent className="bg-black/90 border-green-500/30 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white">Asset Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedAssetForDetail && `Viewing details for: ${selectedAssetForDetail.name}`}
            </DialogDescription>
          </DialogHeader>
          {selectedAssetForDetail && (
            <div className="space-y-4">
              <AssetDetails asset={selectedAssetForDetail} />
              
              {/* Asset Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/30 rounded-lg p-4 space-y-2">
                  <h3 className="text-white font-medium">Basic Information</h3>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div><span className="text-gray-400">Name:</span> {selectedAssetForDetail.name}</div>
                    <div><span className="text-gray-400">Type:</span> {selectedAssetForDetail.type}</div>
                    <div><span className="text-gray-400">Category:</span> {selectedAssetForDetail.category}</div>
                    <div><span className="text-gray-400">Serial Number:</span> {selectedAssetForDetail.serialNumber || 'N/A'}</div>
                    <div><span className="text-gray-400">Status:</span> 
                      <Badge className="ml-1 bg-green-500/20 text-green-300">{selectedAssetForDetail.status}</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800/30 rounded-lg p-4 space-y-2">
                  <h3 className="text-white font-medium">Location & Assignment</h3>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div><span className="text-gray-400">Department:</span> {selectedAssetForDetail.department}</div>
                    <div><span className="text-gray-400">Company:</span> {selectedAssetForDetail.company}</div>
                    <div><span className="text-gray-400">Location:</span> {selectedAssetForDetail.location}</div>
                    <div><span className="text-gray-400">Owner:</span> {selectedAssetForDetail.owner}</div>
                    <div><span className="text-gray-400">Vendor:</span> {selectedAssetForDetail.vendor}</div>
                  </div>
                </div>
                
                <div className="bg-gray-800/30 rounded-lg p-4 space-y-2">
                  <h3 className="text-white font-medium">Financial Information</h3>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div><span className="text-gray-400">Purchase Price:</span> ₹{selectedAssetForDetail.purchasePrice.toLocaleString()}</div>
                    <div><span className="text-gray-400">Current Value:</span> ₹{selectedAssetForDetail.currentValue.toLocaleString()}</div>
                    <div><span className="text-gray-400">Purchase Date:</span> {format(new Date(selectedAssetForDetail.purchaseDate), 'dd/MM/yyyy')}</div>
                    <div><span className="text-gray-400">Depreciation Rate:</span> {selectedAssetForDetail.depreciationRate}%</div>
                  </div>
                </div>
                
                <div className="bg-gray-800/30 rounded-lg p-4 space-y-2">
                  <h3 className="text-white font-medium">Additional Details</h3>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div><span className="text-gray-400">Useful Life:</span> {selectedAssetForDetail.usefulLife} years</div>
                    <div><span className="text-gray-400">Depreciation Method:</span> {selectedAssetForDetail.depreciationMethod}</div>
                    <div><span className="text-gray-400">Residual Value:</span> ₹{selectedAssetForDetail.residualValue.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              
              {selectedAssetForDetail.notes && (
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">Notes</h3>
                  <p className="text-sm text-gray-300">{selectedAssetForDetail.notes}</p>
                </div>
              )}

              {/* Verification Action for this asset */}
              {activeSession && (
                <div className="flex gap-2 pt-4 border-t border-gray-600">
                  <Button
                    onClick={() => {
                      setShowAssetDetailDialog(false);
                      setSelectedAssetForVerification(selectedAssetForDetail);
                      setShowVerificationDialog(true);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-black"
                    disabled={activeSession.status !== 'active'}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify This Asset
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="bg-black/90 border-green-500/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Verify Asset</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedAssetForVerification && `Verifying: ${selectedAssetForVerification.name}`}
            </DialogDescription>
          </DialogHeader>
          {selectedAssetForVerification && (
            <div className="space-y-4">
              {/* Asset Details */}
              <AssetDetails asset={selectedAssetForVerification} />

              {/* Verification Actions */}
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm font-medium">Verification Remarks</label>
                  <Textarea
                    value={verificationRemarks}
                    onChange={(e) => setVerificationRemarks(e.target.value)}
                    placeholder="Add any notes about the asset condition, location, etc."
                    className="mt-1 bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      verifyAsset(selectedAssetForVerification.id, verificationRemarks);
                      setShowVerificationDialog(false);
                      setSelectedAssetForVerification(null);
                      setVerificationRemarks('');
                    }}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-black"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Verified
                  </Button>
                  <Button
                    onClick={() => {
                      markAssetAsDisposed(selectedAssetForVerification.id, verificationRemarks || 'Asset not found during verification', 'writeoff');
                      setShowVerificationDialog(false);
                      setSelectedAssetForVerification(null);
                      setVerificationRemarks('');
                    }}
                    variant="outline"
                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Mark for Disposal
                  </Button>
                  <Button
                    onClick={() => {
                      escalateAsset(selectedAssetForVerification.id, verificationRemarks || 'Requires additional review');
                      setShowVerificationDialog(false);
                      setSelectedAssetForVerification(null);
                      setVerificationRemarks('');
                    }}
                    variant="outline"
                    className="flex-1 border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Escalate
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetVerification;
