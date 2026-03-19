
interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  details: any;
  previousValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  outcome: 'success' | 'failure' | 'pending';
  errorMessage?: string;
  metadata?: {
    source: 'web' | 'api' | 'import' | 'system';
    context?: string;
    correlationId?: string;
  };
}

class AuditService {
  private logs: AuditLog[] = [];

  constructor() {
    this.loadLogs();
  }

  private loadLogs(): void {
    const stored = localStorage.getItem('audit_logs');
    if (stored) {
      this.logs = JSON.parse(stored);
    }
  }

  private saveLogs(): void {
    localStorage.setItem('audit_logs', JSON.stringify(this.logs));
  }

  private getCurrentUser() {
    // Try to get actual user information from multiple sources
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return {
          userId: user.email || user.id || 'anonymous',
          userName: user.name || user.email || 'Unknown User'
        };
      } catch (e) {
        // Fall through to other methods
      }
    }
    
    // Try auth service or other user storage methods
    const userEmail = localStorage.getItem('userEmail') || 
                     localStorage.getItem('currentUserEmail') ||
                     sessionStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName') || 
                    localStorage.getItem('currentUserName') ||
                    sessionStorage.getItem('userName');
    
    if (userEmail) {
      return {
        userId: userEmail,
        userName: userName || userEmail
      };
    }
    
    // Last resort - check if there's any user data in localStorage
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.includes('user') || key.includes('auth')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.email) {
            return {
              userId: data.email,
              userName: data.name || data.email
            };
          }
        } catch (e) {
          // Continue checking other keys
        }
      }
    }
    
    return {
      userId: 'anonymous',
      userName: 'Anonymous User'
    };
  }

  log(
    action: string, 
    resourceType: string, 
    resourceId: string, 
    details: any = {},
    previousValues?: any,
    newValues?: any,
    outcome: 'success' | 'failure' | 'pending' = 'success',
    errorMessage?: string,
    resourceName?: string
  ): void {
    const { userId, userName } = this.getCurrentUser();
    
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      action,
      resourceType,
      resourceId,
      resourceName,
      details,
      previousValues,
      newValues,
      ipAddress: 'client-side',
      userAgent: navigator.userAgent,
      sessionId: sessionStorage.getItem('sessionId') || 'unknown',
      outcome,
      errorMessage,
      metadata: {
        source: 'web',
        context: window.location.pathname,
        correlationId: `corr_${Date.now()}`
      }
    };

    this.logs.unshift(log);
    
    if (this.logs.length > 5000) {
      this.logs = this.logs.slice(0, 5000);
    }
    
    this.saveLogs();
    console.log('Audit Log Created:', log);
  }

  // Specific audit methods for different actions
  logAssetCreated(asset: any): void {
    this.log('ASSET_CREATED', 'Asset', asset.id, { 
      name: asset.name, 
      category: asset.category,
      purchasePrice: asset.purchasePrice 
    }, undefined, asset, 'success', undefined, asset.name);
  }

  logAssetUpdated(assetId: string, assetName: string, previousValues: any, newValues: any): void {
    this.log('ASSET_UPDATED', 'Asset', assetId, { 
      fieldsChanged: Object.keys(newValues) 
    }, previousValues, newValues, 'success', undefined, assetName);
  }

  logAssetDeleted(asset: any): void {
    this.log('ASSET_DELETED', 'Asset', asset.id, { 
      name: asset.name,
      deletedAt: new Date().toISOString()
    }, asset, undefined, 'success', undefined, asset.name);
  }

  logAssetImported(batchId: string, count: number, fileName: string): void {
    this.log('ASSETS_IMPORTED', 'AssetBatch', batchId, { 
      count,
      fileName,
      importMethod: 'bulk'
    }, undefined, { assetCount: count }, 'success', undefined, `Import: ${fileName}`);
  }

  logSerialFormatUpdated(companyId: string, department: string, assetClass: string, previousFormat: string, newFormat: string, appliedToExisting: boolean): void {
    this.log('SERIAL_FORMAT_UPDATED', 'SerialFormat', `${companyId}_${department}_${assetClass}`, { 
      department,
      assetClass,
      appliedToExisting
    }, { format: previousFormat }, { format: newFormat }, 'success', undefined, `${department} - ${assetClass}`);
  }

  logCompanyCreated(company: any): void {
    this.log('COMPANY_CREATED', 'Company', company.id, { 
      name: company.name,
      departmentCount: company.departments?.length || 0
    }, undefined, company, 'success', undefined, company.name);
  }

  logCompanyUpdated(companyId: string, companyName: string, previousValues: any, newValues: any): void {
    this.log('COMPANY_UPDATED', 'Company', companyId, { 
      fieldsChanged: Object.keys(newValues)
    }, previousValues, newValues, 'success', undefined, companyName);
  }

  logUserLogin(userId: string, userName: string): void {
    this.log('USER_LOGIN', 'User', userId, { 
      loginTime: new Date().toISOString(),
      method: 'local'
    }, undefined, undefined, 'success', undefined, userName);
  }

  logUserLogout(userId: string, userName: string): void {
    this.log('USER_LOGOUT', 'User', userId, { 
      logoutTime: new Date().toISOString()
    }, undefined, undefined, 'success', undefined, userName);
  }

  logCalculationPerformed(assetId: string, assetName: string, method: string, result: number): void {
    this.log('CALCULATION_PERFORMED', 'Asset', assetId, { 
      method,
      result,
      calculatedAt: new Date().toISOString()
    }, undefined, { currentValue: result }, 'success', undefined, assetName);
  }

  logSettingsChanged(settingKey: string, previousValue: any, newValue: any): void {
    this.log('SETTINGS_CHANGED', 'Settings', settingKey, { 
      setting: settingKey
    }, { value: previousValue }, { value: newValue }, 'success', undefined, settingKey);
  }

  logError(action: string, resourceType: string, resourceId: string, error: string, details?: any): void {
    this.log(action, resourceType, resourceId, details || {}, undefined, undefined, 'failure', error);
  }

  getAllLogs(): AuditLog[] {
    return [...this.logs];
  }

  getLogsByAction(action: string): AuditLog[] {
    return this.logs.filter(log => log.action === action);
  }

  getLogsByResourceType(resourceType: string): AuditLog[] {
    return this.logs.filter(log => log.resourceType === resourceType);
  }

  getLogsByUserId(userId: string): AuditLog[] {
    return this.logs.filter(log => log.userId === userId);
  }

  getLogsByDateRange(startDate: Date, endDate: Date): AuditLog[] {
    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  getLogsByOutcome(outcome: 'success' | 'failure' | 'pending'): AuditLog[] {
    return this.logs.filter(log => log.outcome === outcome);
  }

  searchLogs(query: string): AuditLog[] {
    const searchTerm = query.toLowerCase();
    return this.logs.filter(log => 
      log.action.toLowerCase().includes(searchTerm) ||
      log.resourceType.toLowerCase().includes(searchTerm) ||
      log.userName.toLowerCase().includes(searchTerm) ||
      log.resourceName?.toLowerCase().includes(searchTerm) ||
      JSON.stringify(log.details).toLowerCase().includes(searchTerm)
    );
  }
}

export const auditService = new AuditService();
export type { AuditLog };
