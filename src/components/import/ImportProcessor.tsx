
import { assetService } from '@/lib/assets';
import { importLogger } from '@/lib/import-logger';
import { auditService } from '@/lib/audit';
import { assetHistoryManager } from '@/lib/asset-history-manager';
import type { ImportData, ColumnMapping, ImportResult } from '@/pages/Import';

// ImportProcessor class handles the processing and execution of asset imports
export class ImportProcessor {
  // Helper function to intelligently parse useful life values
  static parseUsefulLife(value: string | number): number {
    // Return default 5 years if no value provided
    if (!value) return 5;
    
    // Convert value to number
    const numericValue = parseFloat(String(value));
    // Return default if not a valid number
    if (isNaN(numericValue)) return 5;
    
    // If value is greater than 50, assume it's in days and convert to years
    // Most assets don't have useful life > 50 years, so this is a reasonable threshold
    if (numericValue > 50) {
      // Convert days to years and round to 1 decimal place
      const years = Math.round((numericValue / 365) * 10) / 10;
      // Log the conversion for debugging
      console.log(`Converting useful life from ${numericValue} days to ${years} years`);
      // Return minimum 0.1 years to avoid zero values
      return Math.max(years, 0.1);
    }
    
    // If value is reasonable for years (1-50), use as is
    return Math.max(numericValue, 0.1);
  }

  // Helper function to parse depreciation rate without auto-calculation
  static parseDepreciationRate(value: string | number): number | null {
    // Return null if no value provided (allows system to handle separately)
    if (!value) return null;
    
    // Convert value to number
    const numericValue = parseFloat(String(value));
    // Return null if not a valid number
    if (isNaN(numericValue)) return null;
    
    // If depreciation rate is > 100, assume it's incorrectly formatted
    if (numericValue > 100) {
      console.log(`Depreciation rate ${numericValue} seems too high, setting to null`);
      return null;
    }
    
    // Return the valid depreciation rate
    return numericValue;
  }

  // Process raw import data and apply column mapping
  static processImportData(data: ImportData[], mapping: ColumnMapping) {
    // Process each row of data
    return data.map(row => {
      // Create object to store mapped row data
      const mappedRow: any = {};
      
      // Apply column mapping to each field
      Object.entries(mapping).forEach(([importCol, assetField]) => {
        // Only map if both import column and asset field are defined
        if (assetField && row[importCol] !== undefined) {
          mappedRow[assetField] = row[importCol];
        }
      });

      // Parse useful life with intelligent day/year detection
      const parsedUsefulLife = this.parseUsefulLife(mappedRow.usefulLife);
      
      // Parse depreciation rate without fallback calculation
      const parsedDepreciationRate = this.parseDepreciationRate(mappedRow.depreciationRate);

      // Handle historical depreciation and current value logic
      const startFromCurrentValue = mappedRow.startFromCurrentValue === 'Yes' || 
                                   mappedRow.startFromCurrentValue === 'yes' || 
                                   mappedRow.startFromCurrentValue === true;
      
      // Parse historical depreciation years from comma-separated string
      const historicalYears = mappedRow.historicalDepreciationYears ? 
        mappedRow.historicalDepreciationYears.split(',').map((year: string) => year.trim()).filter(Boolean) : [];

      // Validate depreciation method against allowed methods
      const validMethods = ['SLM', 'WDV', 'WDV_FIXED_SLAB', 'UNITS', 'DOUBLE_DECLINING', 'SUM_OF_YEARS'];
      const depreciationMethod = validMethods.includes(mappedRow.depreciationMethod) ? 
                                mappedRow.depreciationMethod : 'SLM';

      // Return processed asset data with defaults for missing fields
      return {
        name: mappedRow.name || 'Unnamed Asset',                                          // Asset name with fallback
        type: mappedRow.type || 'General',                                                // Asset type with fallback
        category: mappedRow.category || mappedRow.type || 'General',                      // Category with fallback to type
        purchaseDate: mappedRow.purchaseDate || new Date().toISOString().split('T')[0],  // Purchase date with today as fallback
        putToUseDate: mappedRow.putToUseDate || mappedRow.purchaseDate || new Date().toISOString().split('T')[0], // Put to use date
        purchasePrice: parseFloat(mappedRow.purchasePrice) || 0,                          // Purchase price as number
        depreciationRate: parsedDepreciationRate,                                         // Parsed depreciation rate (can be null)
        residualValue: parseFloat(mappedRow.residualValue) || 0,                          // Residual value as number
        owner: mappedRow.owner || '',                                                      // Asset owner
        department: mappedRow.department || 'General',                                     // Department with fallback
        company: mappedRow.company || 'Default Company',                                   // Company with fallback
        location: mappedRow.location || '',                                                // Location
        office: mappedRow.office || '',                                                    // Office
        vendor: mappedRow.vendor || '',                                                    // Vendor
        invoiceNumber: mappedRow.invoiceNumber || `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // Invoice number with auto-generated fallback
        status: mappedRow.status || 'active',                                              // Status with active as default
        depreciationMethod,                                                                // Validated depreciation method
        usefulLife: parsedUsefulLife,                                                      // Parsed useful life
        currentValue: parseFloat(mappedRow.currentValue) || undefined,                     // Current value if provided
        startFromCurrentValue,                                                             // Flag for historical continuation
        notes: mappedRow.notes || '',                                                      // Notes
        warrantyStartDate: mappedRow.warrantyStartDate,                                    // Warranty start date
        warrantyEndDate: mappedRow.warrantyEndDate,                                        // Warranty end date
        amcStartDate: mappedRow.amcStartDate,                                              // AMC start date
        amcEndDate: mappedRow.amcEndDate,                                                  // AMC end date
        insuranceStartDate: mappedRow.insuranceStartDate,                                  // Insurance start date
        insuranceEndDate: mappedRow.insuranceEndDate,                                      // Insurance end date
        serialNumber: mappedRow.serialNumber,                                              // Serial number
        // Store historical years for later processing
        _historicalYears: historicalYears
      };
    });
  }

  // Execute the import process with progress tracking
  static async executeImport(
    processedData: any[],
    originalData: ImportData[],
    fileName: string,
    mapping: ColumnMapping,
    onProgress: (progress: number) => void
  ): Promise<ImportResult> {
    // Generate unique batch ID for this import
    const batchId = `batch_${Date.now()}`;
    // Initialize error tracking
    const errors: string[] = [];
    // Initialize counters
    let successCount = 0;
    let failedCount = 0;
    // Track any new fields discovered during import
    const newFields: string[] = [];

    // Process each asset in the batch
    for (let i = 0; i < processedData.length; i++) {
      try {
        // Get current asset data
        const assetData = processedData[i];
        
        // Create asset with import metadata
        const assetWithMetadata = {
          ...assetData,
          importMetadata: {
            batchId,                                                    // Batch identifier
            importDate: new Date().toISOString().split('T')[0],         // Import date
            importTime: new Date().toISOString(),                       // Import timestamp
            fileName,                                                   // Source file name
            rowNumber: i + 1,                                          // Row number in source file
            importedBy: 'current_user',                                // User who imported
            importMethod: 'excel' as const,                            // Import method
            originalData: originalData[i]                              // Original raw data
          }
        };

        // Create the asset using the asset service
        const createdAsset = assetService.createAsset(assetWithMetadata);
        
        // Handle historical depreciation if specified
        if (assetData._historicalYears && assetData._historicalYears.length > 0) {
          // Generate historical depreciation data
          const historicalData = this.generateHistoricalDepreciation(
            createdAsset,
            assetData._historicalYears,
            assetData.currentValue || assetData.purchasePrice
          );
          
          // Add historical data if generated successfully
          if (historicalData.length > 0) {
            assetHistoryManager.addHistoricalDepreciation(createdAsset.id, historicalData);
            
            // Log the historical import in asset history
            assetHistoryManager.logHistoryEntry({
              assetId: createdAsset.id,
              action: 'historical_import',
              details: `Imported ${historicalData.length} years of historical depreciation: ${assetData._historicalYears.join(', ')}`,
              user: 'import_system'
            });
          }
        }
        
        // Increment success counter
        successCount++;
        
        // Update progress
        onProgress(((i + 1) / processedData.length) * 100);
        // Add small delay to prevent UI blocking
        await new Promise(resolve => setTimeout(resolve, 10));
        
      } catch (error) {
        // Increment failed counter
        failedCount++;
        // Add error to errors array
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Log the import operation
    await importLogger.logAssetImport({
      batchId,
      fileName,
      importedBy: 'current_user',
      importMethod: 'excel',
      totalRows: processedData.length,
      successCount,
      failedCount,
      skippedCount: 0,
      metadata: {
        columnMappings: mapping,
        customFields: newFields,
        errors
      }
    });

    // Log import in audit trail
    auditService.logAssetImported(batchId, successCount, fileName);

    // Return import result
    return {
      success: successCount,
      failed: failedCount,
      skipped: 0,
      errors,
      batchId,
      newFields
    };
  }

  // Generate historical depreciation data for assets
  static generateHistoricalDepreciation(asset: any, historicalYears: string[], finalBookValue: number) {
    // Initialize array to store historical data
    const historicalData = [];
    // Get asset's put to use date for calculations
    const purchaseDate = new Date(asset.putToUseDate || asset.purchaseDate);
    
    // Sort years to process chronologically
    const sortedYears = historicalYears.sort();
    
    // Start with purchase price as initial value
    let currentValue = asset.purchasePrice;
    
    // Process each historical year
    for (let i = 0; i < sortedYears.length; i++) {
      const year = sortedYears[i];
      const isLastYear = i === sortedYears.length - 1;
      
      // For the last historical year, use the provided final book value
      // For other years, calculate using depreciation rate
      const closingValue = isLastYear ? finalBookValue : 
        currentValue * (1 - ((asset.depreciationRate || 20) / 100));
      
      // Calculate depreciation amount for this year
      const depreciationAmount = currentValue - closingValue;
      
      // Create historical depreciation entry
      historicalData.push({
        financialYear: year,                                          // Financial year
        startDate: `${year.split('-')[0]}-04-01`,                   // Financial year starts April 1st
        endDate: `${year.split('-')[1]}-03-31`,                     // Financial year ends March 31st
        openingValue: currentValue,                                  // Opening book value
        depreciationAmount: Math.max(0, depreciationAmount),        // Depreciation amount (non-negative)
        closingValue: Math.max(closingValue, asset.residualValue || 0), // Closing book value (not below residual)
        depreciationMethod: asset.depreciationMethod,                // Depreciation method used
        isSystemCalculated: false,                                   // Flag indicating manual/imported data
        notes: `Historical data imported from ${asset.importMetadata?.fileName || 'Excel file'}` // Notes about data source
      });
      
      // Update current value for next iteration
      currentValue = closingValue;
    }
    
    // Return the historical data array
    return historicalData;
  }
}
