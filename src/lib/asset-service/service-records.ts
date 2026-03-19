
import { auditService } from '@/lib/audit';

export class ServiceRecordsManager {
  private getServiceRecords(): any[] {
    const stored = localStorage.getItem('service-records');
    return stored ? JSON.parse(stored) : [];
  }

  private saveServiceRecords(records: any[]): void {
    localStorage.setItem('service-records', JSON.stringify(records));
  }

  updateServiceRecordsStatus(assetId: string, newStatus: 'cancelled' | 'terminated' | 'transferred'): void {
    const serviceRecords = this.getServiceRecords();
    let updatedCount = 0;
    
    const updatedRecords = serviceRecords.map(record => {
      if (record.assetId === assetId && record.status === 'active') {
        updatedCount++;
        return {
          ...record,
          status: newStatus,
          notes: `${record.notes ? record.notes + '\n' : ''}Status changed to ${newStatus} due to asset disposal/deletion on ${new Date().toLocaleDateString()}`
        };
      }
      return record;
    });
    
    this.saveServiceRecords(updatedRecords);
    
    if (updatedCount > 0) {
      auditService.log('Service Records Status Updated', 'ServiceRecord', assetId, {
        updatedRecords: updatedCount,
        newStatus,
        reason: 'Asset deleted/disposed'
      });
    }
  }

  cleanupOrphanedServiceRecords(assetIds: Set<string>): void {
    const serviceRecords = this.getServiceRecords();
    
    let updatedCount = 0;
    const updatedRecords = serviceRecords.map(record => {
      if (!assetIds.has(record.assetId) && record.status !== 'terminated') {
        updatedCount++;
        return {
          ...record,
          status: 'terminated',
          notes: `${record.notes ? record.notes + '\n' : ''}Status changed to terminated - asset no longer exists (${new Date().toLocaleDateString()})`
        };
      }
      return record;
    });
    
    if (updatedCount > 0) {
      this.saveServiceRecords(updatedRecords);
      auditService.log('Orphaned Service Records Updated', 'ServiceRecord', 'batch', {
        updatedCount,
        reason: 'Assets no longer exist',
        action: 'Status changed to terminated'
      });
    }
  }
}

export const serviceRecordsManager = new ServiceRecordsManager();
