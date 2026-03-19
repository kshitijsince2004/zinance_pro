
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { CheckCircle, X, Trash2, AlertTriangle, Calendar, Users, Building2, Tag } from 'lucide-react';

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
}

interface SessionDetailsDialogProps {
  session: VerificationSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verificationRecords: AssetVerificationRecord[];
  assets: any[];
}

const SessionDetailsDialog: React.FC<SessionDetailsDialogProps> = ({
  session,
  open,
  onOpenChange,
  verificationRecords,
  assets
}) => {
  if (!session) return null;

  const sessionRecords = verificationRecords.filter(r => r.sessionId === session.id);
  const verifiedCount = sessionRecords.filter(r => r.status === 'verified').length;
  const disposedCount = sessionRecords.filter(r => r.status === 'disposed').length;
  const escalatedCount = sessionRecords.filter(r => r.status === 'escalated').length;
  const notVerifiedCount = session.totalAssets - sessionRecords.length;
  
  const progressPercent = session.totalAssets > 0 
    ? ((verifiedCount + disposedCount + escalatedCount) / session.totalAssets * 100)
    : 0;

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

  const getAssetRecord = (assetId: string) => {
    return sessionRecords.find(r => r.assetId === assetId);
  };

  const duration = session.endDate 
    ? `${Math.ceil((new Date(session.endDate).getTime() - new Date(session.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`
    : `${Math.ceil((new Date().getTime() - new Date(session.startDate).getTime()) / (1000 * 60 * 60 * 24))} days (ongoing)`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/90 border-green-500/30 max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Session Details: {session.name}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Comprehensive verification session report and analysis
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/60">
            <TabsTrigger value="overview" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              Overview
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              Progress
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              Assets
            </TabsTrigger>
            <TabsTrigger value="summary" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
              Summary
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-black/60 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-400">Duration</p>
                      <p className="text-lg font-bold text-white">{duration}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/60 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-400">Created By</p>
                      <p className="text-lg font-bold text-white">{session.createdBy}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/60 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <Badge className={`${
                        session.status === 'active' ? 'bg-green-500/20 text-green-300' :
                        session.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-orange-500/20 text-orange-300'
                      }`}>
                        {session.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/60 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-400">Total Assets</p>
                      <p className="text-lg font-bold text-white">{session.totalAssets}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Session Filters */}
            {(session.departments || session.companies || session.categories) && (
              <Card className="bg-black/60 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Session Filters</CardTitle>
                  <CardDescription className="text-gray-400">
                    This session is filtered to include only specific criteria
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {session.departments && session.departments.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Departments:</p>
                      <div className="flex flex-wrap gap-2">
                        {session.departments.map(dept => (
                          <Badge key={dept} className="bg-blue-500/20 text-blue-300">
                            {dept}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {session.companies && session.companies.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Companies:</p>
                      <div className="flex flex-wrap gap-2">
                        {session.companies.map(comp => (
                          <Badge key={comp} className="bg-purple-500/20 text-purple-300">
                            {comp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {session.categories && session.categories.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Categories:</p>
                      <div className="flex flex-wrap gap-2">
                        {session.categories.map(cat => (
                          <Badge key={cat} className="bg-green-500/20 text-green-300">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <Card className="bg-black/60 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white">Verification Progress</CardTitle>
                <CardDescription className="text-gray-400">
                  Overall completion status: {progressPercent.toFixed(1)}%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progressPercent} className="w-full" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{verifiedCount}</p>
                    <p className="text-sm text-gray-400">Verified</p>
                  </div>
                  <div className="text-center">
                    <X className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{notVerifiedCount}</p>
                    <p className="text-sm text-gray-400">Not Verified</p>
                  </div>
                  <div className="text-center">
                    <Trash2 className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{disposedCount}</p>
                    <p className="text-sm text-gray-400">Disposed</p>
                  </div>
                  <div className="text-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{escalatedCount}</p>
                    <p className="text-sm text-gray-400">Escalated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4">
            <Card className="bg-black/60 border-green-500/20">
              <CardHeader>
                <CardTitle className="text-white">Assets in Session</CardTitle>
                <CardDescription className="text-gray-400">
                  Detailed view of all assets included in this verification session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-600">
                        <TableHead className="text-gray-300">Asset</TableHead>
                        <TableHead className="text-gray-300">Department</TableHead>
                        <TableHead className="text-gray-300">Location</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Verified By</TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessionAssets.map((asset) => {
                        const record = getAssetRecord(asset.id);
                        return (
                          <TableRow key={asset.id} className="border-gray-600 hover:bg-gray-800/30">
                            <TableCell>
                              <div>
                                <p className="font-medium text-white">{asset.name}</p>
                                <p className="text-sm text-gray-400">{asset.type}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-white">{asset.department}</TableCell>
                            <TableCell className="text-white">{asset.location}</TableCell>
                            <TableCell>
                              <Badge className={`${
                                !record ? 'bg-gray-500/20 text-gray-300' :
                                record.status === 'verified' ? 'bg-green-500/20 text-green-300' :
                                record.status === 'disposed' ? 'bg-red-500/20 text-red-300' :
                                record.status === 'escalated' ? 'bg-orange-500/20 text-orange-300' :
                                'bg-gray-500/20 text-gray-300'
                              }`}>
                                {record ? record.status : 'not_verified'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-white">
                              {record?.verifiedBy || '-'}
                            </TableCell>
                            <TableCell className="text-white">
                              {record?.verifiedAt ? format(new Date(record.verifiedAt), 'dd/MM/yyyy HH:mm') : '-'}
                            </TableCell>
                            <TableCell className="text-white max-w-xs">
                              <p className="truncate text-sm">{record?.remarks || '-'}</p>
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

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-black/60 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Session Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="text-gray-400">Started:</p>
                    <p className="text-white">{format(new Date(session.startDate), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                  {session.endDate && (
                    <div className="text-sm">
                      <p className="text-gray-400">Completed:</p>
                      <p className="text-white">{format(new Date(session.endDate), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                  )}
                  <div className="text-sm">
                    <p className="text-gray-400">Duration:</p>
                    <p className="text-white">{duration}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/60 border-green-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="text-gray-400">Completion Rate:</p>
                    <p className="text-white">{progressPercent.toFixed(1)}%</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-400">Verification Rate:</p>
                    <p className="text-white">{session.totalAssets > 0 ? (verifiedCount / session.totalAssets * 100).toFixed(1) : 0}%</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-400">Disposal Rate:</p>
                    <p className="text-white">{session.totalAssets > 0 ? (disposedCount / session.totalAssets * 100).toFixed(1) : 0}%</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-400">Escalation Rate:</p>
                    <p className="text-white">{session.totalAssets > 0 ? (escalatedCount / session.totalAssets * 100).toFixed(1) : 0}%</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SessionDetailsDialog;
