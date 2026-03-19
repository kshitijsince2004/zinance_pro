import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Archive, Eye, Download, Search, Filter, History, Calendar, DollarSign, Info, QrCode } from 'lucide-react';
import { Asset } from '@/lib/assets';
import { format, differenceInDays } from 'date-fns';
import EnhancedQRCode from '@/components/EnhancedQRCode';

interface DisposedAssetsSectionProps {
  assets: Asset[];
}

interface DisposalHistory {
  asset: Asset;
  disposalDate: string;
  disposalMethod: string;
  disposalValue: number;
  totalDepreciation: number;
  gainLoss: number;
  daysInService: number;
}

const DisposedAssetsSection: React.FC<DisposedAssetsSectionProps> = ({ assets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('disposalDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);

  const disposedAssets = assets.filter(asset => asset.status === 'sold' || asset.status === 'retired');

  const disposalHistory: DisposalHistory[] = disposedAssets.map(asset => {
    const putToUseDate = new Date(asset.putToUseDate || asset.purchaseDate);
    const disposalDate = asset.soldDate ? new Date(asset.soldDate) : new Date();
    const daysInService = differenceInDays(disposalDate, putToUseDate);
    
    const totalDepreciation = asset.purchasePrice - (asset.currentValue || 0);
    const disposalValue = asset.soldPrice || 0;
    const gainLoss = disposalValue - (asset.currentValue || 0);

    return {
      asset,
      disposalDate: asset.soldDate || new Date().toISOString().split('T')[0],
      disposalMethod: asset.status === 'sold' ? 'Sale' : 'Write-off',
      disposalValue,
      totalDepreciation,
      gainLoss,
      daysInService
    };
  });

  const filteredHistory = disposalHistory.filter(history => {
    const matchesSearch = 
      history.asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.asset.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || history.asset.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'disposalDate':
        aValue = new Date(a.disposalDate);
        bValue = new Date(b.disposalDate);
        break;
      case 'disposalValue':
        aValue = a.disposalValue;
        bValue = b.disposalValue;
        break;
      case 'gainLoss':
        aValue = a.gainLoss;
        bValue = b.gainLoss;
        break;
      case 'totalDepreciation':
        aValue = a.totalDepreciation;
        bValue = b.totalDepreciation;
        break;
      default:
        aValue = a.asset[sortBy as keyof Asset] || '';
        bValue = b.asset[sortBy as keyof Asset] || '';
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sold':
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Sold</Badge>;
      case 'retired':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Retired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getGainLossBadge = (gainLoss: number) => {
    if (gainLoss > 0) {
      return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Gain</Badge>;
    } else if (gainLoss < 0) {
      return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Loss</Badge>;
    } else {
      return <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">Break-even</Badge>;
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Asset Name', 'Serial Number', 'Department', 'Category', 
      'Purchase Date', 'Put to Use Date', 'Disposal Date', 'Disposal Method',
      'Purchase Price', 'Total Depreciation', 'Book Value at Disposal',
      'Disposal Value', 'Gain/Loss', 'Days in Service'
    ];

    const csvContent = [
      headers.join(','),
      ...sortedHistory.map(history => [
        history.asset.name || '',
        history.asset.serialNumber || '',
        history.asset.department || '',
        history.asset.category || '',
        history.asset.purchaseDate ? format(new Date(history.asset.purchaseDate), 'dd/MM/yyyy') : '',
        history.asset.putToUseDate ? format(new Date(history.asset.putToUseDate), 'dd/MM/yyyy') : '',
        format(new Date(history.disposalDate), 'dd/MM/yyyy'),
        history.disposalMethod,
        history.asset.purchasePrice.toFixed(2),
        history.totalDepreciation.toFixed(2),
        (history.asset.currentValue || 0).toFixed(2),
        history.disposalValue.toFixed(2),
        history.gainLoss.toFixed(2),
        history.daysInService
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disposed-assets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTotals = () => {
    return sortedHistory.reduce(
      (totals, history) => ({
        purchaseValue: totals.purchaseValue + history.asset.purchasePrice,
        totalDepreciation: totals.totalDepreciation + history.totalDepreciation,
        disposalValue: totals.disposalValue + history.disposalValue,
        gainLoss: totals.gainLoss + history.gainLoss
      }),
      { purchaseValue: 0, totalDepreciation: 0, disposalValue: 0, gainLoss: 0 }
    );
  };

  const totals = getTotals();

  const handleViewDetails = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowDetailDialog(true);
  };

  const handleViewQR = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowQRDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/60 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Disposed</p>
                <p className="text-2xl font-bold text-white">{disposedAssets.length}</p>
              </div>
              <Archive className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/60 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Original Value</p>
                <p className="text-xl font-bold text-white">{formatCurrency(totals.purchaseValue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/60 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Depreciation</p>
                <p className="text-xl font-bold text-white">{formatCurrency(totals.totalDepreciation)}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/60 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Net Gain/Loss</p>
                <p className={`text-xl font-bold ${totals.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(Math.abs(totals.gainLoss))}
                </p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center">
                {getGainLossBadge(totals.gainLoss)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/60 border-green-500/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black border-green-500/30 text-white"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-black border-green-500/30 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-black border-green-500/40">
                <SelectItem value="all" className="text-white hover:bg-green-500/20">All Status</SelectItem>
                <SelectItem value="sold" className="text-white hover:bg-green-500/20">Sold</SelectItem>
                <SelectItem value="retired" className="text-white hover:bg-green-500/20">Retired</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-black border-green-500/30 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-black border-green-500/40">
                <SelectItem value="disposalDate" className="text-white hover:bg-green-500/20">Disposal Date</SelectItem>
                <SelectItem value="name" className="text-white hover:bg-green-500/20">Asset Name</SelectItem>
                <SelectItem value="disposalValue" className="text-white hover:bg-green-500/20">Disposal Value</SelectItem>
                <SelectItem value="gainLoss" className="text-white hover:bg-green-500/20">Gain/Loss</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={exportToCSV}
              variant="outline"
              className="border-green-500/30 text-green-400 hover:bg-green-500/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/60 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History className="w-5 h-5 text-red-400" />
            Disposed Assets History ({sortedHistory.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-600">
                  <TableHead className="text-gray-300">Asset Details</TableHead>
                  <TableHead className="text-gray-300">Department</TableHead>
                  <TableHead className="text-gray-300">Disposal Info</TableHead>
                  <TableHead className="text-gray-300 text-right">Purchase Price</TableHead>
                  <TableHead className="text-gray-300 text-right">Total Depreciation</TableHead>
                  <TableHead className="text-gray-300 text-right">Book Value</TableHead>
                  <TableHead className="text-gray-300 text-right">Disposal Value</TableHead>
                  <TableHead className="text-gray-300 text-right">Gain/Loss</TableHead>
                  <TableHead className="text-gray-300 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHistory.map((history, index) => (
                  <TableRow key={history.asset.id} className="border-gray-600 hover:bg-gray-800/30">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{history.asset.name}</p>
                        <p className="text-sm text-gray-400">{history.asset.serialNumber || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{history.asset.category}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{history.asset.department}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {getStatusBadge(history.asset.status)}
                        <p className="text-sm text-gray-400">
                          {format(new Date(history.disposalDate), 'dd/MM/yyyy')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {history.daysInService} days in service
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-blue-400 font-medium">
                      {formatCurrency(history.asset.purchasePrice)}
                    </TableCell>
                    <TableCell className="text-right text-orange-400 font-medium">
                      {formatCurrency(history.totalDepreciation)}
                    </TableCell>
                    <TableCell className="text-right text-yellow-400 font-medium">
                      {formatCurrency(history.asset.currentValue || 0)}
                    </TableCell>
                    <TableCell className="text-right text-purple-400 font-medium">
                      {formatCurrency(history.disposalValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`font-medium ${history.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(Math.abs(history.gainLoss))}
                        </span>
                        {getGainLossBadge(history.gainLoss)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(history.asset)}
                          className="text-green-500 hover:bg-green-500/20"
                          title="View Full Details"
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewQR(history.asset)}
                          className="text-blue-500 hover:bg-blue-500/20"
                          title="View QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAsset(history.asset);
                            setShowHistoryDialog(true);
                          }}
                          className="text-orange-500 hover:bg-orange-500/20"
                          title="View History"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {sortedHistory.length > 0 && (
                  <TableRow className="border-gray-600 bg-gray-800/50 font-bold">
                    <TableCell colSpan={3} className="text-white">
                      <strong>TOTALS</strong>
                    </TableCell>
                    <TableCell className="text-right text-blue-400 font-bold">
                      {formatCurrency(totals.purchaseValue)}
                    </TableCell>
                    <TableCell className="text-right text-orange-400 font-bold">
                      {formatCurrency(totals.totalDepreciation)}
                    </TableCell>
                    <TableCell className="text-right text-yellow-400 font-bold">
                      {formatCurrency(totals.purchaseValue - totals.totalDepreciation)}
                    </TableCell>
                    <TableCell className="text-right text-purple-400 font-bold">
                      {formatCurrency(totals.disposalValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-bold ${totals.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(Math.abs(totals.gainLoss))}
                      </span>
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-gray-900 border-gray-600 max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Complete Asset Information - {selectedAsset?.name}</DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <div className="space-y-6">
              {selectedAsset.assetImage && (
                <div className="flex justify-center">
                  <img 
                    src={selectedAsset.assetImage} 
                    alt={selectedAsset.name} 
                    className="max-w-md h-48 object-cover rounded-lg border border-gray-600"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-white text-lg border-b border-gray-600 pb-2">Asset Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white font-medium">{selectedAsset.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white">{selectedAsset.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category:</span>
                      <span className="text-white">{selectedAsset.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Serial Number:</span>
                      <span className="text-white">{selectedAsset.serialNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      {getStatusBadge(selectedAsset.status)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-white text-lg border-b border-gray-600 pb-2">Financial Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Purchase Price:</span>
                      <span className="text-white font-medium">{formatCurrency(selectedAsset.purchasePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Value:</span>
                      <span className="text-green-400 font-medium">{formatCurrency(selectedAsset.currentValue || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Residual Value:</span>
                      <span className="text-white">{formatCurrency(selectedAsset.residualValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Depreciation Rate:</span>
                      <span className="text-white">{selectedAsset.depreciationRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Method:</span>
                      <span className="text-white">{selectedAsset.depreciationMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-white text-lg border-b border-gray-600 pb-2">Location & Ownership</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Department:</span>
                      <span className="text-white">{selectedAsset.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Owner:</span>
                      <span className="text-white">{selectedAsset.owner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Location:</span>
                      <span className="text-white">{selectedAsset.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Office:</span>
                      <span className="text-white">{selectedAsset.office}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Company:</span>
                      <span className="text-white">{selectedAsset.company}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/30 rounded-lg p-4">
                <h4 className="font-semibold text-white text-lg mb-4">Disposal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400 block">Disposal Date:</span>
                    <span className="text-white font-medium">
                      {selectedAsset.soldDate ? format(new Date(selectedAsset.soldDate), 'dd/MM/yyyy') : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Disposal Value:</span>
                    <span className="text-purple-400 font-medium">{formatCurrency(selectedAsset.soldPrice || 0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Book Value at Disposal:</span>
                    <span className="text-yellow-400 font-medium">{formatCurrency(selectedAsset.currentValue || 0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Gain/Loss on Disposal:</span>
                    <span className={`font-medium ${(selectedAsset.soldPrice || 0) - (selectedAsset.currentValue || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(Math.abs((selectedAsset.soldPrice || 0) - (selectedAsset.currentValue || 0)))}
                    </span>
                  </div>
                </div>
              </div>

              {(selectedAsset.invoiceNumber || selectedAsset.vendor || selectedAsset.warrantyEndDate) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedAsset.invoiceNumber || selectedAsset.vendor && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-white text-lg border-b border-gray-600 pb-2">Purchase Information</h4>
                      <div className="space-y-2 text-sm">
                        {selectedAsset.invoiceNumber && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Invoice Number:</span>
                            <span className="text-white">{selectedAsset.invoiceNumber}</span>
                          </div>
                        )}
                        {selectedAsset.vendor && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Vendor:</span>
                            <span className="text-white">{selectedAsset.vendor}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">Purchase Date:</span>
                          <span className="text-white">
                            {selectedAsset.purchaseDate ? format(new Date(selectedAsset.purchaseDate), 'dd/MM/yyyy') : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedAsset.warrantyEndDate && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-white text-lg border-b border-gray-600 pb-2">Warranty Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Warranty Start:</span>
                          <span className="text-white">
                            {selectedAsset.warrantyStartDate ? format(new Date(selectedAsset.warrantyStartDate), 'dd/MM/yyyy') : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Warranty End:</span>
                          <span className="text-white">
                            {format(new Date(selectedAsset.warrantyEndDate), 'dd/MM/yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedAsset.notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-white text-lg">Notes</h4>
                  <p className="text-gray-300 bg-gray-800/30 p-3 rounded">{selectedAsset.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="bg-gray-900 border-gray-600 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Asset QR Code</DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <EnhancedQRCode 
              asset={selectedAsset} 
              onClose={() => setShowQRDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="bg-gray-900 border-gray-600 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white">Asset History - {selectedAsset?.name}</DialogTitle>
          </DialogHeader>
          {selectedAsset && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Asset Information</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-400">Serial Number:</span> <span className="text-white">{selectedAsset.serialNumber || 'N/A'}</span></p>
                    <p><span className="text-gray-400">Category:</span> <span className="text-white">{selectedAsset.category}</span></p>
                    <p><span className="text-gray-400">Department:</span> <span className="text-white">{selectedAsset.department}</span></p>
                    <p><span className="text-gray-400">Owner:</span> <span className="text-white">{selectedAsset.owner}</span></p>
                    <p><span className="text-gray-400">Location:</span> <span className="text-white">{selectedAsset.location}</span></p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">Disposal Information</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-400">Status:</span> {getStatusBadge(selectedAsset.status)}</p>
                    <p><span className="text-gray-400">Disposal Date:</span> <span className="text-white">{selectedAsset.soldDate ? format(new Date(selectedAsset.soldDate), 'dd/MM/yyyy') : 'N/A'}</span></p>
                    <p><span className="text-gray-400">Disposal Value:</span> <span className="text-white">{formatCurrency(selectedAsset.soldPrice || 0)}</span></p>
                    <p><span className="text-gray-400">Final Book Value:</span> <span className="text-white">{formatCurrency(selectedAsset.currentValue || 0)}</span></p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-white">Financial Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="p-3 bg-gray-800/50 rounded">
                    <p className="text-gray-400">Purchase Price</p>
                    <p className="text-white font-medium">{formatCurrency(selectedAsset.purchasePrice)}</p>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded">
                    <p className="text-gray-400">Total Depreciation</p>
                    <p className="text-orange-400 font-medium">{formatCurrency(selectedAsset.purchasePrice - (selectedAsset.currentValue || 0))}</p>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded">
                    <p className="text-gray-400">Disposal Value</p>
                    <p className="text-purple-400 font-medium">{formatCurrency(selectedAsset.soldPrice || 0)}</p>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded">
                    <p className="text-gray-400">Gain/Loss</p>
                    <p className={`font-medium ${(selectedAsset.soldPrice || 0) - (selectedAsset.currentValue || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(Math.abs((selectedAsset.soldPrice || 0) - (selectedAsset.currentValue || 0)))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DisposedAssetsSection;
