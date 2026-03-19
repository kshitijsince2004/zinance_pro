
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, Printer } from 'lucide-react';
import { ReportsData } from '@/lib/reports-service';

interface ExportModuleProps {
  data: ReportsData;
  filters: any;
  activeTab: string;
}

export const ExportModule: React.FC<ExportModuleProps> = ({ data, filters, activeTab }) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // Create a simple HTML document for PDF export
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Asset Reports - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
            .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #007bff; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .text-right { text-align: right; }
            @media print {
              .no-print { display: none; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Asset Management Reports</h1>
            <p>Generated on: ${new Date().toLocaleDateString('en-IN')} | Financial Year: ${filters.financialYear}-${filters.financialYear + 1}</p>
          </div>

          <div class="section">
            <h2>Executive Summary</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div>Total Assets</div>
                <div class="stat-value">${data.totalAssets}</div>
              </div>
              <div class="stat-card">
                <div>Active Assets</div>
                <div class="stat-value">${data.activeAssets}</div>
              </div>
              <div class="stat-card">
                <div>Depreciation This FY</div>
                <div class="stat-value">${formatCurrency(data.totalDepreciationThisFY)}</div>
              </div>
              <div class="stat-card">
                <div>Total Book Value</div>
                <div class="stat-value">${formatCurrency(data.totalBookValue)}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Asset Distribution by Class</h2>
            <table>
              <thead>
                <tr>
                  <th>Asset Class</th>
                  <th class="text-right">Count</th>
                  <th class="text-right">Total Value</th>
                </tr>
              </thead>
              <tbody>
                ${data.assetClassDistribution.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td class="text-right">${item.count}</td>
                    <td class="text-right">${formatCurrency(item.value)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Service Status Overview</h2>
            <table>
              <thead>
                <tr>
                  <th>Service Type</th>
                  <th class="text-right">Active</th>
                  <th class="text-right">Expiring (30 days)</th>
                  <th class="text-right">Expired</th>
                </tr>
              </thead>
              <tbody>
                ${data.serviceStatus.map(service => `
                  <tr>
                    <td>${service.type}</td>
                    <td class="text-right">${service.active}</td>
                    <td class="text-right">${service.expiring}</td>
                    <td class="text-right">${service.expired}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>5-Year Depreciation Trends</h2>
            <table>
              <thead>
                <tr>
                  <th>Financial Year</th>
                  <th class="text-right">Companies Act</th>
                  <th class="text-right">IT Act</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${data.depreciationTrends.map(trend => `
                  <tr>
                    <td>FY ${trend.year}-${(trend.year + 1).toString().slice(-2)}</td>
                    <td class="text-right">${formatCurrency(trend.companiesAct)}</td>
                    <td class="text-right">${formatCurrency(trend.itAct)}</td>
                    <td class="text-right">${formatCurrency(trend.companiesAct + trend.itAct)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="no-print" style="margin-top: 40px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Report</button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">Close</button>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = () => {
    setIsExporting(true);
    try {
      // Create CSV content
      const csvData = [
        // Summary data
        ['Asset Management Report'],
        [`Generated on: ${new Date().toLocaleDateString('en-IN')}`],
        [`Financial Year: ${filters.financialYear}-${filters.financialYear + 1}`],
        [''],
        ['Executive Summary'],
        ['Metric', 'Value'],
        ['Total Assets', data.totalAssets.toString()],
        ['Active Assets', data.activeAssets.toString()],
        ['Disposed Assets', data.disposedAssets.toString()],
        ['Depreciation This FY', data.totalDepreciationThisFY.toString()],
        ['Total Book Value', data.totalBookValue.toString()],
        ['Unverified Assets', data.unverifiedAssets.toString()],
        [''],
        ['Asset Distribution by Class'],
        ['Asset Class', 'Count', 'Total Value'],
        ...data.assetClassDistribution.map(item => [item.name, item.count.toString(), item.value.toString()]),
        [''],
        ['Department Distribution'],
        ['Department', 'Count', 'Total Value'],
        ...data.departmentDistribution.map(item => [item.name, item.count.toString(), item.value.toString()]),
        [''],
        ['5-Year Depreciation Trends'],
        ['Financial Year', 'Companies Act', 'IT Act', 'Total'],
        ...data.depreciationTrends.map(trend => [
          `FY ${trend.year}-${(trend.year + 1).toString().slice(-2)}`,
          trend.companiesAct.toString(),
          trend.itAct.toString(),
          (trend.companiesAct + trend.itAct).toString()
        ])
      ];

      // Convert to CSV string
      const csvContent = csvData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      ).join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `asset-reports-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const printCurrentView = () => {
    window.print();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="w-4 h-4 mr-2" />
          Export to PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export to Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={printCurrentView}>
          <Printer className="w-4 h-4 mr-2" />
          Print Current View
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
