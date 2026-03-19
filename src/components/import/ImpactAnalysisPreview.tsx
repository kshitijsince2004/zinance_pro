import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HistoricalImportData } from '@/types/historical-asset';
import { Calculator, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface ImpactAnalysisPreviewProps {
  data: HistoricalImportData[];
  onCalculationCompleted: () => void;
}

interface ImpactSummary {
  totalAssets: number;
  assetsWithImpact: number;
  totalImpactAmount: number;
  underDepreciatedAssets: number;
  overDepreciatedAssets: number;
  averageImpactPercentage: number;
  highImpactAssets: number; // Assets with impact > 10% of asset value
}

export const ImpactAnalysisPreview: React.FC<ImpactAnalysisPreviewProps> = ({
  data,
  onCalculationCompleted
}) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationProgress, setCalculationProgress] = useState(0);
  const [impactSummary, setImpactSummary] = useState<ImpactSummary | null>(null);
  const [detailedImpacts, setDetailedImpacts] = useState<any[]>([]);

  useEffect(() => {
    calculateImpacts();
  }, [data]);

  const calculateImpacts = async () => {
    setIsCalculating(true);
    setCalculationProgress(0);

    const impacts: any[] = [];
    let totalImpactAmount = 0;
    let underDepreciatedCount = 0;
    let overDepreciatedCount = 0;
    let highImpactCount = 0;

    for (let i = 0; i < data.length; i++) {
      const asset = data[i];
      
      // Simulate calculation delay for progress bar
      await new Promise(resolve => setTimeout(resolve, 10));
      setCalculationProgress(((i + 1) / data.length) * 100);

      // Calculate historical vs correct depreciation
      const historicalDepreciation = calculateHistoricalDepreciation(asset);
      const correctDepreciation = calculateCorrectDepreciation(asset);
      const impactAmount = correctDepreciation - historicalDepreciation;
      const impactPercentage = (Math.abs(impactAmount) / asset.purchase_price) * 100;

      const impact = {
        asset_name: asset.asset_name,
        purchase_price: asset.purchase_price,
        historical_depreciation: historicalDepreciation,
        correct_depreciation: correctDepreciation,
        impact_amount: impactAmount,
        impact_percentage: impactPercentage,
        impact_type: impactAmount > 0 ? 'UNDER_DEPRECIATED' : impactAmount < 0 ? 'OVER_DEPRECIATED' : 'NO_IMPACT',
        requires_approval: Math.abs(impactAmount) > 1000 || impactPercentage > 5
      };

      impacts.push(impact);
      totalImpactAmount += Math.abs(impactAmount);

      if (impactAmount > 0) underDepreciatedCount++;
      if (impactAmount < 0) overDepreciatedCount++;
      if (impactPercentage > 10) highImpactCount++;
    }

    const summary: ImpactSummary = {
      totalAssets: data.length,
      assetsWithImpact: impacts.filter(i => Math.abs(i.impact_amount) > 10).length,
      totalImpactAmount,
      underDepreciatedAssets: underDepreciatedCount,
      overDepreciatedAssets: overDepreciatedCount,
      averageImpactPercentage: impacts.reduce((sum, i) => sum + i.impact_percentage, 0) / impacts.length,
      highImpactAssets: highImpactCount
    };

    setImpactSummary(summary);
    setDetailedImpacts(impacts);
    setIsCalculating(false);
  };

  const calculateHistoricalDepreciation = (asset: HistoricalImportData): number => {
    // Sum up all historical depreciation from year-wise data
    return Object.values(asset.year_wise_data || {}).reduce((total, yearData) => {
      return total + (yearData.depreciation || 0);
    }, 0);
  };

  const calculateCorrectDepreciation = (asset: HistoricalImportData): number => {
    // Simple calculation based on correct method and parameters
    // In real implementation, this would use the enhanced depreciation calculator
    const yearsElapsed = calculateYearsElapsed(asset.purchase_date);
    
    switch (asset.correct_method) {
      case 'SLM':
        return (asset.purchase_price * asset.correct_rate * yearsElapsed) / 100;
      case 'WDV':
        const rate = asset.correct_rate / 100;
        return asset.purchase_price * (1 - Math.pow(1 - rate, yearsElapsed));
      default:
        return (asset.purchase_price * asset.correct_rate * yearsElapsed) / 100;
    }
  };

  const calculateYearsElapsed = (purchaseDate: string): number => {
    const purchase = new Date(purchaseDate);
    const now = new Date();
    return (now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24 * 365);
  };

  const getImpactBadgeVariant = (impactType: string) => {
    switch (impactType) {
      case 'UNDER_DEPRECIATED':
        return 'destructive';
      case 'OVER_DEPRECIATED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getImpactIcon = (impactType: string) => {
    switch (impactType) {
      case 'UNDER_DEPRECIATED':
        return <TrendingUp className="h-4 w-4" />;
      case 'OVER_DEPRECIATED':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Impact Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isCalculating ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Calculating depreciation impacts...
                </p>
                <Progress value={calculationProgress} className="w-full" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(calculationProgress)}% complete
                </p>
              </div>
            </div>
          ) : impactSummary ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{impactSummary.totalAssets}</div>
                  <div className="text-sm text-muted-foreground">Total Assets</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{impactSummary.assetsWithImpact}</div>
                  <div className="text-sm text-muted-foreground">Assets with Impact</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    ₹{impactSummary.totalImpactAmount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Impact Amount</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">Under-depreciated Assets</span>
                  <Badge variant="destructive">{impactSummary.underDepreciatedAssets}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">Over-depreciated Assets</span>
                  <Badge variant="secondary">{impactSummary.overDepreciatedAssets}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">High Impact Assets (&gt;10%)</span>
                  <Badge variant="outline">{impactSummary.highImpactAssets}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">Average Impact %</span>
                  <Badge variant="outline">{impactSummary.averageImpactPercentage.toFixed(2)}%</Badge>
                </div>
              </div>

              {impactSummary.highImpactAssets > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {impactSummary.highImpactAssets} assets have high impact (&gt;10% of asset value) and will require management approval.
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : null}
        </CardContent>
      </Card>

      {detailedImpacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Impact Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Historical Dep.</TableHead>
                    <TableHead>Correct Dep.</TableHead>
                    <TableHead>Impact Amount</TableHead>
                    <TableHead>Impact %</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Approval</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailedImpacts.slice(0, 20).map((impact, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{impact.asset_name}</TableCell>
                      <TableCell>₹{impact.purchase_price.toLocaleString('en-IN')}</TableCell>
                      <TableCell>₹{impact.historical_depreciation.toLocaleString('en-IN')}</TableCell>
                      <TableCell>₹{impact.correct_depreciation.toLocaleString('en-IN')}</TableCell>
                      <TableCell className={impact.impact_amount > 0 ? 'text-red-600' : 'text-green-600'}>
                        ₹{Math.abs(impact.impact_amount).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>{impact.impact_percentage.toFixed(2)}%</TableCell>
                      <TableCell>
                        <Badge variant={getImpactBadgeVariant(impact.impact_type)} className="flex items-center space-x-1">
                          {getImpactIcon(impact.impact_type)}
                          <span>{impact.impact_type.replace('_', ' ')}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {impact.requires_approval ? (
                          <Badge variant="outline">Required</Badge>
                        ) : (
                          <Badge variant="secondary">Auto</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {detailedImpacts.length > 20 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        ... and {detailedImpacts.length - 20} more assets
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          Back
        </Button>
        <Button 
          onClick={onCalculationCompleted}
          disabled={isCalculating}
          className="flex items-center space-x-2"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Proceed to Confirmation</span>
        </Button>
      </div>
    </div>
  );
};