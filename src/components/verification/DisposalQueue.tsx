
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Asset } from '@/lib/assets';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';

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

interface DisposalQueueProps {
  disposalQueue: DisposalQueueItem[];
  assets: Asset[];
  onUpdateDisposalStatus: (item: DisposalQueueItem, status: 'approved' | 'rejected') => void;
}

const DisposalQueue: React.FC<DisposalQueueProps> = ({
  disposalQueue,
  assets,
  onUpdateDisposalStatus
}) => {
  const getAsset = (assetId: string) => {
    return assets.find(a => a.id === assetId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'approved':
        return 'bg-green-500/20 text-green-300';
      case 'rejected':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'sale':
        return 'bg-blue-500/20 text-blue-300';
      case 'writeoff':
        return 'bg-red-500/20 text-red-300';
      case 'transfer':
        return 'bg-purple-500/20 text-purple-300';
      case 'scrap':
        return 'bg-orange-500/20 text-orange-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <Card className="bg-black/60 border-green-500/20">
      <CardHeader>
        <CardTitle className="text-white">Disposal Queue ({disposalQueue.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {disposalQueue.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No assets in disposal queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-300">Asset</TableHead>
                  <TableHead className="text-gray-300">Reason</TableHead>
                  <TableHead className="text-gray-300">Suggested Method</TableHead>
                  <TableHead className="text-gray-300">Added By</TableHead>
                  <TableHead className="text-gray-300">Date Added</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disposalQueue.map((item, index) => {
                  const asset = getAsset(item.assetId);
                  return (
                    <TableRow key={index} className="border-gray-600 hover:bg-gray-800/30">
                      <TableCell>
                        <div>
                          <p className="font-medium text-white">{asset?.name || 'Unknown Asset'}</p>
                          <p className="text-sm text-gray-400">{asset?.type}</p>
                          <p className="text-xs text-gray-500">{asset?.department}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-white max-w-xs">
                        <p className="truncate">{item.reason}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getMethodColor(item.suggestedMethod)}>
                          {item.suggestedMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">{item.addedBy}</TableCell>
                      <TableCell className="text-white">
                        {format(new Date(item.addedAt), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        {item.reviewedBy && (
                          <p className="text-xs text-gray-400 mt-1">
                            By: {item.reviewedBy}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {item.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onUpdateDisposalStatus(item, 'approved')}
                                className="text-green-500 hover:bg-green-500/20"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onUpdateDisposalStatus(item, 'rejected')}
                                className="text-red-500 hover:bg-red-500/20"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Navigate to asset detail or show modal
                              console.log('View asset detail:', asset);
                            }}
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
        )}
      </CardContent>
    </Card>
  );
};

export default DisposalQueue;
