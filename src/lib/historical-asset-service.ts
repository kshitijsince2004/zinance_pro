import { Asset } from '@/types/asset';
import { 
  HistoricalAsset, 
  HistoricalDepreciationRecord, 
  ImpactAnalysis, 
  ImportBatch, 
  HistoricalImportData,
  YearWiseImpact,
  CalculationComparison,
  ImpactApprovalRequest
} from '@/types/historical-asset';
import { depreciationCalculator } from '@/lib/depreciation/calculations';

export class HistoricalAssetService {
  private static STORAGE_KEYS = {
    HISTORICAL_RECORDS: 'historical_depreciation_records',
    IMPACT_ANALYSIS: 'impact_analysis',
    IMPORT_BATCHES: 'import_batches',
    IMPORT_ERRORS: 'import_errors'
  };

  // Helper function to convert string to valid depreciation method
  private static mapDepreciationMethod(method: string): Asset['depreciationMethod'] {
    const methodMap: Record<string, Asset['depreciationMethod']> = {
      'SLM': 'SLM',
      'WDV': 'WDV',
      'WDV_FIXED_SLAB': 'WDV_FIXED_SLAB',
      'UNITS': 'UNITS',
      'DOUBLE_DECLINING': 'DOUBLE_DECLINING',
      'SUM_OF_YEARS': 'SUM_OF_YEARS',
      'Straight Line': 'SLM',
      'Written Down Value': 'WDV',
      'Reducing Balance': 'WDV',
      'Units of Production': 'UNITS',
      'Double Declining': 'DOUBLE_DECLINING',
      'Sum of Years': 'SUM_OF_YEARS'
    };
    return methodMap[method] || 'SLM';
  }

  // Import Batch Management
  static createImportBatch(batchData: Partial<ImportBatch>): ImportBatch {
    const batches = this.getAllImportBatches();
    const newBatch: ImportBatch = {
      id: `batch_${Date.now()}`,
      batch_name: batchData.batch_name || `Import_${new Date().toISOString().split('T')[0]}`,
      company_id: batchData.company_id || 'default',
      import_date: new Date().toISOString(),
      imported_by: batchData.imported_by || 'System',
      file_name: batchData.file_name || '',
      total_assets: 0,
      successful_imports: 0,
      failed_imports: 0,
      assets_with_impact: 0,
      total_impact_amount: 0,
      status: 'IN_PROGRESS',
      import_summary: {
        assets_imported: 0,
        historical_records_created: 0,
        impacts_calculated: 0,
        total_impact_amount: 0,
        avg_impact_percentage: 0,
        assets_requiring_approval: 0
      },
      error_log: []
    };

    batches.push(newBatch);
    this.saveImportBatches(batches);
    return newBatch;
  }

  static getAllImportBatches(): ImportBatch[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.IMPORT_BATCHES);
    return data ? JSON.parse(data) : [];
  }

  static saveImportBatches(batches: ImportBatch[]): void {
    localStorage.setItem(this.STORAGE_KEYS.IMPORT_BATCHES, JSON.stringify(batches));
  }

  static updateImportBatch(batchId: string, updates: Partial<ImportBatch>): void {
    const batches = this.getAllImportBatches();
    const batchIndex = batches.findIndex(b => b.id === batchId);
    if (batchIndex >= 0) {
      batches[batchIndex] = { ...batches[batchIndex], ...updates };
      this.saveImportBatches(batches);
    }
  }

  // Historical Depreciation Records Management
  static createHistoricalRecord(record: Omit<HistoricalDepreciationRecord, 'id'>): HistoricalDepreciationRecord {
    const records = this.getAllHistoricalRecords();
    const newRecord: HistoricalDepreciationRecord = {
      ...record,
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      is_historical: true,
      is_immutable: true,
      is_booked: true
    };

    records.push(newRecord);
    this.saveHistoricalRecords(records);
    return newRecord;
  }

  static getAllHistoricalRecords(): HistoricalDepreciationRecord[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.HISTORICAL_RECORDS);
    return data ? JSON.parse(data) : [];
  }

  static getHistoricalRecordsByAsset(assetId: string): HistoricalDepreciationRecord[] {
    return this.getAllHistoricalRecords().filter(record => record.asset_id === assetId);
  }

  static saveHistoricalRecords(records: HistoricalDepreciationRecord[]): void {
    localStorage.setItem(this.STORAGE_KEYS.HISTORICAL_RECORDS, JSON.stringify(records));
  }

  // Impact Analysis Management
  static calculateImpactAnalysis(
    asset: Asset & HistoricalAsset,
    historicalData: HistoricalImportData,
    analyzedBy: string
  ): ImpactAnalysis {
    const yearWiseImpact = this.calculateYearWiseImpact(asset, historicalData);
    
    const historicalCumulative = yearWiseImpact.reduce((sum, year) => sum + year.historical_depreciation, 0);
    const correctCumulative = yearWiseImpact.reduce((sum, year) => sum + year.correct_depreciation, 0);
    const impactAmount = correctCumulative - historicalCumulative;
    
    let impactType: 'UNDER_DEPRECIATED' | 'OVER_DEPRECIATED' | 'NO_IMPACT' = 'NO_IMPACT';
    if (impactAmount > 0) {
      impactType = 'UNDER_DEPRECIATED';
    } else if (impactAmount < 0) {
      impactType = 'OVER_DEPRECIATED';
    }

    const analysis: ImpactAnalysis = {
      id: `impact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      asset_id: asset.id,
      asset_name: asset.name,
      analysis_date: new Date().toISOString(),
      historical_cumulative_depreciation: historicalCumulative,
      correct_cumulative_depreciation: correctCumulative,
      impact_amount: Math.abs(impactAmount),
      impact_type: impactType,
      status: Math.abs(impactAmount) > 1000 ? 'PENDING_APPROVAL' : 'CALCULATED',
      analyzed_by: analyzedBy,
      year_wise_impact: yearWiseImpact
    };

    this.saveImpactAnalysis(analysis);
    return analysis;
  }

  private static calculateYearWiseImpact(
    asset: Asset & HistoricalAsset,
    historicalData: HistoricalImportData
  ): YearWiseImpact[] {
    const yearWiseImpact: YearWiseImpact[] = [];
    const putToUseDate = new Date(asset.putToUseDate);
    const currentDate = new Date();
    
    // Generate financial years from put to use date to current date
    const startFY = this.getFinancialYear(putToUseDate);
    const currentFY = this.getFinancialYear(currentDate);
    
    for (let fy = startFY; fy <= currentFY; fy++) {
      const fyString = `${fy}-${(fy + 1).toString().substr(2)}`;
      const historicalYearData = historicalData.year_wise_data[fyString];
      
      if (historicalYearData) {
        // Calculate what the correct depreciation should have been
        const fyStartDate = new Date(fy, 3, 1); // April 1st
        const fyEndDate = new Date(fy + 1, 2, 31); // March 31st
        
        const correctDepreciation = this.calculateCorrectDepreciationForYear(
          asset,
          fyStartDate,
          fyEndDate,
          historicalData.correct_method,
          historicalData.correct_rate,
          historicalData.correct_useful_life
        );

        const impact: YearWiseImpact = {
          financial_year: fyString,
          historical_depreciation: historicalYearData.depreciation,
          correct_depreciation: correctDepreciation,
          impact_amount: correctDepreciation - historicalYearData.depreciation,
          opening_book_value: historicalYearData.opening_value,
          closing_book_value_historical: historicalYearData.closing_value,
          closing_book_value_correct: historicalYearData.opening_value - correctDepreciation
        };

        yearWiseImpact.push(impact);
      }
    }

    return yearWiseImpact;
  }

  private static calculateCorrectDepreciationForYear(
    asset: Asset,
    startDate: Date,
    endDate: Date,
    method: string,
    rate: number,
    usefulLife: number
  ): number {
    const assetForCalculation = {
      ...asset,
      depreciationMethod: this.mapDepreciationMethod(method),
      depreciationRate: rate,
      usefulLife: usefulLife
    };

    return depreciationCalculator.calculateDepreciationTillDate(
      assetForCalculation,
      new Date(asset.putToUseDate),
      endDate
    ) - depreciationCalculator.calculateDepreciationTillDate(
      assetForCalculation,
      new Date(asset.putToUseDate),
      startDate
    );
  }

  private static getFinancialYear(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    return month >= 3 ? year : year - 1; // Financial year starts from April
  }

  static getAllImpactAnalyses(): ImpactAnalysis[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.IMPACT_ANALYSIS);
    return data ? JSON.parse(data) : [];
  }

  static getImpactAnalysesByAsset(assetId: string): ImpactAnalysis[] {
    return this.getAllImpactAnalyses().filter(analysis => analysis.asset_id === assetId);
  }

  static saveImpactAnalysis(analysis: ImpactAnalysis): void {
    const analyses = this.getAllImpactAnalyses();
    const existingIndex = analyses.findIndex(a => a.id === analysis.id);
    
    if (existingIndex >= 0) {
      analyses[existingIndex] = analysis;
    } else {
      analyses.push(analysis);
    }
    
    localStorage.setItem(this.STORAGE_KEYS.IMPACT_ANALYSIS, JSON.stringify(analyses));
  }

  static approveImpacts(request: ImpactApprovalRequest): void {
    const analyses = this.getAllImpactAnalyses();
    
    request.impact_ids.forEach(impactId => {
      const analysis = analyses.find(a => a.id === impactId);
      if (analysis) {
        analysis.status = 'APPROVED';
        analysis.approved_by = request.approved_by;
        analysis.approval_date = new Date().toISOString();
        if (request.approval_notes) {
          analysis.notes = request.approval_notes;
        }
      }
    });

    localStorage.setItem(this.STORAGE_KEYS.IMPACT_ANALYSIS, JSON.stringify(analyses));
  }

  static bookImpacts(impactIds: string[], bookedBy: string, bookingReference: string): void {
    const analyses = this.getAllImpactAnalyses();
    
    impactIds.forEach(impactId => {
      const analysis = analyses.find(a => a.id === impactId);
      if (analysis && analysis.status === 'APPROVED') {
        analysis.status = 'BOOKED';
        analysis.booking_reference = bookingReference;
      }
    });

    localStorage.setItem(this.STORAGE_KEYS.IMPACT_ANALYSIS, JSON.stringify(analyses));
  }

  // Calculation Comparison
  static generateCalculationComparison(
    asset: Asset & HistoricalAsset,
    historicalData: HistoricalImportData
  ): CalculationComparison {
    const historicalCumulative = depreciationCalculator.calculateDepreciationTillDate(
      {
        ...asset,
        depreciationMethod: this.mapDepreciationMethod(historicalData.historical_method),
        depreciationRate: historicalData.historical_rate,
        usefulLife: historicalData.historical_useful_life
      },
      new Date(asset.putToUseDate),
      new Date()
    );

    const correctCumulative = depreciationCalculator.calculateDepreciationTillDate(
      {
        ...asset,
        depreciationMethod: this.mapDepreciationMethod(historicalData.correct_method),
        depreciationRate: historicalData.correct_rate,
        usefulLife: historicalData.correct_useful_life
      },
      new Date(asset.putToUseDate),
      new Date()
    );

    const impactAmount = correctCumulative - historicalCumulative;
    const impactPercentage = (impactAmount / asset.purchasePrice) * 100;

    return {
      asset_id: asset.id,
      asset_name: asset.name,
      historical_method: {
        method: historicalData.historical_method,
        rate: historicalData.historical_rate,
        useful_life: historicalData.historical_useful_life,
        cumulative_depreciation: historicalCumulative,
        current_book_value: asset.purchasePrice - historicalCumulative
      },
      correct_method: {
        method: historicalData.correct_method,
        rate: historicalData.correct_rate,
        useful_life: historicalData.correct_useful_life,
        cumulative_depreciation: correctCumulative,
        current_book_value: asset.purchasePrice - correctCumulative
      },
      impact: {
        amount: Math.abs(impactAmount),
        percentage: Math.abs(impactPercentage),
        type: impactAmount > 0 ? 'UNDER_DEPRECIATED' : impactAmount < 0 ? 'OVER_DEPRECIATED' : 'NO_IMPACT'
      },
      year_wise_comparison: this.calculateYearWiseImpact(asset, historicalData)
    };
  }

  // Import Processing
  static processHistoricalImport(
    batchId: string,
    importData: HistoricalImportData[],
    analyzedBy: string
  ): void {
    const batch = this.getAllImportBatches().find(b => b.id === batchId);
    if (!batch) return;

    let successCount = 0;
    let failCount = 0;
    let totalImpactAmount = 0;
    let assetsWithImpact = 0;

    importData.forEach((data, index) => {
      try {
        // Process each asset's historical data
        const asset = this.findOrCreateAssetFromImport(data);
        
        // Create historical depreciation records
        Object.entries(data.year_wise_data).forEach(([fy, yearData]) => {
          this.createHistoricalRecord({
            asset_id: asset.id,
            financial_year: fy,
            opening_book_value: yearData.opening_value,
            depreciation_charged: yearData.depreciation,
            closing_book_value: yearData.closing_value,
            depreciation_method: data.historical_method,
            depreciation_rate: data.historical_rate,
            useful_life: data.historical_useful_life,
            is_historical: true,
            is_immutable: true,
            is_booked: true,
            created_at: new Date().toISOString(),
            import_batch_id: batchId
          });
        });

        // Calculate impact analysis
        const impact = this.calculateImpactAnalysis(asset, data, analyzedBy);
        
        if (impact.impact_amount > 0) {
          assetsWithImpact++;
          totalImpactAmount += impact.impact_amount;
        }

        successCount++;
      } catch (error) {
        failCount++;
        console.error(`Error processing asset at row ${index + 1}:`, error);
      }
    });

    // Update batch status
    this.updateImportBatch(batchId, {
      status: 'COMPLETED',
      total_assets: importData.length,
      successful_imports: successCount,
      failed_imports: failCount,
      assets_with_impact: assetsWithImpact,
      total_impact_amount: totalImpactAmount,
      import_summary: {
        assets_imported: successCount,
        historical_records_created: successCount * Object.keys(importData[0]?.year_wise_data || {}).length,
        impacts_calculated: assetsWithImpact,
        total_impact_amount: totalImpactAmount,
        avg_impact_percentage: totalImpactAmount > 0 ? (totalImpactAmount / (successCount * 100000)) * 100 : 0,
        assets_requiring_approval: this.getAllImpactAnalyses().filter(a => a.status === 'PENDING_APPROVAL').length
      }
    });
  }

  private static findOrCreateAssetFromImport(data: HistoricalImportData): Asset & HistoricalAsset {
    // This would normally interface with the asset service
    // For now, we'll create a mock asset structure
    return {
      id: data.asset_id || `asset_${Date.now()}`,
      name: data.asset_name,
      type: 'Historical Import',
      category: data.category,
      serialNumber: data.serial_number || '',
      location: data.location || '',
      purchaseDate: data.purchase_date,
      purchasePrice: data.purchase_price,
      putToUseDate: data.purchase_date,
      depreciationMethod: this.mapDepreciationMethod(data.correct_method),
      depreciationRate: data.correct_rate,
      usefulLife: data.correct_useful_life,
      residualValue: 0,
      currentValue: data.current_book_value,
      status: 'active',
      owner: '',
      department: '',
      company: '',
      office: '',
      vendor: '',
      invoiceNumber: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      has_historical_import: true,
      historical_import_date: new Date().toISOString(),
      historical_import_batch_id: '',
      original_book_value: data.current_book_value,
      corrected_book_value: data.current_book_value,
      impact_adjustment_amount: 0,
      previous_depreciation_method: data.historical_method,
      previous_depreciation_rate: data.historical_rate,
      previous_useful_life: data.historical_useful_life,
      is_impact_calculated: false,
      is_impact_approved: false,
      is_impact_booked: false
    } as Asset & HistoricalAsset;
  }
}