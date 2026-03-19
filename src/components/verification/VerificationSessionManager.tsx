
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, Plus, FileText } from 'lucide-react';
import { format } from 'date-fns';
import SessionDetailsDialog from './SessionDetailsDialog';

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
}

interface AssetVerificationRecord {
  assetId: string;
  sessionId: string;
  status: 'verified' | 'not_verified' | 'disposed' | 'escalated';
  verifiedBy?: string;
  verifiedAt?: string;
  remarks?: string;
}

interface VerificationSessionManagerProps {
  sessions: VerificationSession[];
  activeSession: VerificationSession | null;
  onCreateSession: (name: string) => void;
  onSetActiveSession: (session: VerificationSession) => void;
  onPauseSession: () => void;
  onResumeSession: () => void;
  onCompleteSession: () => void;
  verificationRecords: AssetVerificationRecord[];
  assets: any[];
}

const VerificationSessionManager: React.FC<VerificationSessionManagerProps> = ({
  sessions,
  activeSession,
  onCreateSession,
  onSetActiveSession,
  onPauseSession,
  onResumeSession,
  onCompleteSession,
  verificationRecords,
  assets
}) => {
  const [selectedSession, setSelectedSession] = useState<VerificationSession | null>(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);

  const handleViewSessionDetails = (session: VerificationSession) => {
    setSelectedSession(session);
    setShowSessionDetails(true);
  };

  return (
    <div className="space-y-4">
      {/* Active Session Info */}
      {activeSession && (
        <Card className="bg-black/60 border-green-500/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-white">Active Session: {activeSession.name}</CardTitle>
                <CardDescription className="text-gray-400">
                  Started: {format(new Date(activeSession.startDate), 'dd/MM/yyyy HH:mm')} • Status: {activeSession.status}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {activeSession.status === 'active' && (
                  <Button onClick={onPauseSession} variant="outline" size="sm">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                )}
                {activeSession.status === 'paused' && (
                  <Button onClick={onResumeSession} variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                )}
                <Button onClick={onCompleteSession} className="bg-red-500 hover:bg-red-600" size="sm">
                  Complete Session
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Sessions Table */}
      <Card className="bg-black/60 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-white">Verification Sessions</CardTitle>
          <CardDescription className="text-gray-400">
            Manage verification sessions and view history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-300">Session Name</TableHead>
                  <TableHead className="text-gray-300">Created By</TableHead>
                  <TableHead className="text-gray-300">Start Date</TableHead>
                  <TableHead className="text-gray-300">End Date</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Progress</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map(session => (
                  <TableRow key={session.id} className="border-gray-600 hover:bg-gray-800/30">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{session.name}</p>
                        <p className="text-sm text-gray-400">{session.totalAssets} total assets</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{session.createdBy}</TableCell>
                    <TableCell className="text-white">
                      {format(new Date(session.startDate), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="text-white">
                      {session.endDate ? format(new Date(session.endDate), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${
                        session.status === 'active' ? 'bg-green-500/20 text-green-300' :
                        session.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-orange-500/20 text-orange-300'
                      }`}>
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="text-white">
                          Verified: {session.verifiedAssets}/{session.totalAssets}
                        </p>
                        <p className="text-gray-400">
                          Disposed: {session.disposedAssets}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {session.status !== 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSetActiveSession(session)}
                            className="text-green-500 hover:bg-green-500/20"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewSessionDetails(session)}
                          className="text-blue-500 hover:bg-blue-500/20"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Session Details Dialog */}
      <SessionDetailsDialog
        session={selectedSession}
        open={showSessionDetails}
        onOpenChange={setShowSessionDetails}
        verificationRecords={verificationRecords}
        assets={assets}
      />
    </div>
  );
};

export default VerificationSessionManager;
