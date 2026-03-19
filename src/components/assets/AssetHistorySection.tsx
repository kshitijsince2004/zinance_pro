import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Search, Filter, Download, Calendar, Edit, Trash2, Eye, Plus, Calculator, AlertTriangle } from 'lucide-react';
import { Asset } from '@/lib/assets';
import { format } from 'date-fns';
import { assetHistoryManager } from '@/lib/asset-history-manager';
import { DepreciationHistory, AssetHistoryEntry } from '@/types/asset-history';
import { useToast } from '@/hooks/use-toast';
import { depreciationCalculator } from '@/lib/depreciation/calculations';

interface AssetHistorySectionProps {
  assets: Asset[];
}

const AssetHistorySection: React.FC<AssetHistorySectionProps> = ({ assets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showDepreciationHistory, setShowDepreciationHistory] = useState(false);
  const [editingHistory, setEditingHistory] = useState<DepreciationHistory | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('entries');
  const { toast } = useToast();

  // Get historical depreciation records
  const historyEntries = useMemo(() => {
    const allHistoricalEntries: AssetHistoryEntry[] = [];
    
    assets.forEach(asset => {
      // Get depreciation history for this asset
      const depreciationHistory = assetHistoryManager.getAssetDepreciationHistory(asset.id);
      
      // Convert depreciation history to history entries
      depreciationHistory.forEach(depHistory => {
        allHistoricalEntries.push({
          id: `${depHistory.id}_history`,
          assetId: asset.id,
          assetName: asset.name,
          action: depHistory.isHistorical ? 'historical_import' : 'depreciation_updated',
          oldValue: depHistory.openingValue,
          newValue: depHistory.closingValue,
          field: 'book_value',
          timestamp: depHistory.createdAt,
          user: depHistory.isHistorical ? 'import_system' : 'system',
          details: `${depHistory.isHistorical ? 'Historical' : 'System'} depreciation for FY ${depHistory.financialYear}: Opening ₹${depHistory.openingValue.toLocaleString()}, Depreciation ₹${depHistory.depreciationAmount.toLocaleString()}, Closing ₹${depHistory.closingValue.toLocaleString()}`,
          depreciationHistory: depHistory
        });
      });

      // Add asset creation entry if it has import metadata
      if (asset.importMetadata) {
        allHistoricalEntries.push({
          id: `${asset.id}_import`,
          assetId: asset.id,
          assetName: asset.name,
          action: 'imported',
          newValue: asset.purchasePrice,
          field: 'purchase_price',
          timestamp: asset.importMetadata.importTime,
          user: asset.importMetadata.importedBy,
          details: `Asset imported from ${asset.importMetadata.fileName} (Batch: ${asset.importMetadata.batchId}) with historical data`
        });
      }
    });

    return allHistoricalEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [assets]);

  // Filter history entries
  const filteredEntries = useMemo(() => {
    return historyEntries.filter(entry => {
      const matchesSearch = entry.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          entry.details?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAction = actionFilter === 'all' || entry.action === actionFilter;
      
      const entryDate = new Date(entry.timestamp);
      const now = new Date();
      let matchesDate = true;
      
      if (dateFilter === 'today') {
        matchesDate = entryDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = entryDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = entryDate >= monthAgo;
      }
      
      return matchesSearch && matchesAction && matchesDate;
    });
  }, [historyEntries, searchTerm, actionFilter, dateFilter]);

  // Handle editing depreciation history
  const handleEditHistory = (history: DepreciationHistory) => {
    setEditingHistory(history);
    setShowEditDialog(true);
  };

  const handleUpdateHistory = async (updates: Partial<DepreciationHistory>) => {
    if (!editingHistory) return;

    const updated = assetHistoryManager.updateDepreciationHistory(editingHistory.id, updates);
    if (updated) {
      toast({
        title: 'History Updated',
        description: `Depreciation history for FY ${updated.financialYear} has been updated.`,
      });
      setShowEditDialog(false);
      setEditingHistory(null);
    }
  };

  const handleDeleteHistory = (historyId: string) => {
    if (window.confirm('Are you sure you want to delete this depreciation entry?')) {
      const deleted = assetHistoryManager.deleteDepreciationHistory(historyId);
      if (deleted) {
        toast({
          title: 'History Deleted',
          description: 'Depreciation entry has been removed.',
        });
      }
    }
  };

  const handleCompareDepreciation = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowComparisonDialog(true);
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'created': return 'default';
      case 'imported': return 'secondary';
      case 'updated': return 'outline';
      case 'depreciation_updated': return 'destructive';
      case 'transferred': return 'default';
      case 'historical_import': return 'secondary';
      case 'disposed': return 'destructive';
      default: return 'outline';
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const exportHistory = () => {
    const headers = ['Asset Name', 'Action', 'Old Value', 'New Value', 'Date', 'User', 'Details'];
    const csvContent = [
      headers.join(','),
      ...filteredEntries.map(entry => [
        entry.assetName,
        entry.action,
        entry.oldValue ? formatCurrency(entry.oldValue) : '',
        entry.newValue ? formatCurrency(entry.newValue) : '',
        format(new Date(entry.timestamp), 'dd/MM/yyyy HH:mm'),
        entry.user,
        entry.details || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asset-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/60 border-orange-500/20">
        <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <History className="w-5 h-5 text-orange-400" />
              Historical Depreciation Records
            </CardTitle>
            <p className="text-gray-400">
              Historical depreciation data imported with assets and system-calculated depreciation records.
            </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="entries" className="text-white">Historical Records</TabsTrigger>
              <TabsTrigger value="depreciation" className="text-white">Depreciation Management</TabsTrigger>
            </TabsList>

            <TabsContent value="entries" className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search assets or details..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-black/60 border-gray-600 text-white"
                  />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="bg-black/60 border-gray-600 text-white">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Records</SelectItem>
                    <SelectItem value="imported">Imported Assets</SelectItem>
                    <SelectItem value="historical_import">Historical Depreciation</SelectItem>
                    <SelectItem value="depreciation_updated">System Depreciation</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="bg-black/60 border-gray-600 text-white">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={exportHistory}
                  variant="outline"
                  className="border-orange-400 text-orange-400 hover:bg-orange-500/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                  <div className="text-orange-400 font-medium">Total Entries</div>
                  <div className="text-white text-lg font-bold">{filteredEntries.length}</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <div className="text-blue-400 font-medium">Imported Assets</div>
                  <div className="text-white text-lg font-bold">
                    {filteredEntries.filter(e => e.action === 'imported').length}
                  </div>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <div className="text-green-400 font-medium">Historical Records</div>
                  <div className="text-white text-lg font-bold">
                    {filteredEntries.filter(e => e.action === 'historical_import').length}
                  </div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="text-red-400 font-medium">System Depreciation</div>
                  <div className="text-white text-lg font-bold">
                    {filteredEntries.filter(e => e.action === 'depreciation_updated').length}
                  </div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <div className="text-purple-400 font-medium">Total Years</div>
                  <div className="text-white text-lg font-bold">
                    {new Set(filteredEntries.filter(e => e.depreciationHistory).map(e => e.depreciationHistory?.financialYear)).size}
                  </div>
                </div>
              </div>

              {/* History Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-600">
                      <TableHead className="text-gray-300">Asset</TableHead>
                      <TableHead className="text-gray-300">Record Type</TableHead>
                      <TableHead className="text-gray-300">Financial Year</TableHead>
                      <TableHead className="text-gray-300">Value Change</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => (
                      <TableRow key={entry.id} className="border-gray-600 hover:bg-gray-800/30">
                        <TableCell className="text-white font-medium">{entry.assetName}</TableCell>
                        <TableCell>
                          <Badge variant={getActionBadgeVariant(entry.action)}>
                            {entry.action === 'historical_import' ? 'HISTORICAL' : 
                             entry.action === 'depreciation_updated' ? 'SYSTEM' :
                             entry.action === 'imported' ? 'IMPORTED' : 'SYSTEM'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white">
                          {entry.depreciationHistory ? 
                            entry.depreciationHistory.financialYear : 
                            entry.action === 'imported' ? 'N/A' : 'Current'
                          }
                        </TableCell>
                        <TableCell className="text-white">
                          {entry.oldValue && entry.newValue ? (
                            <div className="space-y-1">
                              <div className="text-blue-400 text-sm">Opening: {formatCurrency(entry.oldValue)}</div>
                              <div className="text-green-400 text-sm">Closing: {formatCurrency(entry.newValue)}</div>
                              {entry.depreciationHistory && (
                                <div className="text-red-400 text-sm">Depreciation: {formatCurrency(entry.depreciationHistory.depreciationAmount)}</div>
                              )}
                            </div>
                          ) : entry.newValue ? (
                            <div className="text-green-400">{formatCurrency(entry.newValue)}</div>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-white">
                          <div>{format(new Date(entry.timestamp), 'dd/MM/yyyy')}</div>
                        </TableCell>
                        <TableCell className="text-gray-300 max-w-xs truncate" title={entry.details}>
                          {entry.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredEntries.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No historical depreciation records found for the selected filters.</p>
                  <p className="text-sm mt-2">Import assets with historical data to see records here.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="depreciation" className="space-y-4">
              <DepreciationHistoryTab assets={assets} onEdit={handleEditHistory} onDelete={handleDeleteHistory} onCompare={handleCompareDepreciation} />
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>

      {/* Edit History Dialog */}
      <EditHistoryDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        history={editingHistory}
        onUpdate={handleUpdateHistory}
      />

      {/* Comparison Dialog */}
      <ComparisonDialog
        open={showComparisonDialog}
        onOpenChange={setShowComparisonDialog}
        asset={selectedAsset}
      />
    </div>
  );
};

// Depreciation History Tab Component
const DepreciationHistoryTab: React.FC<{
  assets: Asset[];
  onEdit: (history: DepreciationHistory) => void;
  onDelete: (historyId: string) => void;
  onCompare: (asset: Asset) => void;
}> = ({ assets, onEdit, onDelete, onCompare }) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>('all');

  const assetsWithHistory = assets.filter(asset => {
    const history = assetHistoryManager.getAssetDepreciationHistory(asset.id);
    return history.length > 0;
  });

  const depreciationHistory = useMemo(() => {
    if (selectedAssetId === 'all') {
      return assetHistoryManager.getAllDepreciationHistory();
    }
    return assetHistoryManager.getAssetDepreciationHistory(selectedAssetId);
  }, [selectedAssetId]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white text-lg font-semibold">Depreciation History</h3>
        <div className="flex gap-2">
          <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
            <SelectTrigger className="w-64 bg-black/60 border-gray-600 text-white">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              {assetsWithHistory.map(asset => (
                <SelectItem key={asset.id} value={asset.id}>{asset.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-600">
              <TableHead className="text-gray-300">Asset</TableHead>
              <TableHead className="text-gray-300">Financial Year</TableHead>
              <TableHead className="text-gray-300">Period</TableHead>
              <TableHead className="text-gray-300 text-right">Opening Value</TableHead>
              <TableHead className="text-gray-300 text-right">Depreciation</TableHead>
              <TableHead className="text-gray-300 text-right">Closing Value</TableHead>
              <TableHead className="text-gray-300">Type</TableHead>
              <TableHead className="text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {depreciationHistory.map((history) => {
              const asset = assets.find(a => a.id === history.assetId);
              return (
                <TableRow key={history.id} className="border-gray-600 hover:bg-gray-800/30">
                  <TableCell className="text-white font-medium">
                    {asset?.name || 'Unknown Asset'}
                  </TableCell>
                  <TableCell className="text-white">{history.financialYear}</TableCell>
                  <TableCell className="text-white">
                    <div className="text-sm">
                      <div>{format(new Date(history.startDate), 'dd/MM/yyyy')}</div>
                      <div className="text-gray-400">to {format(new Date(history.endDate), 'dd/MM/yyyy')}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-blue-400">
                    {formatCurrency(history.openingValue)}
                  </TableCell>
                  <TableCell className="text-right text-red-400">
                    {formatCurrency(history.depreciationAmount)}
                  </TableCell>
                  <TableCell className="text-right text-green-400">
                    {formatCurrency(history.closingValue)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={history.isHistorical ? 'secondary' : 'default'}>
                      {history.isHistorical ? 'Historical' : 'System'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(history)}
                        className="text-blue-400 hover:bg-blue-500/20"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      {!history.isHistorical && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDelete(history.id)}
                          className="text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                      {asset && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onCompare(asset)}
                          className="text-yellow-400 hover:bg-yellow-500/20"
                        >
                          <Calculator className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {depreciationHistory.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No depreciation history found.</p>
        </div>
      )}
    </div>
  );
};

// History Management Tab Component
const HistoryManagementTab: React.FC<{ assets: Asset[] }> = ({ assets }) => {
  const { toast } = useToast();

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      assetHistoryManager.clearAllHistory();
      toast({
        title: 'History Cleared',
        description: 'All asset history has been cleared.',
        variant: 'destructive',
      });
    }
  };

  const handleExportFullHistory = () => {
    const allHistory = assetHistoryManager.getAllDepreciationHistory();
    const headers = ['Asset Name', 'Financial Year', 'Start Date', 'End Date', 'Opening Value', 'Depreciation', 'Closing Value', 'Method', 'Type', 'Notes'];
    
    const csvContent = [
      headers.join(','),
      ...allHistory.map(h => {
        const asset = assets.find(a => a.id === h.assetId);
        return [
          asset?.name || 'Unknown',
          h.financialYear,
          h.startDate,
          h.endDate,
          h.openingValue,
          h.depreciationAmount,
          h.closingValue,
          h.depreciationMethod,
          h.isHistorical ? 'Historical' : 'System',
          h.notes || ''
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `full-depreciation-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: 'Full depreciation history exported successfully.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white text-lg font-semibold mb-4">History Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white text-base">Export Full History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">Export complete depreciation history for all assets.</p>
              <Button
                onClick={handleExportFullHistory}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Full History
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white text-base">Clear All History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">Remove all historical data. This action cannot be undone.</p>
              <Button
                onClick={handleClearHistory}
                variant="destructive"
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Edit History Dialog Component
const EditHistoryDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: DepreciationHistory | null;
  onUpdate: (updates: Partial<DepreciationHistory>) => void;
}> = ({ open, onOpenChange, history, onUpdate }) => {
  const [formData, setFormData] = useState<Partial<DepreciationHistory>>({});

  React.useEffect(() => {
    if (history) {
      setFormData(history);
    }
  }, [history]);

  const handleSave = () => {
    if (!history) return;
    
    onUpdate({
      openingValue: Number(formData.openingValue),
      depreciationAmount: Number(formData.depreciationAmount),
      closingValue: Number(formData.closingValue),
      notes: formData.notes
    });
  };

  if (!history) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-600 text-white">
        <DialogHeader>
          <DialogTitle>Edit Depreciation History</DialogTitle>
          <DialogDescription className="text-gray-400">
            Edit depreciation values for FY {history.financialYear}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Opening Value</label>
            <Input
              type="number"
              value={formData.openingValue || ''}
              onChange={(e) => setFormData({ ...formData, openingValue: Number(e.target.value) })}
              className="bg-black/60 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Depreciation Amount</label>
            <Input
              type="number"
              value={formData.depreciationAmount || ''}
              onChange={(e) => setFormData({ ...formData, depreciationAmount: Number(e.target.value) })}
              className="bg-black/60 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Closing Value</label>
            <Input
              type="number"
              value={formData.closingValue || ''}
              onChange={(e) => setFormData({ ...formData, closingValue: Number(e.target.value) })}
              className="bg-black/60 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Notes</label>
            <Input
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-black/60 border-gray-600 text-white"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Comparison Dialog Component
const ComparisonDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
}> = ({ open, onOpenChange, asset }) => {
  const [selectedYear, setSelectedYear] = useState<string>('');

  if (!asset) return null;

  const history = assetHistoryManager.getAssetDepreciationHistory(asset.id);
  const years = [...new Set(history.map(h => h.financialYear))].sort();

  const comparison = selectedYear ? assetHistoryManager.compareSystemVsHistorical(asset.id, selectedYear) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-600 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>System vs Historical Comparison</DialogTitle>
          <DialogDescription className="text-gray-400">
            Compare system calculated depreciation with historical data for {asset.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Select Financial Year</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="bg-black/60 border-gray-600 text-white">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {comparison && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gray-800/50 border-gray-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-blue-400">Historical Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {comparison.historical ? (
                      <div className="space-y-2 text-sm">
                        <div>Opening: ₹{comparison.historical.openingValue.toLocaleString()}</div>
                        <div>Depreciation: ₹{comparison.historical.depreciationAmount.toLocaleString()}</div>
                        <div>Closing: ₹{comparison.historical.closingValue.toLocaleString()}</div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">No historical data</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-green-400">System Calculated</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {comparison.systemCalculated ? (
                      <div className="space-y-2 text-sm">
                        <div>Opening: ₹{comparison.systemCalculated.openingValue.toLocaleString()}</div>
                        <div>Depreciation: ₹{comparison.systemCalculated.depreciationAmount.toLocaleString()}</div>
                        <div>Closing: ₹{comparison.systemCalculated.closingValue.toLocaleString()}</div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">Not calculated</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {comparison.historical && comparison.systemCalculated && (
                <Card className="bg-yellow-500/10 border-yellow-500/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-yellow-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Variance Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>Difference: ₹{Math.abs(comparison.difference).toLocaleString()}</div>
                      <div>Variance: {comparison.variance.toFixed(2)}%</div>
                      <div className={`font-medium ${comparison.difference > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        System {comparison.difference > 0 ? 'higher' : 'lower'} than historical
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssetHistorySection;