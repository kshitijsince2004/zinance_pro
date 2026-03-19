
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardWidgets } from '@/components/reports/DashboardWidgets';
import { ComparisonModule } from '@/components/reports/ComparisonModule';
import { TrendAnalysis } from '@/components/reports/TrendAnalysis';
import { ReportsFilters } from '@/components/reports/ReportsFilters';
import { ExportModule } from '@/components/reports/ExportModule';
import { assetService } from '@/lib/assets';
import { reportsService } from '@/lib/reports-service';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'comparison' | 'trends'>('dashboard');
  const [filters, setFilters] = useState({
    financialYear: new Date().getFullYear(),
    companies: [] as string[],
    departments: [] as string[],
    assetStatus: 'all',
    assetClasses: [] as string[],
    verificationStatus: 'all',
    serviceStatus: 'all'
  });

  const assets = useMemo(() => assetService.getAllAssets(), []);
  const companies = useMemo(() => assetService.getAllCompanies(), []);
  
  const filteredData = useMemo(() => {
    return reportsService.getFilteredReportsData(assets, filters);
  }, [assets, filters]);

  const uniqueCompanies = useMemo(() => 
    [...new Set(assets.map(a => a.company))], [assets]
  );
  
  const uniqueDepartments = useMemo(() => 
    [...new Set(assets.map(a => a.department))], [assets]
  );
  
  const uniqueAssetClasses = useMemo(() => 
    [...new Set(assets.map(a => a.category))], [assets]
  );

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">Reports & Trends</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Comprehensive asset analytics, comparisons, and trends dashboard
          </p>
        </div>
        <div className="w-full lg:w-auto">
          <ExportModule 
            data={filteredData}
            filters={filters}
            activeTab={activeTab}
          />
        </div>
      </div>

      <Card className="border border-green-500/20 bg-black/60">
        <CardContent className="p-3 sm:p-4 lg:pt-6">
          <ReportsFilters
            filters={filters}
            setFilters={setFilters}
            uniqueCompanies={uniqueCompanies}
            uniqueDepartments={uniqueDepartments}
            uniqueAssetClasses={uniqueAssetClasses}
          />
        </CardContent>
      </Card>

      <Card className="border border-green-500/20 bg-black/60 overflow-hidden">
        <CardContent className="p-0">
          <div className="w-full">
            <Tabs 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as typeof activeTab)}
              className="w-full"
            >
              <div className="w-full overflow-x-auto px-3 sm:px-4">
                <TabsList className="grid w-full grid-cols-3 min-w-[300px]">
                  <TabsTrigger value="dashboard" className="text-xs sm:text-sm">Dashboard</TabsTrigger>
                  <TabsTrigger value="comparison" className="text-xs sm:text-sm">Comparison</TabsTrigger>
                  <TabsTrigger value="trends" className="text-xs sm:text-sm">Trends</TabsTrigger>
                </TabsList>
              </div>

              <div className="p-3 sm:p-4 w-full">
                <TabsContent 
                  value="dashboard" 
                  className="mt-0 w-full"
                >
                  <div className="w-full">
                    <DashboardWidgets data={filteredData} filters={filters} />
                  </div>
                </TabsContent>

                <TabsContent 
                  value="comparison" 
                  className="mt-0 w-full"
                >
                  <div className="w-full">
                    <ComparisonModule 
                      data={filteredData} 
                      filters={filters}
                      uniqueCompanies={uniqueCompanies}
                      uniqueDepartments={uniqueDepartments}
                    />
                  </div>
                </TabsContent>

                <TabsContent 
                  value="trends" 
                  className="mt-0 w-full"
                >
                  <div className="w-full">
                    <TrendAnalysis data={filteredData} filters={filters} />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
