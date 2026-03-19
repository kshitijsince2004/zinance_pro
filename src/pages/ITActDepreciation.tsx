
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { assetService, Asset } from '@/lib/assets';
import { ITActSlabForm } from '@/components/it-depreciation/ITActSlabForm';
import { ITActCalculations } from '@/components/it-depreciation/ITActCalculations';
import { ITActReports } from '@/components/it-depreciation/ITActReports';
import { ITActFilters } from '@/components/it-depreciation/ITActFilters';
import { ITActTabs } from '@/components/it-depreciation/ITActTabs';
import { BlockManagement } from '@/components/blocks/BlockManagement';
import { AssetAssignment } from '@/components/blocks/AssetAssignment';
import { BlockReports } from '@/components/blocks/BlockReports';

/**
 * Interface for IT Act Depreciation Slab
 * Defines the structure for depreciation rate slabs as per Income Tax Act
 */
interface ITActSlab {
  id: string;
  assetClass: string;
  category: string;
  depreciationRate: number;
  ruleType: 'half_year' | 'full_year';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for IT Act Depreciation Calculation Data
 * Contains all calculated depreciation values for a specific asset and financial year
 */
interface ITActDepreciationData {
  assetId: string;
  financialYear: string;
  openingWDV: number; // Written Down Value at the beginning of the year
  currentYearDepreciation: number; // Depreciation calculated for current year
  closingWDV: number; // Written Down Value at the end of the year
  halfYearRuleApplied: boolean; // Whether half-year rule was applied
  slabId: string; // Reference to the applicable IT Act slab
  calculationDetails: {
    putToUseDate: string;
    isHalfYear: boolean;
    depreciationRate: number;
    method: 'WDV'; // Written Down Value method
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * ITActDepreciation Component
 * 
 * Main component for managing IT Act depreciation calculations and compliance.
 * This component provides a comprehensive solution for:
 * 
 * 1. Asset depreciation calculations as per Income Tax Act
 * 2. Slab management for different asset classes
 * 3. Block-based asset grouping for bulk calculations
 * 4. Compliance reporting and documentation
 * 5. Asset assignment and management
 * 
 * Key Features:
 * - Fully responsive design for all device types
 * - Real-time depreciation calculations
 * - Half-year rule implementation
 * - Multiple financial year support
 * - Export capabilities for compliance
 * - Advanced filtering and sorting
 * 
 * The component follows a tab-based navigation structure:
 * - Assets: View and manage individual asset depreciation
 * - Slabs: Manage depreciation rate slabs
 * - Blocks: Group assets for bulk operations
 * - Assignment: Assign assets to blocks
 * - Block Reports: Generate block-wise reports
 * - Reports: Comprehensive depreciation reports
 */
const ITActDepreciation: React.FC = () => {
  // ==================== STATE MANAGEMENT ====================
  
  /**
   * Core data state variables
   * These hold the main application data
   */
  const [assets, setAssets] = useState<Asset[]>([]);
  const [itActSlabs, setItActSlabs] = useState<ITActSlab[]>([]);
  const [depreciationData, setDepreciationData] = useState<ITActDepreciationData[]>([]);
  
  /**
   * UI state variables
   * These control the user interface behavior
   */
  const [activeTab, setActiveTab] = useState<'assets' | 'slabs' | 'blocks' | 'assignment' | 'block-reports' | 'reports'>('assets');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showSlabForm, setShowSlabForm] = useState(false);
  const [editingSlab, setEditingSlab] = useState<ITActSlab | null>(null);
  
  /**
   * Filter and sorting state variables
   * These control data display and organization
   */
  const [selectedFY, setSelectedFY] = useState<string>('2024-25');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Toast notification hook for user feedback
  const { toast } = useToast();

  // ==================== LIFECYCLE HOOKS ====================
  
  /**
   * Component initialization
   * Load all required data when component mounts
   */
  useEffect(() => {
    console.log('ITActDepreciation: Component initializing, loading data...');
    loadData();
  }, []);

  /**
   * Recalculate depreciation when dependencies change
   * This ensures calculations are always up-to-date
   */
  useEffect(() => {
    console.log('ITActDepreciation: Dependencies changed, recalculating depreciation...');
    calculateITActDepreciation();
  }, [assets, itActSlabs, selectedFY]);

  // ==================== DATA VALIDATION AND CLEANING ====================
  
  /**
   * Enhanced validation function with extreme filtering
   * Ensures all string values are valid and not empty/null/undefined
   * 
   * @param value - String value to validate
   * @param fallback - Default value to use if validation fails
   * @returns Validated string value
   */
  const ensureValidString = (value: string | undefined | null, fallback: string): string => {
    // Check for invalid values including null, undefined, empty strings, and string representations
    if (!value || typeof value !== 'string' || value.trim() === '' || value === 'null' || value === 'undefined') {
      console.warn('ITActDepreciation - Invalid string replaced:', { original: value, fallback });
      return fallback;
    }
    return value.trim();
  };

  /**
   * Enhanced asset validation with strict filtering
   * Cleans and validates all asset data to ensure consistency
   * 
   * @param assets - Array of raw asset data
   * @returns Array of cleaned and validated assets
   */
  const validateAndCleanAssetData = (assets: Asset[]): Asset[] => {
    console.log('ITActDepreciation - Raw assets before validation:', assets);
    
    // Filter active assets and clean their data
    const cleanedAssets = assets
      .filter(a => a && a.status === 'active') // Only include active assets
      .map(asset => {
        // Clean each asset's properties with fallback values
        const cleanedAsset = {
          ...asset,
          company: ensureValidString(asset.company, 'Default Company'),
          department: ensureValidString(asset.department, 'Default Department'),
          type: ensureValidString(asset.type, 'Default Type'),
          category: ensureValidString(asset.category, 'Default Category'),
          name: ensureValidString(asset.name, 'Unnamed Asset'),
          location: ensureValidString(asset.location, 'Default Location'),
          serialNumber: ensureValidString(asset.serialNumber, 'NO-SERIAL'),
          model: ensureValidString(asset.model, 'Unknown Model'),
          manufacturer: ensureValidString(asset.manufacturer, 'Unknown Manufacturer'),
          description: ensureValidString(asset.description, ''),
          notes: ensureValidString(asset.notes, '')
        };
        
        return cleanedAsset;
      });
    
    console.log('ITActDepreciation - Cleaned assets after validation:', cleanedAssets);
    return cleanedAssets;
  };

  // ==================== DATA LOADING ====================
  
  /**
   * Load all required data for the component
   * This includes assets, IT Act slabs, and existing depreciation data
   */
  const loadData = () => {
    console.log('ITActDepreciation: Starting data load process...');
    
    // Load and validate assets
    const loadedAssets = assetService.getAllAssets();
    console.log('ITActDepreciation - Raw loaded assets:', loadedAssets);
    
    const validatedAssets = validateAndCleanAssetData(loadedAssets);
    setAssets(validatedAssets);
    
    // Load IT Act slabs from localStorage or create defaults
    const storedSlabs = localStorage.getItem('it-act-slabs');
    if (storedSlabs) {
      console.log('ITActDepreciation: Loading existing slabs from storage');
      setItActSlabs(JSON.parse(storedSlabs));
    } else {
      console.log('ITActDepreciation: Creating standard slabs');
      const standardSlabs = getStandardITActSlabs();
      setItActSlabs(standardSlabs);
      localStorage.setItem('it-act-slabs', JSON.stringify(standardSlabs));
    }

    // Load existing depreciation data
    const storedDepData = localStorage.getItem('it-act-depreciation-data');
    if (storedDepData) {
      console.log('ITActDepreciation: Loading existing depreciation data');
      setDepreciationData(JSON.parse(storedDepData));
    }
  };

  /**
   * Get standard IT Act depreciation slabs as per Income Tax Act
   * These are the standard depreciation rates for different asset classes
   * 
   * @returns Array of standard IT Act slabs
   */
  const getStandardITActSlabs = (): ITActSlab[] => {
    console.log('ITActDepreciation: Creating standard IT Act slabs');
    
    return [
      {
        id: '1',
        assetClass: 'Building',
        category: 'Buildings (not used for residential purposes)',
        depreciationRate: 10, // 10% per annum for buildings
        ruleType: 'full_year',
        notes: 'As per Income Tax Act Section 32',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        assetClass: 'Furniture',
        category: 'Furniture & Fittings',
        depreciationRate: 10, // 10% per annum for furniture
        ruleType: 'half_year', // Half year rule applicable
        notes: 'Standard rate for office furniture',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        assetClass: 'Plant & Machinery',
        category: 'Plant & Machinery (General)',
        depreciationRate: 15, // 15% per annum for general machinery
        ruleType: 'half_year',
        notes: 'General machinery depreciation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '4',
        assetClass: 'Computer',
        category: 'Computers including software',
        depreciationRate: 40, // 40% per annum for IT equipment
        ruleType: 'half_year',
        notes: 'IT equipment and software',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '5',
        assetClass: 'Vehicle',
        category: 'Motor cars (non-commercial)',
        depreciationRate: 15, // 15% per annum for private vehicles
        ruleType: 'half_year',
        notes: 'Private/company cars',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '6',
        assetClass: 'Books',
        category: 'Books (non-professional)',
        depreciationRate: 100, // 100% depreciation in first year
        ruleType: 'full_year',
        notes: 'Complete depreciation in first year',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '7',
        assetClass: 'Intangible',
        category: 'Intangible assets (licenses, goodwill)',
        depreciationRate: 25, // 25% per annum for intangible assets
        ruleType: 'half_year',
        notes: 'Intellectual property and licenses',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  };

  // ==================== DEPRECIATION CALCULATIONS ====================
  
  /**
   * Calculate IT Act depreciation for all assets
   * This is the core calculation engine that computes depreciation
   * based on IT Act rules and regulations
   */
  const calculateITActDepreciation = () => {
    console.log('ITActDepreciation: Starting depreciation calculations for FY', selectedFY);
    
    const newDepreciationData: ITActDepreciationData[] = [];

    // Process each asset for depreciation calculation
    assets.forEach(asset => {
      console.log('Processing asset for depreciation:', asset.name);
      
      // Find the applicable depreciation slab for this asset
      const matchingSlab = findMatchingSlab(asset);
      if (!matchingSlab) {
        console.warn('No matching slab found for asset:', asset.name);
        return;
      }

      // Determine put-to-use date and half-year rule applicability
      const putToUseDate = new Date(asset.putToUseDate || asset.purchaseDate);
      const isHalfYear = isHalfYearRule(putToUseDate, matchingSlab.ruleType);
      
      // Get opening WDV (Written Down Value) for the financial year
      const openingWDV = getOpeningWDV(asset, selectedFY);
      
      // Calculate depreciation for the current year
      const depreciationRate = matchingSlab.depreciationRate;
      const effectiveRate = isHalfYear ? depreciationRate / 2 : depreciationRate; // Apply half-year rule if applicable
      const currentYearDepreciation = (openingWDV * effectiveRate) / 100;
      const closingWDV = openingWDV - currentYearDepreciation;

      // Create depreciation record
      newDepreciationData.push({
        assetId: asset.id,
        financialYear: selectedFY,
        openingWDV,
        currentYearDepreciation,
        closingWDV: Math.max(closingWDV, asset.residualValue), // Ensure WDV doesn't go below residual value
        halfYearRuleApplied: isHalfYear,
        slabId: matchingSlab.id,
        calculationDetails: {
          putToUseDate: asset.putToUseDate || asset.purchaseDate,
          isHalfYear,
          depreciationRate,
          method: 'WDV'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    // Save calculated data
    console.log('ITActDepreciation: Calculated depreciation for', newDepreciationData.length, 'assets');
    setDepreciationData(newDepreciationData);
    localStorage.setItem('it-act-depreciation-data', JSON.stringify(newDepreciationData));
  };

  /**
   * Find the most appropriate depreciation slab for an asset
   * Uses asset type and category to match with available slabs
   * 
   * @param asset - Asset to find slab for
   * @returns Matching ITActSlab or null if no match found
   */
  const findMatchingSlab = (asset: Asset): ITActSlab | null => {
    const assetType = asset.type.toLowerCase();
    const assetCategory = asset.category?.toLowerCase() || '';

    console.log('Finding matching slab for asset:', asset.name, 'Type:', assetType, 'Category:', assetCategory);

    // Try to find exact or partial matches
    const matchingSlab = itActSlabs.find(slab => {
      const slabClass = slab.assetClass.toLowerCase();
      
      // Check for direct type matches
      const typeMatch = assetType.includes(slabClass) || assetCategory.includes(slabClass);
      
      // Check for specific keyword matches
      const keywordMatches = (
        (assetType.includes('computer') && slabClass.includes('computer')) ||
        (assetType.includes('laptop') && slabClass.includes('computer')) ||
        (assetType.includes('furniture') && slabClass.includes('furniture')) ||
        (assetType.includes('vehicle') && slabClass.includes('vehicle')) ||
        (assetType.includes('car') && slabClass.includes('motor'))
      );
      
      return typeMatch || keywordMatches;
    });

    // Fall back to Plant & Machinery if no specific match found
    return matchingSlab || itActSlabs.find(slab => slab.assetClass === 'Plant & Machinery');
  };

  /**
   * Determine if half-year rule should be applied
   * Half-year rule applies when asset is put to use in the second half of financial year
   * 
   * @param putToUseDate - Date when asset was put to use
   * @param ruleType - Type of rule specified in slab
   * @returns Boolean indicating if half-year rule applies
   */
  const isHalfYearRule = (putToUseDate: Date, ruleType: string): boolean => {
    // If rule type is full_year, half-year rule never applies
    if (ruleType === 'full_year') return false;
    
    // Financial year in India runs from April 1 to March 31
    // Half-year rule applies if asset is put to use after September 30
    const month = putToUseDate.getMonth(); // 0-based months
    const day = putToUseDate.getDate();
    
    // October onwards (month >= 9) or from October 1st (month === 9 && day >= 1)
    return month >= 9 || (month === 9 && day >= 1);
  };

  /**
   * Get opening Written Down Value for an asset in a given financial year
   * This is either the closing WDV from previous year or purchase price for first year
   * 
   * @param asset - Asset to get opening WDV for
   * @param fy - Financial year
   * @returns Opening WDV amount
   */
  const getOpeningWDV = (asset: Asset, fy: string): number => {
    // Try to find closing WDV from previous financial year
    const existingData = depreciationData.find(d => 
      d.assetId === asset.id && d.financialYear === getPreviousFY(fy)
    );
    
    // Return previous year's closing WDV or purchase price if first year
    return existingData ? existingData.closingWDV : asset.purchasePrice;
  };

  /**
   * Get the previous financial year string
   * Converts current FY to previous FY (e.g., "2024-25" -> "2023-24")
   * 
   * @param fy - Current financial year string
   * @returns Previous financial year string
   */
  const getPreviousFY = (fy: string): string => {
    const [startYear] = fy.split('-');
    const prevStartYear = (parseInt(startYear) - 1).toString();
    const prevEndYear = startYear.slice(-2);
    return `${prevStartYear}-${prevEndYear}`;
  };

  // ==================== SLAB MANAGEMENT ====================
  
  /**
   * Create a new IT Act depreciation slab
   * 
   * @param slabData - Slab data without ID and timestamps
   */
  const createSlab = (slabData: Omit<ITActSlab, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Creating new IT Act slab:', slabData.assetClass);
    
    const newSlab: ITActSlab = {
      ...slabData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedSlabs = [...itActSlabs, newSlab];
    setItActSlabs(updatedSlabs);
    localStorage.setItem('it-act-slabs', JSON.stringify(updatedSlabs));
    
    toast({
      title: 'IT Act Slab Created',
      description: `New slab for ${slabData.assetClass} has been created.`,
    });

    setShowSlabForm(false);
  };

  /**
   * Update an existing IT Act depreciation slab
   * 
   * @param id - Slab ID to update
   * @param updates - Partial updates to apply
   */
  const updateSlab = (id: string, updates: Partial<ITActSlab>) => {
    console.log('Updating IT Act slab:', id);
    
    const updatedSlabs = itActSlabs.map(slab =>
      slab.id === id
        ? { ...slab, ...updates, updatedAt: new Date().toISOString() }
        : slab
    );
    
    setItActSlabs(updatedSlabs);
    localStorage.setItem('it-act-slabs', JSON.stringify(updatedSlabs));
    
    toast({
      title: 'IT Act Slab Updated',
      description: 'Slab has been updated successfully.',
    });

    setEditingSlab(null);
  };

  /**
   * Delete an IT Act depreciation slab
   * 
   * @param id - Slab ID to delete
   */
  const deleteSlab = (id: string) => {
    const slab = itActSlabs.find(s => s.id === id);
    if (!slab) return;

    console.log('Attempting to delete slab:', slab.assetClass);

    if (window.confirm(`Are you sure you want to delete the slab for ${slab.assetClass}?`)) {
      const updatedSlabs = itActSlabs.filter(slab => slab.id !== id);
      setItActSlabs(updatedSlabs);
      localStorage.setItem('it-act-slabs', JSON.stringify(updatedSlabs));
      
      toast({
        title: 'IT Act Slab Deleted',
        description: 'Slab has been deleted successfully.',
        variant: 'destructive',
      });
    }
  };

  // ==================== DATA RETRIEVAL HELPERS ====================
  
  /**
   * Get depreciation data for a specific asset
   * 
   * @param assetId - Asset ID to get data for
   * @returns Depreciation data or undefined
   */
  const getAssetDepreciationData = (assetId: string) => {
    return depreciationData.find(d => d.assetId === assetId && d.financialYear === selectedFY);
  };

  // ==================== SORTING AND FILTERING ====================
  
  /**
   * Sort assets based on specified criteria
   * Supports sorting by various fields including calculated values
   * 
   * @param assets - Assets to sort
   * @returns Sorted assets array
   */
  const sortAssets = (assets: Asset[]) => {
    return [...assets].sort((a, b) => {
      let aValue: any = a[sortBy as keyof Asset];
      let bValue: any = b[sortBy as keyof Asset];

      // Handle special sorting cases
      if (sortBy === 'purchasePrice') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else if (sortBy === 'purchaseDate' || sortBy === 'putToUseDate') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      } else if (sortBy === 'depreciationRate') {
        // Sort by applicable depreciation rate
        const slabA = findMatchingSlab(a);
        const slabB = findMatchingSlab(b);
        aValue = slabA?.depreciationRate || 0;
        bValue = slabB?.depreciationRate || 0;
      } else {
        // String-based sorting
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      // Apply sort order
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  };

  /**
   * Filter assets based on current filter criteria
   * Applies company, department, and search filters
   */
  const filteredAssets = assets.filter(asset => {
    // Company filter
    if (companyFilter !== 'all' && asset.company !== companyFilter) return false;
    
    // Department filter
    if (departmentFilter !== 'all' && asset.department !== departmentFilter) return false;
    
    // Search filter - searches across multiple fields
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        asset.name.toLowerCase().includes(searchLower) ||
        asset.serialNumber?.toLowerCase().includes(searchLower) ||
        asset.model?.toLowerCase().includes(searchLower) ||
        asset.manufacturer?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  /**
   * Get unique companies from assets with validation
   * Ensures no empty or invalid values are included
   * 
   * @returns Array of unique company names
   */
  const getUniqueCompanies = (): string[] => {
    console.log('ITActDepreciation - Getting unique companies from assets:', assets);
    
    const companies = [...new Set(assets.map(a => a.company))]
      .filter(company => {
        // Strict validation to ensure no empty values
        const isValid = company && 
                       typeof company === 'string' && 
                       company.trim().length > 0 && 
                       company.trim() !== 'Default Company' && 
                       company.trim() !== 'Unknown Company' &&
                       company.trim() !== 'null' &&
                       company.trim() !== 'undefined';
        
        if (!isValid) {
          console.log('ITActDepreciation - Filtered out invalid company:', company);
        }
        
        return isValid;
      })
      .map(company => company.trim())
      .sort();
    
    console.log('ITActDepreciation - Final unique companies:', companies);
    return companies;
  };
  
  /**
   * Get unique departments from assets with validation
   * Ensures no empty or invalid values are included
   * 
   * @returns Array of unique department names
   */
  const getUniqueDepartments = (): string[] => {
    console.log('ITActDepreciation - Getting unique departments from assets:', assets);
    
    const departments = [...new Set(assets.map(a => a.department))]
      .filter(dept => {
        // Strict validation to ensure no empty values
        const isValid = dept && 
                       typeof dept === 'string' && 
                       dept.trim().length > 0 && 
                       dept.trim() !== 'Default Department' && 
                       dept.trim() !== 'Unknown Department' &&
                       dept.trim() !== 'null' &&
                       dept.trim() !== 'undefined';
        
        if (!isValid) {
          console.log('ITActDepreciation - Filtered out invalid department:', dept);
        }
        
        return isValid;
      })
      .map(dept => dept.trim())
      .sort();
    
    console.log('ITActDepreciation - Final unique departments:', departments);
    return departments;
  };

  /**
   * Get safe filtered assets with additional validation
   * Ensures all asset data is clean and valid for display
   * 
   * @returns Array of validated filtered assets
   */
  const getSafeFilteredAssets = () => {
    return filteredAssets.map(asset => {
      const safeAsset = {
        ...asset,
        company: ensureValidString(asset.company, 'Default Company'),
        department: ensureValidString(asset.department, 'Default Department'),
        type: ensureValidString(asset.type, 'Default Type'),
        category: ensureValidString(asset.category, 'Default Category'),
        name: ensureValidString(asset.name, 'Unnamed Asset'),
        location: ensureValidString(asset.location, 'Default Location'),
        serialNumber: ensureValidString(asset.serialNumber, 'NO-SERIAL'),
        model: ensureValidString(asset.model, 'Unknown Model'),
        manufacturer: ensureValidString(asset.manufacturer, 'Unknown Manufacturer')
      };
      
      // Final validation to ensure no empty strings exist
      Object.keys(safeAsset).forEach(key => {
        if (typeof safeAsset[key] === 'string' && safeAsset[key].trim() === '') {
          console.error('ITActDepreciation - Found empty string in safe asset:', { key, assetId: asset.id });
          safeAsset[key] = `Default ${key}`;
        }
      });
      
      return safeAsset;
    });
  };

  // ==================== DATA PREPARATION ====================
  
  // Prepare data for rendering with proper validation and sorting
  const cleanFilteredAssets = getSafeFilteredAssets();
  const sortedAssets = sortAssets(cleanFilteredAssets);
  const uniqueCompanies = getUniqueCompanies();
  const uniqueDepartments = getUniqueDepartments();

  console.log('ITActDepreciation - Final clean assets being passed to components:', cleanFilteredAssets);
  console.log('ITActDepreciation - Final unique companies for Select:', uniqueCompanies);
  console.log('ITActDepreciation - Final unique departments for Select:', uniqueDepartments);

  // ==================== RENDER ====================
  
  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 min-h-screen bg-background">
      {/* ==================== HEADER SECTION ==================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
            IT Act Depreciation
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Income Tax Act based depreciation calculations and compliance reporting
          </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {/* Financial Year Selector */}
          <Select value={selectedFY} onValueChange={setSelectedFY}>
            <SelectTrigger className="w-24 sm:w-28 lg:w-32 bg-background border-input text-foreground text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border z-50">
              <SelectItem value="2024-25">FY 2024-25</SelectItem>
              <SelectItem value="2023-24">FY 2023-24</SelectItem>
              <SelectItem value="2022-23">FY 2022-23</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ==================== NAVIGATION TABS ==================== */}
      <ITActTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ==================== TAB CONTENT ==================== */}
      <div className="mt-4 sm:mt-6">
        {/* ASSETS TAB - Individual asset depreciation view */}
        {activeTab === 'assets' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Filters Section */}
            <ITActFilters
              companyFilter={companyFilter}
              setCompanyFilter={setCompanyFilter}
              departmentFilter={departmentFilter}
              setDepartmentFilter={setDepartmentFilter}
              uniqueCompanies={uniqueCompanies}
              uniqueDepartments={uniqueDepartments}
              onRecalculate={calculateITActDepreciation}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />

            {/* Assets Table - Responsive design with horizontal scroll on mobile */}
            <Card className="bg-card border-border">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base lg:text-lg text-foreground">
                  Asset Depreciation Overview ({sortedAssets.length} assets)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <ScrollArea className="h-[40vh] sm:h-[50vh] lg:h-[60vh] w-full">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          {/* Asset Name - Always visible, sticky on mobile */}
                          <TableHead className="text-muted-foreground min-w-[120px] text-xs sm:text-sm sticky left-0 bg-card z-10">
                            Asset Name
                          </TableHead>
                          {/* Company - Hidden on mobile */}
                          <TableHead className="text-muted-foreground min-w-[100px] text-xs sm:text-sm hidden sm:table-cell">
                            Company
                          </TableHead>
                          {/* Department - Hidden on mobile */}
                          <TableHead className="text-muted-foreground min-w-[100px] text-xs sm:text-sm hidden md:table-cell">
                            Department
                          </TableHead>
                          {/* Asset Class - Always visible */}
                          <TableHead className="text-muted-foreground min-w-[100px] text-xs sm:text-sm">
                            Asset Class
                          </TableHead>
                          {/* Purchase Cost - Hidden on mobile */}
                          <TableHead className="text-muted-foreground min-w-[100px] text-xs sm:text-sm hidden sm:table-cell">
                            Purchase Cost
                          </TableHead>
                          {/* IT Rate - Always visible */}
                          <TableHead className="text-muted-foreground min-w-[80px] text-xs sm:text-sm">
                            IT Rate
                          </TableHead>
                          {/* Opening WDV - Hidden on mobile */}
                          <TableHead className="text-muted-foreground min-w-[100px] text-xs sm:text-sm hidden lg:table-cell">
                            Opening WDV
                          </TableHead>
                          {/* Depreciation - Always visible */}
                          <TableHead className="text-muted-foreground min-w-[100px] text-xs sm:text-sm">
                            Depreciation
                          </TableHead>
                          {/* Closing WDV - Hidden on mobile */}
                          <TableHead className="text-muted-foreground min-w-[100px] text-xs sm:text-sm hidden lg:table-cell">
                            Closing WDV
                          </TableHead>
                          {/* Half Year - Hidden on mobile */}
                          <TableHead className="text-muted-foreground min-w-[80px] text-xs sm:text-sm hidden sm:table-cell">
                            Half Year
                          </TableHead>
                          {/* Actions - Always visible */}
                          <TableHead className="text-muted-foreground min-w-[80px] text-xs sm:text-sm">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedAssets.map((asset) => {
                          const depData = getAssetDepreciationData(asset.id);
                          const slab = findMatchingSlab(asset);
                          
                          return (
                            <TableRow key={asset.id} className="border-border hover:bg-muted/50 transition-colors">
                              {/* Asset Name Cell - Sticky on mobile */}
                              <TableCell className="text-foreground font-medium text-xs sm:text-sm p-2 sm:p-4 sticky left-0 bg-card z-10">
                                <div className="space-y-1">
                                  <div className="font-medium truncate max-w-[100px] sm:max-w-none">
                                    {asset.name}
                                  </div>
                                  {/* Show additional info on mobile */}
                                  <div className="block sm:hidden text-xs text-muted-foreground space-y-1">
                                    <div>Cost: ₹{asset.purchasePrice.toLocaleString()}</div>
                                    <div>WDV: ₹{depData?.closingWDV.toLocaleString() || '0'}</div>
                                  </div>
                                </div>
                              </TableCell>
                              
                              {/* Company Cell - Hidden on mobile */}
                              <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4 hidden sm:table-cell">
                                {asset.company}
                              </TableCell>
                              
                              {/* Department Cell - Hidden on mobile */}
                              <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4 hidden md:table-cell">
                                {asset.department}
                              </TableCell>
                              
                              {/* Asset Class Cell */}
                              <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4">
                                <Badge variant="outline" className="text-xs">
                                  {slab?.assetClass || 'Unknown'}
                                </Badge>
                              </TableCell>
                              
                              {/* Purchase Cost Cell - Hidden on mobile */}
                              <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4 hidden sm:table-cell">
                                ₹{asset.purchasePrice.toLocaleString()}
                              </TableCell>
                              
                              {/* IT Rate Cell */}
                              <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4">
                                <span className="font-medium text-primary">
                                  {slab?.depreciationRate || 0}%
                                </span>
                              </TableCell>
                              
                              {/* Opening WDV Cell - Hidden on mobile */}
                              <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4 hidden lg:table-cell">
                                ₹{depData?.openingWDV.toLocaleString() || '0'}
                              </TableCell>
                              
                              {/* Depreciation Cell */}
                              <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4">
                                <span className="font-medium text-destructive">
                                  ₹{depData?.currentYearDepreciation.toLocaleString() || '0'}
                                </span>
                              </TableCell>
                              
                              {/* Closing WDV Cell - Hidden on mobile */}
                              <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4 hidden lg:table-cell">
                                ₹{depData?.closingWDV.toLocaleString() || '0'}
                              </TableCell>
                              
                              {/* Half Year Cell - Hidden on mobile */}
                              <TableCell className="p-2 sm:p-4 hidden sm:table-cell">
                                {depData?.halfYearRuleApplied ? (
                                  <Badge className="bg-orange-500/20 text-orange-600 dark:text-orange-300 text-xs">
                                    Yes
                                  </Badge>
                                ) : (
                                  <Badge className="bg-muted text-muted-foreground text-xs">
                                    No
                                  </Badge>
                                )}
                              </TableCell>
                              
                              {/* Actions Cell */}
                              <TableCell className="p-2 sm:p-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedAsset(asset)}
                                  className="text-primary hover:bg-primary/20 h-6 w-6 sm:h-8 sm:w-8 p-0"
                                  title="View Details"
                                >
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SLABS TAB - Depreciation slab management */}
        {activeTab === 'slabs' && (
          <div className="space-y-4 sm:space-y-6">
            <Card className="bg-card border-border">
              <CardHeader className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <CardTitle className="text-sm sm:text-base lg:text-lg text-foreground">
                    IT Act Depreciation Slabs
                  </CardTitle>
                  <Button 
                    onClick={() => setShowSlabForm(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm"
                    size="sm"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Add New Slab
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <ScrollArea className="h-[40vh] sm:h-[50vh] lg:h-[60vh] w-full">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[120px]">
                            Asset Class
                          </TableHead>
                          <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[150px] hidden sm:table-cell">
                            Category
                          </TableHead>
                          <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[80px]">
                            Rate (%)
                          </TableHead>
                          <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[100px] hidden md:table-cell">
                            Rule Type
                          </TableHead>
                          <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[150px] hidden lg:table-cell">
                            Notes
                          </TableHead>
                          <TableHead className="text-muted-foreground text-xs sm:text-sm min-w-[100px]">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {itActSlabs.map((slab) => (
                          <TableRow key={slab.id} className="border-border hover:bg-muted/50 transition-colors">
                            <TableCell className="text-foreground font-medium text-xs sm:text-sm p-2 sm:p-4">
                              <div>
                                <div className="font-medium">{slab.assetClass}</div>
                                {/* Show category on mobile */}
                                <div className="block sm:hidden text-xs text-muted-foreground mt-1">
                                  {slab.category}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4 hidden sm:table-cell">
                              {slab.category}
                            </TableCell>
                            <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4">
                              <span className="font-medium text-primary">{slab.depreciationRate}%</span>
                            </TableCell>
                            <TableCell className="p-2 sm:p-4 hidden md:table-cell">
                              <Badge className={
                                slab.ruleType === 'half_year' 
                                  ? 'bg-orange-500/20 text-orange-600 dark:text-orange-300 text-xs' 
                                  : 'bg-green-500/20 text-green-600 dark:text-green-300 text-xs'
                              }>
                                {slab.ruleType.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-foreground text-xs sm:text-sm p-2 sm:p-4 hidden lg:table-cell">
                              {slab.notes || '-'}
                            </TableCell>
                            <TableCell className="p-2 sm:p-4">
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingSlab(slab)}
                                  className="text-primary hover:bg-primary/20 h-6 w-6 sm:h-8 sm:w-8 p-0"
                                  title="Edit Slab"
                                >
                                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteSlab(slab.id)}
                                  className="text-destructive hover:bg-destructive/20 h-6 w-6 sm:h-8 sm:w-8 p-0"
                                  title="Delete Slab"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* BLOCKS TAB - Asset block management */}
        {activeTab === 'blocks' && (
          <BlockManagement 
            assets={cleanFilteredAssets}
            itActSlabs={itActSlabs}
            selectedFY={selectedFY}
          />
        )}

        {/* ASSIGNMENT TAB - Asset to block assignment */}
        {activeTab === 'assignment' && (
          <AssetAssignment 
            assets={sortedAssets}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        )}

        {/* BLOCK REPORTS TAB - Block-wise reporting */}
        {activeTab === 'block-reports' && (
          <BlockReports 
            assets={cleanFilteredAssets}
            blocks={[]}
            selectedFY={selectedFY}
          />
        )}

        {/* REPORTS TAB - Comprehensive depreciation reports */}
        {activeTab === 'reports' && (
          <ITActReports 
            assets={cleanFilteredAssets}
            depreciationData={depreciationData.filter(d => d.financialYear === selectedFY)}
            itActSlabs={itActSlabs}
            selectedFY={selectedFY}
          />
        )}
      </div>

      {/* ==================== DIALOGS ==================== */}
      
      {/* Add/Edit Slab Dialog */}
      <Dialog open={showSlabForm || !!editingSlab} onOpenChange={() => {
        setShowSlabForm(false);
        setEditingSlab(null);
      }}>
        <DialogContent className="bg-popover border-border max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm sm:text-base lg:text-lg">
              {editingSlab ? 'Edit IT Act Slab' : 'Add IT Act Slab'}
            </DialogTitle>
          </DialogHeader>
          <ITActSlabForm
            slab={editingSlab}
            onSubmit={editingSlab ? 
              (data) => updateSlab(editingSlab.id, data) : 
              createSlab
            }
            onCancel={() => {
              setShowSlabForm(false);
              setEditingSlab(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Asset Details Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="bg-popover border-border max-w-4xl max-h-[90vh] w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-foreground text-sm sm:text-base lg:text-lg">
              IT Act Depreciation Details
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {selectedAsset && (
              <ITActCalculations 
                asset={selectedAsset}
                depreciationData={getAssetDepreciationData(selectedAsset.id)}
                slab={findMatchingSlab(selectedAsset)}
                financialYear={selectedFY}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ITActDepreciation;
