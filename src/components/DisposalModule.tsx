
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Archive, Calculator, FileText, AlertTriangle, IndianRupee, X, History, TrendingDown } from 'lucide-react';
import { Asset, assetService } from '@/lib/assets';
import EnhancedDatePicker from './EnhancedDatePicker';
import { depreciationCalculator } from '@/lib/depreciation/calculations';

interface DisposalModuleProps {
  asset: Asset;
  onDispose: () => void;
  onClose: () => void;
}

const DisposalModule: React.FC<DisposalModuleProps> = ({ asset, onDispose, onClose }) => {
  const { toast } = useToast();
  const [disposalData, setDisposalData] = useState({
    disposalDate: new Date(),
    disposalMethod: 'sale' as 'sale' | 'writeoff' | 'transfer' | 'scrap',
    salePrice: 0,
    buyerName: '',
    buyerContact: '',
    disposalReason: '',
    notes: ''
  });

  // Calculate disposal P&L - now with useEffect to recalculate when disposal method or price changes
  const [plData, setPlData] = useState({
    bookValueAtDisposal: 0,
    salePrice: 0,
    profitLoss: 0,
    totalDepreciation: 0,
    isProfit: false,
    isLoss: false
  });

  const [assetHistory, setAssetHistory] = useState<Array<{
    year: number;
    startDate: Date;
    endDate: Date;
    openingValue: number;
    depreciation: number;
    closingValue: number;
    cumulativeDepreciation: number;
  }>>([]);

  const calculateDisposalPL = () => {
    const disposalDate = disposalData.disposalDate;
    const putToUseDate = new Date(asset.putToUseDate || asset.purchaseDate);
    
    // Calculate book value at disposal date using the depreciation calculator
    const bookValueAtDisposal = depreciationCalculator.calculateCurrentValueByMethod({
      ...asset,
      soldDate: disposalDate.toISOString().split('T')[0],
      status: 'sold'
    });

    // Adjust sale price based on disposal method
    let effectiveSalePrice = 0;
    switch (disposalData.disposalMethod) {
      case 'sale':
      case 'transfer':
        effectiveSalePrice = disposalData.salePrice;
        break;
      case 'writeoff':
      case 'scrap':
        effectiveSalePrice = 0; // No recovery value for writeoff/scrap
        break;
    }

    const profitLoss = effectiveSalePrice - bookValueAtDisposal;
    const totalDepreciation = asset.purchasePrice - bookValueAtDisposal;

    return {
      bookValueAtDisposal,
      salePrice: effectiveSalePrice,
      profitLoss,
      totalDepreciation,
      isProfit: profitLoss > 0,
      isLoss: profitLoss < 0
    };
  };

  // Calculate asset history for display
  const calculateAssetHistory = () => {
    const putToUseDate = new Date(asset.putToUseDate || asset.purchaseDate);
    const disposalDate = disposalData.disposalDate;
    const usefulLife = asset.usefulLife || 5;
    
    const history = [];
    let bookValue = asset.purchasePrice;
    let cumulativeDepreciation = 0;
    let currentDate = new Date(putToUseDate);
    let year = 1;

    while (currentDate < disposalDate && year <= Math.ceil(usefulLife)) {
      const yearStart = new Date(currentDate);
      const yearEnd = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate());
      const effectiveEnd = yearEnd > disposalDate ? disposalDate : yearEnd;
      
      const openingValue = bookValue;
      
      // Calculate depreciation for this period
      const daysInPeriod = Math.floor((effectiveEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24));
      const daysInYear = 365.25;
      
      let periodDepreciation = 0;
      
      switch (asset.depreciationMethod) {
        case 'SLM':
          const annualSLMDepreciation = (asset.purchasePrice - asset.residualValue) / usefulLife;
          periodDepreciation = annualSLMDepreciation * (daysInPeriod / daysInYear);
          break;
        case 'WDV':
          const wdvRate = depreciationCalculator.calculateWDVRate(asset.purchasePrice, asset.residualValue, usefulLife);
          periodDepreciation = bookValue * (wdvRate / 100) * (daysInPeriod / daysInYear);
          break;
        case 'WDV_FIXED_SLAB':
          // For WDV Fixed Slab, apply full year depreciation
          const rate = 20; // Default rate, should be fetched from constants
          periodDepreciation = bookValue * (rate / 100);
          break;
        default:
          const annualDepreciation = (asset.purchasePrice - asset.residualValue) / usefulLife;
          periodDepreciation = annualDepreciation * (daysInPeriod / daysInYear);
      }
      
      periodDepreciation = Math.min(periodDepreciation, bookValue - asset.residualValue);
      periodDepreciation = Math.max(0, periodDepreciation);
      
      const closingValue = Math.max(bookValue - periodDepreciation, asset.residualValue);
      cumulativeDepreciation += periodDepreciation;
      
      history.push({
        year,
        startDate: yearStart,
        endDate: effectiveEnd,
        openingValue,
        depreciation: periodDepreciation,
        closingValue,
        cumulativeDepreciation
      });
      
      bookValue = closingValue;
      currentDate = new Date(yearEnd);
      year++;
      
      if (bookValue <= asset.residualValue) break;
    }
    
    return history;
  };

  // Recalculate P&L whenever disposal data changes
  useEffect(() => {
    const newPlData = calculateDisposalPL();
    setPlData(newPlData);
    
    const history = calculateAssetHistory();
    setAssetHistory(history);
  }, [disposalData.disposalMethod, disposalData.salePrice, disposalData.disposalDate]);

  const handleDispose = async () => {
    try {
      // Update asset with disposal information
      const updatedAsset = {
        ...asset,
        status: 'sold' as const,
        soldDate: disposalData.disposalDate.toISOString().split('T')[0],
        notes: asset.notes ? 
          `${asset.notes}\n\nDisposed on ${disposalData.disposalDate.toLocaleDateString()}: ${disposalData.disposalReason}` :
          `Disposed on ${disposalData.disposalDate.toLocaleDateString()}: ${disposalData.disposalReason}`
      };

      assetService.updateAsset(asset.id, updatedAsset);

      // Log disposal activity with P&L information
      assetService.addActivity(
        `Asset Disposed (${disposalData.disposalMethod}) - ${plData.isProfit ? 'Profit' : plData.isLoss ? 'Loss' : 'Break Even'}: ₹${Math.abs(plData.profitLoss).toLocaleString()}`,
        asset.id,
        asset.name,
        'System',
        'warning'
      );

      toast({
        title: 'Asset Disposed',
        description: `${asset.name} has been successfully disposed of with ${plData.isProfit ? 'profit' : plData.isLoss ? 'loss' : 'break even'} of ₹${Math.abs(plData.profitLoss).toLocaleString()}.`,
      });

      onDispose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to dispose asset.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-red-500/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Archive className="w-5 h-5 text-orange-400" />
              Asset Disposal - {asset.name}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-sm text-gray-400">
            Current Book Value: ₹{asset.currentValue.toLocaleString()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Disposal Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Disposal Date *</Label>
                <EnhancedDatePicker
                  date={disposalData.disposalDate}
                  onDateChange={(date) => setDisposalData(prev => ({ ...prev, disposalDate: date || new Date() }))}
                  placeholder="Select disposal date"
                  maxDate={new Date()} // Prevent future dates
                />
                <p className="text-xs text-gray-400">Cannot select future dates</p>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Disposal Method *</Label>
                <Select 
                  value={disposalData.disposalMethod} 
                  onValueChange={(value: any) => setDisposalData(prev => ({ ...prev, disposalMethod: value }))}
                >
                  <SelectTrigger className="bg-black border-green-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-green-500/40">
                    <SelectItem value="sale" className="text-white hover:bg-green-500/20">Sale</SelectItem>
                    <SelectItem value="writeoff" className="text-white hover:bg-green-500/20">Write-off</SelectItem>
                    <SelectItem value="transfer" className="text-white hover:bg-green-500/20">Transfer</SelectItem>
                    <SelectItem value="scrap" className="text-white hover:bg-green-500/20">Scrap</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(disposalData.disposalMethod === 'sale' || disposalData.disposalMethod === 'transfer') && (
                <>
                  <div className="space-y-2">
                    <Label className="text-white">Sale/Transfer Price (₹) *</Label>
                    <Input
                      type="number"
                      value={disposalData.salePrice}
                      onChange={(e) => setDisposalData(prev => ({ ...prev, salePrice: parseFloat(e.target.value) || 0 }))}
                      className="bg-black border-green-500/30 text-white"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Buyer/Transferee Name</Label>
                    <Input
                      value={disposalData.buyerName}
                      onChange={(e) => setDisposalData(prev => ({ ...prev, buyerName: e.target.value }))}
                      className="bg-black border-green-500/30 text-white"
                      placeholder="Enter buyer name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Contact Information</Label>
                    <Input
                      value={disposalData.buyerContact}
                      onChange={(e) => setDisposalData(prev => ({ ...prev, buyerContact: e.target.value }))}
                      className="bg-black border-green-500/30 text-white"
                      placeholder="Phone/Email"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-white">Disposal Reason *</Label>
              <Input
                value={disposalData.disposalReason}
                onChange={(e) => setDisposalData(prev => ({ ...prev, disposalReason: e.target.value }))}
                className="bg-black border-green-500/30 text-white"
                placeholder="e.g., End of useful life, damaged beyond repair, upgrade"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Additional Notes</Label>
              <Textarea
                value={disposalData.notes}
                onChange={(e) => setDisposalData(prev => ({ ...prev, notes: e.target.value }))}
                className="bg-black border-green-500/30 text-white"
                placeholder="Any additional notes about the disposal"
                rows={3}
              />
            </div>
          </div>

          {/* P&L Calculation */}
          <Card className="bg-black/50 border-yellow-500/30">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center gap-2 text-lg">
                <Calculator className="w-5 h-5" />
                Profit & Loss Calculation
                {disposalData.disposalMethod === 'writeoff' || disposalData.disposalMethod === 'scrap' ? (
                  <Badge variant="outline" className="border-orange-400 text-orange-400 ml-2">
                    No Recovery Value
                  </Badge>
                ) : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Original Cost:</span>
                    <span className="text-white">₹{asset.purchasePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Depreciation:</span>
                    <span className="text-red-400">₹{plData.totalDepreciation.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-600 pt-2">
                    <span className="text-gray-400">Book Value at Disposal:</span>
                    <span className="text-white font-semibold">₹{plData.bookValueAtDisposal.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      {disposalData.disposalMethod === 'sale' ? 'Sale Price:' : 
                       disposalData.disposalMethod === 'transfer' ? 'Transfer Price:' : 
                       'Recovery Value:'}
                    </span>
                    <span className="text-white">₹{plData.salePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-600 pt-2">
                    <span className="text-gray-400">Profit/Loss:</span>
                    <span className={`font-semibold ${plData.isProfit ? 'text-green-400' : plData.isLoss ? 'text-red-400' : 'text-white'}`}>
                      {plData.isProfit ? '+' : ''}₹{plData.profitLoss.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-center pt-2">
                    <Badge 
                      variant="outline" 
                      className={`${plData.isProfit ? 'border-green-400 text-green-400' : plData.isLoss ? 'border-red-400 text-red-400' : 'border-gray-400 text-gray-400'}`}
                    >
                      {plData.isProfit ? 'Profit on Disposal' : plData.isLoss ? 'Loss on Disposal' : 'Break Even'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asset History */}
          <Card className="bg-black/50 border-blue-500/30">
            <CardHeader>
              <CardTitle className="text-blue-400 flex items-center gap-2 text-lg">
                <History className="w-5 h-5" />
                Asset Depreciation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-2 text-gray-400">Year</th>
                      <th className="text-left py-2 text-gray-400">Period</th>
                      <th className="text-right py-2 text-gray-400">Opening Value</th>
                      <th className="text-right py-2 text-gray-400">Depreciation</th>
                      <th className="text-right py-2 text-gray-400">Closing Value</th>
                      <th className="text-right py-2 text-gray-400">Cumulative Dep.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assetHistory.map((year, index) => (
                      <tr key={index} className="border-b border-gray-700/50">
                        <td className="py-2 text-white">{year.year}</td>
                        <td className="py-2 text-gray-300">
                          <div className="text-xs">
                            {year.startDate.toLocaleDateString()} - {year.endDate.toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-2 text-right text-white">₹{year.openingValue.toLocaleString()}</td>
                        <td className="py-2 text-right text-red-400">₹{year.depreciation.toLocaleString()}</td>
                        <td className="py-2 text-right text-green-400">₹{year.closingValue.toLocaleString()}</td>
                        <td className="py-2 text-right text-orange-400">₹{year.cumulativeDepreciation.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Warning */}
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <div className="text-sm text-red-400">
              <strong>Warning:</strong> This action cannot be undone. The asset will be marked as disposed and removed from active inventory.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-500/30 text-gray-400 hover:bg-gray-500/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDispose}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              disabled={!disposalData.disposalMethod || !disposalData.disposalReason}
            >
              <Archive className="w-4 h-4 mr-2" />
              Dispose Asset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DisposalModule;
