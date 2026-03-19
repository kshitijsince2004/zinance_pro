import { ImportLog } from '@/types/asset';
import { authService } from './auth';

// ImportLogger class for managing import logs and tracking
class ImportLogger {
  // Get all import logs from localStorage
  private getImportLogs(): ImportLog[] {
    // Retrieve stored logs from localStorage
    const stored = localStorage.getItem('fams-import-logs');
    // Return parsed logs or empty array if no logs exist
    return stored ? JSON.parse(stored) : [];
  }

  // Save import logs to localStorage
  private saveImportLogs(logs: ImportLog[]): void {
    // Store logs as JSON string in localStorage
    localStorage.setItem('fams-import-logs', JSON.stringify(logs));
  }

  // Create a new import log entry
  createImportLog(
    batchId: string,
    fileName: string,
    importMethod: 'excel' | 'csv' | 'manual',
    totalRows: number,
    columnMappings: Record<string, string>,
    customFields: string[] = []
  ): ImportLog {
    // Get current user information
    const currentUser = authService.getCurrentUser();
    // Get current date in YYYY-MM-DD format
    const importDate = new Date().toISOString().split('T')[0];
    // Get current time in local format
    const importTime = new Date().toLocaleTimeString();
    
    // Create new import log object
    const importLog: ImportLog = {
      id: `import-${Date.now()}`,                    // Unique ID based on timestamp
      batchId,                                       // Batch identifier
      fileName,                                      // Source file name
      importDate,                                    // Import date
      importTime,                                    // Import time
      importedBy: currentUser?.name || 'Unknown',    // User who performed import
      importMethod,                                  // Method used for import
      totalRows,                                     // Total rows processed
      successCount: 0,                               // Initially 0, updated later
      failedCount: 0,                                // Initially 0, updated later
      skippedCount: 0,                               // Initially 0, updated later
      metadata: {
        columnMappings,                              // Column mapping configuration
        customFields,                                // Custom fields discovered
        errors: []                                   // Initially empty, populated during import
      },
      createdAt: new Date().toISOString()            // Creation timestamp
    };

    // Get existing logs
    const logs = this.getImportLogs();
    // Add new log to beginning for latest first ordering
    logs.unshift(importLog);
    
    // Keep only last 100 import logs to prevent storage bloat
    if (logs.length > 100) {
      logs.splice(100);
    }
    
    // Save updated logs to storage
    this.saveImportLogs(logs);
    // Return the created log
    return importLog;
  }

  // Log asset import operation with detailed information
  logAssetImport(params: {
    batchId: string;
    fileName: string;
    importedBy: string;
    importMethod: 'excel' | 'csv' | 'manual';
    totalRows: number;
    successCount: number;
    failedCount: number;
    skippedCount: number;
    metadata: {
      columnMappings: Record<string, string>;
      customFields: string[];
      errors: string[];
    };
  }): Promise<ImportLog> {
    // Get current date in YYYY-MM-DD format
    const importDate = new Date().toISOString().split('T')[0];
    // Get current time in local format
    const importTime = new Date().toLocaleTimeString();
    
    // Create comprehensive import log
    const importLog: ImportLog = {
      id: `import-${Date.now()}`,          // Unique ID
      batchId: params.batchId,             // Batch identifier
      fileName: params.fileName,           // Source file name
      importDate,                          // Import date
      importTime,                          // Import time
      importedBy: params.importedBy,       // User who imported
      importMethod: params.importMethod,   // Import method
      totalRows: params.totalRows,         // Total rows processed
      successCount: params.successCount,   // Successfully imported rows
      failedCount: params.failedCount,     // Failed rows
      skippedCount: params.skippedCount,   // Skipped rows
      metadata: params.metadata,           // Additional metadata
      createdAt: new Date().toISOString()  // Creation timestamp
    };

    // Get existing logs
    const logs = this.getImportLogs();
    // Add new log to beginning
    logs.unshift(importLog);
    
    // Keep only last 100 import logs
    if (logs.length > 100) {
      logs.splice(100);
    }
    
    // Save updated logs
    this.saveImportLogs(logs);
    // Return resolved promise with the log
    return Promise.resolve(importLog);
  }

  // Update existing import log with new information
  updateImportLog(
    batchId: string, 
    updates: {
      successCount?: number;
      failedCount?: number;
      skippedCount?: number;
      errors?: string[];
      fileSize?: number;
    }
  ): void {
    // Get existing logs
    const logs = this.getImportLogs();
    // Find the log to update by batch ID
    const logIndex = logs.findIndex(log => log.batchId === batchId);
    
    // Update log if found
    if (logIndex !== -1) {
      const log = logs[logIndex];
      // Update success count if provided
      if (updates.successCount !== undefined) log.successCount = updates.successCount;
      // Update failed count if provided
      if (updates.failedCount !== undefined) log.failedCount = updates.failedCount;
      // Update skipped count if provided
      if (updates.skippedCount !== undefined) log.skippedCount = updates.skippedCount;
      // Update errors if provided
      if (updates.errors) log.metadata.errors = updates.errors;
      // Update file size if provided
      if (updates.fileSize) log.metadata.fileSize = updates.fileSize;
      
      // Save updated logs
      this.saveImportLogs(logs);
    }
  }

  // Get all import logs
  getAllImportLogs(): ImportLog[] {
    return this.getImportLogs();
  }

  // Get specific import log by batch ID
  getImportLogByBatchId(batchId: string): ImportLog | undefined {
    const logs = this.getImportLogs();
    // Find and return log with matching batch ID
    return logs.find(log => log.batchId === batchId);
  }

  // Create import metadata for individual assets
  createImportMetadata(
    batchId: string,
    fileName: string,
    rowNumber: number,
    importMethod: 'excel' | 'csv' | 'manual',
    originalData?: Record<string, any>
  ) {
    // Get current user
    const currentUser = authService.getCurrentUser();
    // Get current date and time
    const importDate = new Date().toISOString().split('T')[0];
    const importTime = new Date().toLocaleTimeString();
    
    // Return metadata object
    return {
      batchId,                                      // Batch identifier
      importDate,                                   // Import date
      importTime,                                   // Import time
      fileName,                                     // Source file name
      rowNumber,                                    // Row number in source file
      importedBy: currentUser?.name || 'Unknown',   // User who imported
      importMethod,                                 // Import method
      originalData                                  // Original raw data
    };
  }
}

// Export singleton instance
export const importLogger = new ImportLogger();
