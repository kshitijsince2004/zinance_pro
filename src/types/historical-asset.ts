export interface HistoricalAsset {
  // Enhanced asset fields for historical management
  has_historical_import: boolean;
  historical_import_date?: string;
  historical_import_batch_id?: string;
  original_book_value?: number;
  corrected_book_value?: number;
  impact_adjustment_amount?: number;
  previous_depreciation_method?: string;
  previous_depreciation_rate?: number;
  previous_useful_life?: number;
  is_impact_calculated: boolean;
  is_impact_approved: boolean;
  is_impact_booked: boolean;
  impact_booking_date?: string;
  impact_booking_reference?: string;
}

export interface HistoricalDepreciationRecord {
  id: string;
  asset_id: string;
  financial_year: string; // e.g., "2022-23"
  opening_book_value: number;
  depreciation_charged: number;
  closing_book_value: number;
  depreciation_method: string;
  depreciation_rate: number;
  useful_life: number;
  is_historical: boolean; // true for imported data
  is_immutable: boolean; // true - cannot be edited
  is_booked: boolean; // true for historical data
  created_at: string;
  import_batch_id?: string;
}

export interface ImpactAnalysis {
  id: string;
  asset_id: string;
  asset_name: string;
  analysis_date: string;
  historical_cumulative_depreciation: number;
  correct_cumulative_depreciation: number;
  impact_amount: number; // difference
  impact_type: 'UNDER_DEPRECIATED' | 'OVER_DEPRECIATED' | 'NO_IMPACT';
  status: 'CALCULATED' | 'PENDING_APPROVAL' | 'APPROVED' | 'BOOKED';
  analyzed_by: string;
  approved_by?: string;
  approval_date?: string;
  booking_reference?: string;
  notes?: string;
  year_wise_impact: YearWiseImpact[];
}

export interface YearWiseImpact {
  financial_year: string;
  historical_depreciation: number;
  correct_depreciation: number;
  impact_amount: number;
  opening_book_value: number;
  closing_book_value_historical: number;
  closing_book_value_correct: number;
}

export interface ImportBatch {
  id: string;
  batch_name: string;
  company_id: string;
  import_date: string;
  imported_by: string;
  file_name: string;
  total_assets: number;
  successful_imports: number;
  failed_imports: number;
  assets_with_impact: number;
  total_impact_amount: number;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  import_summary: ImportSummary;
  error_log: ImportError[];
}

export interface ImportSummary {
  assets_imported: number;
  historical_records_created: number;
  impacts_calculated: number;
  total_impact_amount: number;
  avg_impact_percentage: number;
  assets_requiring_approval: number;
}

export interface ImportError {
  id: string;
  batch_id: string;
  row_number: number;
  asset_identifier: string;
  error_type: string;
  error_message: string;
  raw_data: any;
  resolved: boolean;
}

export interface HistoricalImportData {
  // Basic asset information
  asset_id?: string;
  asset_name: string;
  category: string;
  serial_number?: string;
  location?: string;
  
  // Purchase details
  purchase_date: string;
  purchase_price: number;
  
  // Current status
  current_book_value: number;
  accumulated_depreciation: number;
  
  // Historical method details
  historical_method: string;
  historical_rate: number;
  historical_useful_life: number;
  
  // Correct method details
  correct_method: string;
  correct_rate: number;
  correct_useful_life: number;
  
  // Year-wise historical depreciation data
  year_wise_data: {
    [financial_year: string]: {
      opening_value: number;
      depreciation: number;
      closing_value: number;
    };
  };
}

export interface ImpactApprovalRequest {
  impact_ids: string[];
  approved_by: string;
  approval_notes?: string;
  booking_month?: string; // For booking the impact
}

export interface CalculationComparison {
  asset_id: string;
  asset_name: string;
  historical_method: {
    method: string;
    rate: number;
    useful_life: number;
    cumulative_depreciation: number;
    current_book_value: number;
  };
  correct_method: {
    method: string;
    rate: number;
    useful_life: number;
    cumulative_depreciation: number;
    current_book_value: number;
  };
  impact: {
    amount: number;
    percentage: number;
    type: 'UNDER_DEPRECIATED' | 'OVER_DEPRECIATED' | 'NO_IMPACT';
  };
  year_wise_comparison: YearWiseImpact[];
}