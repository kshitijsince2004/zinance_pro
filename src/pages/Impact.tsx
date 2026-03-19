import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, Calculator, FileText } from 'lucide-react';
import ImpactAnalysisModule from '@/components/impact/ImpactAnalysisModule';

const Impact = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Impact Analysis</h1>
          <p className="text-dark-muted mt-2">
            Track and manage the financial impact of asset changes on depreciation calculations
          </p>
        </div>
      </div>

      <Alert className="border-blue-500/30 bg-blue-500/10">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-blue-300">
          <strong>Important:</strong> The Impact Module ensures that when asset parameters are corrected 
          (like depreciation method, useful life, etc.), the system calculates the financial impact without 
          changing past depreciation. Impact adjustments are booked in the next available month for clean 
          book maintenance.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="glass-effect border-dark-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-green-400" />
              Impact Calculation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-400">
              Automatically calculates the difference between old and new depreciation methods
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-dark-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Preserve History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-400">
              Maintains all historical depreciation calculations without retroactive changes
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-dark-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Future Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-400">
              Books impact adjustments in future months for clean financial records
            </p>
          </CardContent>
        </Card>
      </div>

      <ImpactAnalysisModule />
    </div>
  );
};

export default Impact;