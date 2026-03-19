import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { assetService, Asset } from '@/lib/assets';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import DisposalModule from '@/components/DisposalModule';
import AssetStatsCards from '@/components/assets/AssetStatsCards';
import AssetFilters from '@/components/assets/AssetFilters';
import BulkActionsBar from '@/components/assets/BulkActionsBar';
import AssetTable from '@/components/assets/AssetTable';
import DepreciationDateSelector from '@/components/assets/DepreciationDateSelector';
import FARegisterSection from '@/components/assets/FARegisterSection';
import DisposedAssetsSection from '@/components/assets/DisposedAssetsSection';
import AssetHistorySection from '@/components/assets/AssetHistorySection';
import ImpactAnalysisModule from '@/components/impact/ImpactAnalysisModule';

const Assets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const [showDisposalModal, setShowDisposalModal] = useState(false);
  const [assetToDispose, setAssetToDispose] = useState<Asset | null>(null);
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkEditData, setBulkEditData] = useState<Partial<Asset>>({});
  const [showDepreciationDateSelector, setShowDepreciationDateSelector] = useState(false);
  const [depreciationCalculationType, setDepreciationCalculationType] = useState<'single' | 'bulk'>('single');
  const [selectedAssetForDepreciation, setSelectedAssetForDepreciation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('assets');
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadAssets = () => {
      const allAssets = assetService.getAllAssets();
      const updatedAssets = allAssets.map(asset => {
        try {
          const currentValue = assetService.calculateCurrentValueByMethod(asset);
          if (currentValue !== asset.currentValue) {
            return { ...asset, currentValue };
          }
          return asset;
        } catch (error) {
          console.error(`Error updating current value for asset ${asset.id}:`, error);
          return asset;
        }
      });
      setAssets(updatedAssets);
    };

    loadAssets();
    
    const interval = setInterval(loadAssets, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const displayAssets = assets;
  const activeAssets = assets.filter(asset => asset.status !== 'sold' && asset.status !== 'retired');
  
  const filteredAssets = displayAssets.filter(asset => {
    let matchesSearch = false;
    const searchValue = searchTerm.toLowerCase();
    
    switch (searchBy) {
      case 'serial':
        matchesSearch = String(asset.serialNumber || '').toLowerCase().includes(searchValue);
        break;
      case 'qr':
        matchesSearch = String(asset.id || '').toLowerCase().includes(searchValue);
        break;
      case 'department':
        matchesSearch = String(asset.department || '').toLowerCase().includes(searchValue);
        break;
      case 'category':
        matchesSearch = String(asset.category || '').toLowerCase().includes(searchValue);
        break;
      case 'nbv':
        matchesSearch = String(asset.currentValue || '').includes(searchValue);
        break;
      case 'purchaseDate':
        matchesSearch = asset.purchaseDate ? format(new Date(asset.purchaseDate), 'dd/MM/yyyy').includes(searchValue) : false;
        break;
      case 'importDate':
        matchesSearch = asset.importMetadata?.importDate ? format(new Date(asset.importMetadata.importDate), 'dd/MM/yyyy').includes(searchValue) : false;
        break;
      default:
        matchesSearch = String(asset.name || '').toLowerCase().includes(searchValue) ||
                      String(asset.type || '').toLowerCase().includes(searchValue) ||
                      String(asset.owner || '').toLowerCase().includes(searchValue);
    }
    
    const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || asset.department === departmentFilter;
    const matchesCategory = categoryFilter === 'all' || asset.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesCategory;
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'purchaseDate':
        aValue = a.purchaseDate ? new Date(a.purchaseDate) : new Date(0);
        bValue = b.purchaseDate ? new Date(b.purchaseDate) : new Date(0);
        break;
      case 'importDate':
        aValue = a.importMetadata?.importDate ? new Date(a.importMetadata.importDate) : new Date(0);
        bValue = b.importMetadata?.importDate ? new Date(b.importMetadata.importDate) : new Date(0);
        break;
      case 'currentValue':
        aValue = a.currentValue || 0;
        bValue = b.currentValue || 0;
        break;
      case 'purchasePrice':
        aValue = a.purchasePrice || 0;
        bValue = b.purchasePrice || 0;
        break;
      default:
        aValue = String(a[sortBy as keyof Asset] || '').toLowerCase();
        bValue = String(b[sortBy as keyof Asset] || '').toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const departments = [...new Set(assets.map(asset => String(asset.department || '')))]
    .filter(dept => dept.trim() !== '');
  
  const categories = [...new Set(assets.map(asset => String(asset.category || '')))]
    .filter(cat => cat.trim() !== '');

  const handleSelectAsset = (assetId: string, checked: boolean) => {
    if (checked) {
      setSelectedAssets([...selectedAssets, assetId]);
    } else {
      setSelectedAssets(selectedAssets.filter(id => id !== assetId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssets(sortedAssets.map(asset => asset.id));
    } else {
      setSelectedAssets([]);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedAssets.length === 0) {
      toast({
        title: 'No Assets Selected',
        description: 'Please select assets to perform bulk actions.',
        variant: 'destructive',
      });
      return;
    }

    switch (action) {
      case 'edit':
        setShowBulkEditDialog(true);
        break;
      case 'delete':
        setShowBulkDeleteDialog(true);
        break;
      case 'verify':
        handleBulkVerify();
        break;
      case 'export':
        handleBulkExport();
        break;
      case 'transfer':
        handleBulkTransfer();
        break;
      case 'dispose':
        handleBulkDispose();
        break;
      case 'depreciation':
        setDepreciationCalculationType('bulk');
        setShowDepreciationDateSelector(true);
        break;
      default:
        break;
    }
  };

  const handleBulkEdit = () => {
    selectedAssets.forEach(assetId => {
      try {
        assetService.updateAsset(assetId, bulkEditData);
      } catch (error) {
        console.error(`Failed to update asset ${assetId}:`, error);
      }
    });
    
    setAssets(assetService.getAllAssets());
    setShowBulkEditDialog(false);
    setBulkEditData({});
    setSelectedAssets([]);
    
    toast({
      title: 'Assets Updated',
      description: `Successfully updated ${selectedAssets.length} assets.`,
    });
  };

  const handleBulkDelete = () => {
    let successCount = 0;
    let errorCount = 0;

    selectedAssets.forEach(assetId => {
      try {
        assetService.deleteAsset(assetId);
        successCount++;
      } catch (error) {
        console.error(`Failed to delete asset ${assetId}:`, error);
        errorCount++;
      }
    });

    setAssets(assetService.getAllAssets());
    setShowBulkDeleteDialog(false);
    setSelectedAssets([]);

    toast({
      title: 'Bulk Delete Complete',
      description: `Successfully deleted ${successCount} assets${errorCount > 0 ? `, ${errorCount} failed` : ''}.`,
      variant: errorCount > 0 ? 'destructive' : 'default',
    });
  };

  const handleBulkVerify = () => {
    assetService.bulkVerifyAssets(selectedAssets);
    setAssets(assetService.getAllAssets());
    toast({
      title: 'Assets Verified',
      description: `Successfully verified ${selectedAssets.length} assets.`,
    });
    setSelectedAssets([]);
  };

  const handleBulkExport = () => {
    const selectedAssetData = assets.filter(asset => selectedAssets.includes(asset.id));
    const headers = ['Name', 'Type', 'Serial Number', 'Department', 'Purchase Price', 'Current Value', 'Status'];
    const csvContent = [
      headers.join(','),
      ...selectedAssetData.map(asset => [
        asset.name || '',
        asset.type || '',
        asset.serialNumber || '',
        asset.department || '',
        asset.purchasePrice || 0,
        asset.currentValue || 0,
        asset.status || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected-assets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `Exported ${selectedAssets.length} assets to CSV.`,
    });
    setSelectedAssets([]);
  };

  const handleBulkTransfer = () => {
    toast({
      title: 'Transfer Initiated',
      description: `Transfer process started for ${selectedAssets.length} assets.`,
    });
    setSelectedAssets([]);
  };

  const handleBulkDispose = () => {
    selectedAssets.forEach(assetId => {
      try {
        assetService.disposeAsset(assetId, 'writeoff');
      } catch (error) {
        console.error(`Failed to dispose asset ${assetId}:`, error);
      }
    });

    setAssets(assetService.getAllAssets());
    toast({
      title: 'Assets Disposed',
      description: `Successfully disposed ${selectedAssets.length} assets.`,
    });
    setSelectedAssets([]);
  };

  const handleDeleteAsset = (id: string) => {
    setAssetToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDisposeAsset = (asset: Asset) => {
    setAssetToDispose(asset);
    setShowDisposalModal(true);
  };

  const confirmDelete = () => {
    if (assetToDelete) {
      try {
        assetService.deleteAsset(assetToDelete);
        setAssets(assetService.getAllAssets());
        toast({
          title: 'Asset Deleted',
          description: 'Asset has been successfully deleted.',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete asset.',
          variant: 'destructive',
        });
      }
    }
    setIsDeleteDialogOpen(false);
    setAssetToDelete(null);
  };

  const handleCalculateDepreciation = (assetId: string) => {
    setSelectedAssetForDepreciation(assetId);
    setDepreciationCalculationType('single');
    setShowDepreciationDateSelector(true);
  };

  const handleDepreciationCalculation = (startDate: Date, endDate: Date, type: string) => {
    if (depreciationCalculationType === 'bulk') {
      const assetsToCalculate = assets.filter(asset => selectedAssets.includes(asset.id));
      
      toast({
        title: 'Bulk Depreciation Calculation',
        description: `Calculating depreciation for ${assetsToCalculate.length} assets from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      });

      navigate(`/calculations?bulkAssets=${selectedAssets.join(',')}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&type=${encodeURIComponent(type)}`);
    } else if (selectedAssetForDepreciation) {
      navigate(`/calculations?asset=${selectedAssetForDepreciation}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&type=${encodeURIComponent(type)}`);
    }

    setShowDepreciationDateSelector(false);
    setSelectedAssetForDepreciation(null);
    if (depreciationCalculationType === 'bulk') {
      setSelectedAssets([]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Asset Management</h1>
          <p className="text-gray-400">Manage and track all fixed assets</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto border-green-500/30 text-white hover:bg-green-500/20 bg-black/80">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {authService.hasPermission('write', 'assets') && (
            <Link to="/assets/new" className="w-full sm:w-auto">
              <Button className="w-full bg-green-500 hover:bg-green-600 text-black">
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-black/60 border-green-500/20">
          <TabsTrigger value="assets" className="text-white data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            All Assets
          </TabsTrigger>
          <TabsTrigger value="fa-register" className="text-white data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            FA Register
          </TabsTrigger>
          <TabsTrigger value="disposed" className="text-white data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            Disposed Assets
          </TabsTrigger>
          <TabsTrigger value="history" className="text-white data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            Asset History
          </TabsTrigger>
          <TabsTrigger value="impact" className="text-white data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
            Impact Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-6">
          <AssetStatsCards assets={activeAssets} departments={departments} />

          <AssetFilters
            searchBy={searchBy}
            setSearchBy={setSearchBy}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            departments={departments}
            categories={categories}
            onBulkAction={handleBulkAction}
          />

          <BulkActionsBar
            selectedAssets={selectedAssets}
            onBulkEdit={handleBulkEdit}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedAssets([])}
          />

          <AssetTable
            assets={sortedAssets}
            selectedAssets={selectedAssets}
            onSelectAsset={handleSelectAsset}
            onSelectAll={handleSelectAll}
            onCalculateDepreciation={handleCalculateDepreciation}
            onDisposeAsset={handleDisposeAsset}
            onDeleteAsset={handleDeleteAsset}
          />
        </TabsContent>

        <TabsContent value="fa-register" className="space-y-6">
          <FARegisterSection assets={activeAssets} />
        </TabsContent>

        <TabsContent value="disposed" className="space-y-6">
          <DisposedAssetsSection assets={assets} />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <AssetHistorySection assets={assets} />
        </TabsContent>

        <TabsContent value="impact" className="space-y-6">
          <ImpactAnalysisModule />
        </TabsContent>
      </Tabs>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Delete</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this asset? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkEditDialog} onOpenChange={setShowBulkEditDialog}>
        <DialogContent className="bg-gray-900 border-gray-600 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Selected Assets ({selectedAssets.length})</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update common fields for all selected assets. Leave fields empty to keep existing values.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Department</label>
                <Input
                  value={bulkEditData.department || ''}
                  onChange={(e) => setBulkEditData({...bulkEditData, department: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Keep existing"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Owner</label>
                <Input
                  value={bulkEditData.owner || ''}
                  onChange={(e) => setBulkEditData({...bulkEditData, owner: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Keep existing"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Location</label>
                <Input
                  value={bulkEditData.location || ''}
                  onChange={(e) => setBulkEditData({...bulkEditData, location: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Keep existing"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Status</label>
                <Select value={bulkEditData.status || ''} onValueChange={(value) => setBulkEditData({...bulkEditData, status: value as Asset['status']})}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Keep existing" />
                  </SelectTrigger>
                  <SelectContent className="bg-black/90 border-green-500/30">
                    <SelectItem value="active" className="text-white hover:bg-green-500/20">Active</SelectItem>
                    <SelectItem value="retired" className="text-white hover:bg-orange-500/20">Retired</SelectItem>
                    <SelectItem value="sold" className="text-white hover:bg-red-500/20">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkEditDialog(false);
                setBulkEditData({});
              }}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkEdit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Update Assets
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent className="bg-gray-900 border-gray-600">
          <DialogHeader>
            <DialogTitle className="text-white">Confirm Bulk Delete</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete {selectedAssets.length} selected assets? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowBulkDeleteDialog(false)}
              className="border-gray-600 text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedAssets.length} Assets
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showDepreciationDateSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4">
            <DepreciationDateSelector
              onCalculate={handleDepreciationCalculation}
              onClose={() => {
                setShowDepreciationDateSelector(false);
                setSelectedAssetForDepreciation(null);
              }}
            />
          </div>
        </div>
      )}

      {showDisposalModal && assetToDispose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <DisposalModule
              asset={assetToDispose}
              onDispose={() => {
                setAssets(assetService.getAllAssets());
                setShowDisposalModal(false);
                setAssetToDispose(null);
              }}
              onClose={() => {
                setShowDisposalModal(false);
                setAssetToDispose(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
