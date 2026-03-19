
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Calculator, Edit, Archive, Trash2 } from 'lucide-react';
import { Asset } from '@/lib/assets';
import { authService } from '@/lib/auth';
import { depreciationCalculator } from '@/lib/depreciation/calculations';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface AssetTableProps {
  assets: Asset[];
  selectedAssets: string[];
  onSelectAsset: (assetId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onCalculateDepreciation: (assetId: string) => void;
  onDisposeAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
}

const AssetTable: React.FC<AssetTableProps> = ({
  assets,
  selectedAssets,
  onSelectAsset,
  onSelectAll,
  onCalculateDepreciation,
  onDisposeAsset,
  onDeleteAsset
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Active</Badge>;
      case 'retired':
        return <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">Retired</Badge>;
      case 'sold':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Sold</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '₹0';
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Calculate real-time current value for each asset
  const getCurrentValue = (asset: Asset): number => {
    try {
      return depreciationCalculator.calculateCurrentValueByMethod(asset);
    } catch (error) {
      console.error(`Error calculating current value for asset ${asset.id}:`, error);
      return asset.currentValue || asset.purchasePrice || 0;
    }
  };

  // Check if asset is disposed (sold or retired)
  const isDisposed = (asset: Asset) => {
    return asset.status === 'sold' || asset.status === 'retired';
  };

  return (
    <Card className="bg-black/60 border-green-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Assets ({assets.length})</span>
          <Checkbox
            checked={selectedAssets.length === assets.length && assets.length > 0}
            onCheckedChange={onSelectAll}
            className="border-green-500"
          />
        </CardTitle>
        <CardDescription className="text-gray-400">
          Complete list of assets with advanced filtering and bulk actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-600 hover:bg-gray-800/50">
                <TableHead className="text-gray-300">Select</TableHead>
                <TableHead className="text-gray-300">Asset</TableHead>
                <TableHead className="text-gray-300">Serial Number</TableHead>
                <TableHead className="text-gray-300">Type</TableHead>
                <TableHead className="text-gray-300">Owner</TableHead>
                <TableHead className="text-gray-300">Department</TableHead>
                <TableHead className="text-gray-300">Purchase Date</TableHead>
                <TableHead className="text-gray-300">Import Date</TableHead>
                <TableHead className="text-gray-300">Current Value</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => {
                const currentValue = getCurrentValue(asset);
                const disposed = isDisposed(asset);
                return (
                  <TableRow 
                    key={asset.id} 
                    className={`border-gray-600 hover:bg-gray-800/30 ${disposed ? 'opacity-75' : ''}`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedAssets.includes(asset.id)}
                        onCheckedChange={(checked) => onSelectAsset(asset.id, checked as boolean)}
                        className="border-green-500"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className={`font-medium ${disposed ? 'text-gray-400' : 'text-white'}`}>
                          {asset.name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-400">{asset.category || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell className={disposed ? 'text-gray-400' : 'text-white'}>
                      {asset.serialNumber || 'N/A'}
                    </TableCell>
                    <TableCell className={disposed ? 'text-gray-400' : 'text-white'}>
                      {asset.type || 'N/A'}
                    </TableCell>
                    <TableCell className={disposed ? 'text-gray-400' : 'text-white'}>
                      {asset.owner || 'N/A'}
                    </TableCell>
                    <TableCell className={disposed ? 'text-gray-400' : 'text-white'}>
                      {asset.department || 'N/A'}
                    </TableCell>
                    <TableCell className={disposed ? 'text-gray-400' : 'text-white'}>
                      {asset.purchaseDate ? format(new Date(asset.purchaseDate), 'dd/MM/yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className={disposed ? 'text-gray-400' : 'text-white'}>
                      {asset.importMetadata?.importDate ? format(new Date(asset.importMetadata.importDate), 'dd/MM/yyyy') : 'N/A'}
                    </TableCell>
                    <TableCell className={`font-medium ${disposed ? 'text-gray-500' : 'text-green-500'}`}>
                      {formatCurrency(currentValue)}
                    </TableCell>
                    <TableCell>{getStatusBadge(asset.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/assets/${asset.id}`)}
                          className="text-green-500 hover:bg-green-500/20"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {/* Only show depreciation calculation for active assets */}
                        {!disposed && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCalculateDepreciation(asset.id)}
                            className="text-blue-500 hover:bg-blue-500/20"
                            title="Calculate Depreciation"
                          >
                            <Calculator className="w-4 h-4" />
                          </Button>
                        )}
                        {authService.hasPermission('write', 'assets') && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/assets/${asset.id}/edit`)}
                              className="text-orange-500 hover:bg-orange-500/20"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {/* Only show dispose option for active assets */}
                            {!disposed && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDisposeAsset(asset)}
                                className="text-yellow-500 hover:bg-yellow-500/20"
                                title="Dispose Asset"
                              >
                                <Archive className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteAsset(asset.id)}
                              className="text-red-500 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
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
  );
};

export default AssetTable;
