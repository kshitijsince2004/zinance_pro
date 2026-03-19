
import { Asset } from '@/types/asset';

export class AssetUtils {
  filterAssets(assets: Asset[], filters: {
    status?: string;
    department?: string;
    company?: string;
    category?: string;
    search?: string;
    importBatch?: string;
  }): Asset[] {
    return assets.filter(asset => {
      if (filters.status && asset.status !== filters.status) return false;
      if (filters.department && asset.department !== filters.department) return false;
      if (filters.company && asset.company !== filters.company) return false;
      if (filters.category && asset.category !== filters.category) return false;
      if (filters.importBatch && asset.importMetadata?.batchId !== filters.importBatch) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return asset.name.toLowerCase().includes(searchLower) ||
               asset.type.toLowerCase().includes(searchLower) ||
               asset.owner.toLowerCase().includes(searchLower) ||
               asset.importMetadata?.fileName?.toLowerCase().includes(searchLower) ||
               asset.importMetadata?.batchId?.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }

  sortAssets(assets: Asset[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): Asset[] {
    return [...assets].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Handle import metadata sorting
      if (sortBy.startsWith('import.')) {
        const field = sortBy.split('.')[1];
        aValue = a.importMetadata?.[field as keyof typeof a.importMetadata];
        bValue = b.importMetadata?.[field as keyof typeof b.importMetadata];
        
        // Handle null/undefined values
        if (!aValue && !bValue) return 0;
        if (!aValue) return sortOrder === 'asc' ? 1 : -1;
        if (!bValue) return sortOrder === 'asc' ? -1 : 1;
      } else {
        aValue = a[sortBy as keyof Asset];
        bValue = b[sortBy as keyof Asset];
      }

      if (sortBy === 'purchasePrice' || sortBy === 'currentValue') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortBy === 'purchaseDate' || sortBy === 'putToUseDate' || sortBy === 'createdAt' || sortBy === 'import.importDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  groupAssets(assets: Asset[], groupBy: string): { [key: string]: Asset[] } {
    return assets.reduce((groups, asset) => {
      let key: string;
      
      if (groupBy.startsWith('import.')) {
        const field = groupBy.split('.')[1];
        key = asset.importMetadata?.[field as keyof typeof asset.importMetadata] as string || 'Manual Entry';
      } else {
        key = asset[groupBy as keyof Asset] as string;
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(asset);
      return groups;
    }, {} as { [key: string]: Asset[] });
  }

  getImportBatches(assets: Asset[]): Array<{ batchId: string; fileName: string; count: number; importDate: string }> {
    const batches = new Map<string, { fileName: string; count: number; importDate: string }>();
    
    assets.forEach(asset => {
      if (asset.importMetadata) {
        const batchId = asset.importMetadata.batchId;
        if (batches.has(batchId)) {
          batches.get(batchId)!.count++;
        } else {
          batches.set(batchId, {
            fileName: asset.importMetadata.fileName,
            count: 1,
            importDate: asset.importMetadata.importDate
          });
        }
      }
    });

    return Array.from(batches.entries()).map(([batchId, data]) => ({
      batchId,
      ...data
    })).sort((a, b) => new Date(b.importDate).getTime() - new Date(a.importDate).getTime());
  }
}

export const assetUtils = new AssetUtils();
