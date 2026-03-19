import { Asset, Company } from '@/types/asset';
import { assetService } from '@/lib/assets';

export class AssetHelpers {
  // Get default depreciation method for a company-department combination
  static getDefaultDepreciationMethod(company: string, department: string): string | null {
    const companies = assetService.getAllCompanies();
    const companyData = companies.find(c => c.name === company);
    
    if (companyData?.defaultDepreciationMethods?.[department]) {
      return companyData.defaultDepreciationMethods[department];
    }
    
    return null;
  }

  // Apply default depreciation method to new assets
  static applyDefaultDepreciationMethod(asset: Partial<Asset>): Partial<Asset> {
    if (!asset.company || !asset.department || asset.depreciationMethod) {
      return asset; // Don't override if method already set
    }

    const defaultMethod = this.getDefaultDepreciationMethod(asset.company, asset.department);
    
    if (defaultMethod) {
      return {
        ...asset,
        depreciationMethod: defaultMethod as Asset['depreciationMethod']
      };
    }

    return asset;
  }

  // Get asset types including intangible assets
  static getAssetTypes(): string[] {
    return [
      'Tangible Assets',
      'Intangible Assets',
      'Current Assets',
      'Fixed Assets',
      'Investment Assets'
    ];
  }

  // Get comprehensive asset categories including intangible
  static getAssetCategories(): string[] {
    return [
      // Buildings and Structures
      'Buildings',
      'Factory Buildings',
      'Temporary Structures',
      
      // Furniture and Fixtures
      'Furniture and fixtures',
      'Office furniture',
      'Fixtures',
      
      // Equipment and Machinery
      'Plant and machinery',
      'Scientific equipments',
      'Medical equipments',
      'Laboratory equipments',
      'Electrical equipments',
      'Musical Instruments',
      'Sports equipments',
      
      // Computers and IT
      'Computers',
      'Computer software',
      'Data processing machines',
      'Computer peripherals',
      
      // Vehicles
      'Buses, vans, etc.',
      'Cars, scooters, etc.',
      'Trucks',
      'Heavy vehicles',
      'Aircraft',
      'Ships',
      
      // Books and Publications
      'Library books',
      'Books',
      
      // Other Assets
      'Tools and equipment',
      'Dies and moulds',
      
      // Intangible Assets
      'Intangible assets',
      'Patents',
      'Copyrights',
      'Trademarks',
      'Software licenses',
      'Goodwill',
      'Brand value',
      'Customer relationships',
      'Know-how',
      'Licenses',
      'Franchise rights',
      'Non-compete agreements',
      
      // Default
      'Others'
    ];
  }

  // Check if category is intangible
  static isIntangibleAsset(category: string): boolean {
    const intangibleCategories = [
      'Intangible assets',
      'Patents',
      'Copyrights',
      'Trademarks',
      'Software licenses',
      'Goodwill',
      'Brand value',
      'Customer relationships',
      'Know-how',
      'Licenses',
      'Franchise rights',
      'Non-compete agreements'
    ];
    
    return intangibleCategories.includes(category);
  }

  // Get recommended useful life for intangible assets
  static getRecommendedUsefulLife(category: string): number {
    const intangibleUsefulLives: { [key: string]: number } = {
      'Patents': 20,
      'Copyrights': 50,
      'Trademarks': 10,
      'Software licenses': 3,
      'Goodwill': 10,
      'Brand value': 10,
      'Customer relationships': 8,
      'Know-how': 5,
      'Licenses': 10,
      'Franchise rights': 15,
      'Non-compete agreements': 3,
      'Intangible assets': 10
    };

    return intangibleUsefulLives[category] || 5;
  }
}

export const assetHelpers = AssetHelpers;
