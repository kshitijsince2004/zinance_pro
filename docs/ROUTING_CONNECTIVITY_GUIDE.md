# Routing and Connectivity Guide - FAMS
**System Architect: Jasnoor Singh Khalsa**

## Overview

This guide explains the complete routing architecture, connectivity patterns, and navigation flow of the Fixed Asset Management System (FAMS). The system uses React Router for client-side routing and follows a modular, component-based architecture.

## Routing Architecture

### 1. Main App Router Configuration

The main routing is configured in `src/App.tsx`:

```typescript
// Main application router structure
// Author: Jasnoor Singh Khalsa
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // Main layout wrapper
    children: [
      { index: true, element: <Index /> }, // Dashboard home page
      { path: "assets", element: <Assets /> }, // Asset management
      { path: "assets/:id", element: <AssetDetail /> }, // Asset detail view
      { path: "assets/new", element: <AssetForm /> }, // New asset form
      { path: "assets/edit/:id", element: <AssetForm /> }, // Edit asset form
      { path: "calculations", element: <Calculations /> }, // Depreciation calculations
      { path: "calculations/detailed", element: <DetailedCalculations /> }, // Advanced calculations
      { path: "import", element: <Import /> }, // Import/export functionality
      { path: "qr", element: <QRCodes /> }, // QR code management
      { path: "verification", element: <AssetVerification /> }, // Asset verification
      { path: "amc", element: <AMC /> }, // AMC management
      { path: "reports", element: <Reports /> }, // Reporting module
      { path: "settings", element: <Settings /> }, // System settings
      { path: "companies", element: <CompanyManagement /> }, // Company management
      { path: "blocks", element: <Blocks /> }, // Block management
      { path: "integrations", element: <Integrations /> }, // Third-party integrations
      { path: "impact", element: <Impact /> }, // Impact analysis
      { path: "it-depreciation", element: <ITActDepreciation /> }, // IT Act depreciation
      { path: "roles", element: <Roles /> }, // Role management
      { path: "admin", element: <Admin /> }, // Admin panel
      { path: "lookup", element: <AssetLookup /> }, // Asset lookup
      { path: "*", element: <NotFound /> } // 404 page
    ]
  }
]);
```

### 2. Route Protection and Guards

```typescript
// Route protection implementation
// Author: Jasnoor Singh Khalsa
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission
}) => {
  const { user, isAuthenticated } = useAuth();
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role-based access
  if (requiredRole && !user?.roles?.includes(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Check permission-based access
  if (requiredPermission && !user?.permissions?.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};
```

### 3. Navigation Component Structure

```typescript
// Navigation menu configuration
// Author: Jasnoor Singh Khalsa
const navigationItems = [
  {
    title: "Dashboard",
    icon: <Home className="h-4 w-4" />,
    href: "/",
    badge: null
  },
  {
    title: "Assets",
    icon: <Package className="h-4 w-4" />,
    href: "/assets",
    badge: null,
    subItems: [
      { title: "All Assets", href: "/assets" },
      { title: "Add Asset", href: "/assets/new" },
      { title: "Asset Lookup", href: "/lookup" }
    ]
  },
  {
    title: "Calculations",
    icon: <Calculator className="h-4 w-4" />,
    href: "/calculations",
    subItems: [
      { title: "Basic Calculations", href: "/calculations" },
      { title: "Detailed Calculations", href: "/calculations/detailed" },
      { title: "IT Act Depreciation", href: "/it-depreciation" }
    ]
  },
  {
    title: "Import/Export",
    icon: <FileText className="h-4 w-4" />,
    href: "/import",
    badge: null
  },
  {
    title: "QR Codes",
    icon: <QrCode className="h-4 w-4" />,
    href: "/qr",
    badge: null
  },
  {
    title: "Verification",
    icon: <CheckCircle className="h-4 w-4" />,
    href: "/verification",
    badge: null
  },
  {
    title: "AMC",
    icon: <Wrench className="h-4 w-4" />,
    href: "/amc",
    badge: null
  },
  {
    title: "Reports",
    icon: <BarChart className="h-4 w-4" />,
    href: "/reports",
    badge: null
  },
  {
    title: "Settings",
    icon: <Settings className="h-4 w-4" />,
    href: "/settings",
    badge: null
  }
];
```

## Connectivity Patterns

### 1. Data Flow Architecture

```typescript
// Data flow pattern implementation
// Author: Jasnoor Singh Khalsa

// Service Layer -> Component -> UI
// Example: Asset Management Flow

// 1. Service Layer (src/lib/assets.ts)
class AssetService {
  async getAllAssets(): Promise<Asset[]> {
    // Fetch from API or localStorage
    return await this.apiClient.get('/assets');
  }
  
  async createAsset(asset: CreateAssetRequest): Promise<Asset> {
    // Create asset via API
    const created = await this.apiClient.post('/assets', asset);
    // Update local cache
    this.updateCache(created);
    return created;
  }
}

// 2. Component Layer (src/pages/Assets.tsx)
const Assets: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadAssets();
  }, []);
  
  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await assetService.getAllAssets();
      setAssets(data);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {loading ? <Skeleton /> : <AssetTable assets={assets} />}
    </div>
  );
};
```

### 2. State Management Patterns

```typescript
// Context-based state management
// Author: Jasnoor Singh Khalsa

// Asset Context Provider
interface AssetContextType {
  assets: Asset[];
  selectedAsset: Asset | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadAssets: () => Promise<void>;
  createAsset: (asset: CreateAssetRequest) => Promise<void>;
  updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  selectAsset: (asset: Asset | null) => void;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Implementation of context methods
  const loadAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assetService.getAllAssets();
      setAssets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  const createAsset = async (asset: CreateAssetRequest) => {
    try {
      setLoading(true);
      setError(null);
      const newAsset = await assetService.createAsset(asset);
      setAssets(prev => [...prev, newAsset]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  const updateAsset = async (id: string, updates: Partial<Asset>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedAsset = await assetService.updateAsset(id, updates);
      setAssets(prev => prev.map(asset => asset.id === id ? updatedAsset : asset));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  const deleteAsset = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await assetService.deleteAsset(id);
      setAssets(prev => prev.filter(asset => asset.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    assets,
    selectedAsset,
    loading,
    error,
    loadAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    selectAsset: setSelectedAsset
  };
  
  return (
    <AssetContext.Provider value={value}>
      {children}
    </AssetContext.Provider>
  );
};
```

### 3. Inter-Component Communication

```typescript
// Event-driven communication pattern
// Author: Jasnoor Singh Khalsa

// Event Bus Implementation
class EventBus {
  private events: { [key: string]: Function[] } = {};
  
  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event: string, data?: any) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
  
  off(event: string, callback: Function) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

export const eventBus = new EventBus();

// Usage in components
const AssetForm: React.FC = () => {
  const handleSubmit = async (assetData: CreateAssetRequest) => {
    try {
      const newAsset = await assetService.createAsset(assetData);
      // Emit event to notify other components
      eventBus.emit('asset:created', newAsset);
      // Navigate to asset detail
      navigate(`/assets/${newAsset.id}`);
    } catch (error) {
      console.error('Error creating asset:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Asset Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Asset Type
          </label>
          <select
            id="type"
            name="type"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="">Select Type</option>
            <option value="IT Equipment">IT Equipment</option>
            <option value="Furniture">Furniture</option>
            <option value="Vehicle">Vehicle</option>
          </select>
        </div>
        <div>
          <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">
            Purchase Price
          </label>
          <input
            type="number"
            id="purchasePrice"
            name="purchasePrice"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">
            Purchase Date
          </label>
          <input
            type="date"
            id="purchaseDate"
            name="purchaseDate"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
      </div>
      <div className="mt-6">
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Asset
        </button>
      </div>
    </form>
  );
};

// Listening component
const AssetList: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  
  useEffect(() => {
    // Listen for asset creation events
    const handleAssetCreated = (newAsset: Asset) => {
      setAssets(prev => [...prev, newAsset]);
    };
    
    const handleAssetUpdated = (updatedAsset: Asset) => {
      setAssets(prev => prev.map(asset => 
        asset.id === updatedAsset.id ? updatedAsset : asset
      ));
    };
    
    const handleAssetDeleted = (deletedAssetId: string) => {
      setAssets(prev => prev.filter(asset => asset.id !== deletedAssetId));
    };
    
    eventBus.on('asset:created', handleAssetCreated);
    eventBus.on('asset:updated', handleAssetUpdated);
    eventBus.on('asset:deleted', handleAssetDeleted);
    
    // Cleanup
    return () => {
      eventBus.off('asset:created', handleAssetCreated);
      eventBus.off('asset:updated', handleAssetUpdated);
      eventBus.off('asset:deleted', handleAssetDeleted);
    };
  }, []);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assets.map(asset => (
        <div key={asset.id} className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
          <p className="text-sm text-gray-600">{asset.type}</p>
          <p className="text-sm text-gray-600">₹{asset.purchasePrice.toLocaleString()}</p>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={() => navigate(`/assets/${asset.id}`)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              View
            </button>
            <button
              onClick={() => navigate(`/assets/edit/${asset.id}`)}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Edit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
```

## Navigation Flow Diagrams

### 1. Main Navigation Flow

```
Home (/) 
├── Assets (/assets)
│   ├── Asset Detail (/assets/:id)
│   ├── New Asset (/assets/new)
│   └── Edit Asset (/assets/edit/:id)
├── Calculations (/calculations)
│   ├── Detailed Calculations (/calculations/detailed)
│   └── IT Act Depreciation (/it-depreciation)
├── Import/Export (/import)
├── QR Codes (/qr)
├── Verification (/verification)
├── AMC (/amc)
├── Reports (/reports)
├── Settings (/settings)
└── Admin (/admin)
```

### 2. User Journey Flows

```typescript
// User journey mapping
// Author: Jasnoor Singh Khalsa

// Asset Management Journey
const assetManagementJourney = {
  entry: "/assets",
  steps: [
    { step: 1, page: "/assets", action: "View asset list" },
    { step: 2, page: "/assets/new", action: "Create new asset" },
    { step: 3, page: "/assets/:id", action: "View asset details" },
    { step: 4, page: "/assets/edit/:id", action: "Edit asset" },
    { step: 5, page: "/qr", action: "Generate QR code" },
    { step: 6, page: "/verification", action: "Verify asset" }
  ]
};

// Calculation Journey
const calculationJourney = {
  entry: "/calculations",
  steps: [
    { step: 1, page: "/calculations", action: "Basic calculations" },
    { step: 2, page: "/calculations/detailed", action: "Detailed analysis" },
    { step: 3, page: "/it-depreciation", action: "IT Act compliance" },
    { step: 4, page: "/reports", action: "Generate reports" }
  ]
};

// Import Journey
const importJourney = {
  entry: "/import",
  steps: [
    { step: 1, page: "/import", action: "Upload file" },
    { step: 2, page: "/import", action: "Map columns" },
    { step: 3, page: "/import", action: "Validate data" },
    { step: 4, page: "/import", action: "Process import" },
    { step: 5, page: "/assets", action: "View imported assets" }
  ]
};
```

## Component Connectivity Matrix

### 1. Data Dependencies

```typescript
// Component dependency mapping
// Author: Jasnoor Singh Khalsa

interface ComponentDependency {
  component: string;
  dependencies: string[];
  provides: string[];
  subscribes: string[];
  publishes: string[];
}

const componentDependencies: ComponentDependency[] = [
  {
    component: "AssetForm",
    dependencies: ["assetService", "companyService"],
    provides: ["asset-creation", "asset-update"],
    subscribes: ["company-selected"],
    publishes: ["asset-created", "asset-updated"]
  },
  {
    component: "AssetTable",
    dependencies: ["assetService"],
    provides: ["asset-list", "asset-selection"],
    subscribes: ["asset-created", "asset-updated", "asset-deleted"],
    publishes: ["asset-selected"]
  },
  {
    component: "QRCodeGenerator",
    dependencies: ["qrService"],
    provides: ["qr-generation"],
    subscribes: ["asset-selected"],
    publishes: ["qr-generated"]
  },
  {
    component: "VerificationPanel",
    dependencies: ["verificationService", "assetService"],
    provides: ["asset-verification"],
    subscribes: ["asset-selected", "qr-scanned"],
    publishes: ["asset-verified", "verification-completed"]
  },
  {
    component: "ImportProcessor",
    dependencies: ["importService", "assetService"],
    provides: ["bulk-import"],
    subscribes: ["file-uploaded", "mapping-configured"],
    publishes: ["import-progress", "import-completed"]
  }
];
```

### 2. Service Layer Connectivity

```typescript
// Service interconnection pattern
// Author: Jasnoor Singh Khalsa

// Service Registry
class ServiceRegistry {
  private services: Map<string, any> = new Map();
  
  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }
  
  get<T>(name: string): T {
    return this.services.get(name) as T;
  }
  
  getAll(): Map<string, any> {
    return this.services;
  }
}

export const serviceRegistry = new ServiceRegistry();

// Service registration
serviceRegistry.register('assetService', assetService);
serviceRegistry.register('companyService', companyService);
serviceRegistry.register('importService', importService);
serviceRegistry.register('qrService', qrService);
serviceRegistry.register('verificationService', verificationService);
serviceRegistry.register('amcService', amcService);
serviceRegistry.register('reportService', reportService);
serviceRegistry.register('auditService', auditService);

// Service interconnection example
class AssetService {
  constructor(
    private storage: AssetStorage,
    private auditService: AuditService,
    private historyManager: AssetHistoryManager
  ) {}
  
  async createAsset(assetData: CreateAssetRequest): Promise<Asset> {
    // Create asset
    const asset = await this.storage.createAsset(assetData);
    
    // Log audit trail
    await this.auditService.logAssetCreated(asset.id, asset.name);
    
    // Add to history
    this.historyManager.logHistoryEntry({
      assetId: asset.id,
      action: 'created',
      details: `Asset ${asset.name} created`,
      user: 'current_user'
    });
    
    return asset;
  }
}
```

## URL Structure and Patterns

### 1. RESTful URL Design

```typescript
// URL pattern definitions
// Author: Jasnoor Singh Khalsa

const urlPatterns = {
  // Resource-based URLs
  assets: {
    list: "/assets",
    detail: "/assets/:id",
    create: "/assets/new",
    edit: "/assets/edit/:id",
    delete: "/assets/:id/delete"
  },
  
  // Nested resources
  assetHistory: {
    list: "/assets/:id/history",
    detail: "/assets/:id/history/:historyId"
  },
  
  // Action-based URLs
  calculations: {
    basic: "/calculations",
    detailed: "/calculations/detailed",
    asset: "/calculations/asset/:id"
  },
  
  // Module-based URLs
  modules: {
    import: "/import",
    export: "/export",
    qr: "/qr",
    verification: "/verification",
    amc: "/amc",
    reports: "/reports"
  },
  
  // Admin URLs
  admin: {
    dashboard: "/admin",
    users: "/admin/users",
    roles: "/admin/roles",
    settings: "/admin/settings"
  }
};
```

### 2. Query Parameter Patterns

```typescript
// Query parameter handling
// Author: Jasnoor Singh Khalsa

interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  filter?: {
    company?: string;
    department?: string;
    status?: string;
    type?: string;
  };
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

// URL building utility
const buildUrl = (base: string, params: QueryParams): string => {
  const url = new URL(base, window.location.origin);
  
  if (params.page) url.searchParams.set('page', params.page.toString());
  if (params.limit) url.searchParams.set('limit', params.limit.toString());
  if (params.search) url.searchParams.set('search', params.search);
  
  if (params.filter) {
    Object.entries(params.filter).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }
  
  if (params.sort) {
    url.searchParams.set('sort', params.sort.field);
    url.searchParams.set('order', params.sort.order);
  }
  
  return url.toString();
};

// Usage example
const useAssetFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const filters = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '50'),
    search: searchParams.get('search') || '',
    company: searchParams.get('company') || '',
    department: searchParams.get('department') || '',
    status: searchParams.get('status') || '',
    type: searchParams.get('type') || ''
  };
  
  const updateFilters = (newFilters: Partial<QueryParams>) => {
    const params = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });
    
    setSearchParams(params);
  };
  
  return { filters, updateFilters };
};
```

## Error Handling and Fallbacks

### 1. Route Error Boundaries

```typescript
// Route error boundary implementation
// Author: Jasnoor Singh Khalsa

class RouteErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Route error:', error, errorInfo);
    // Log to error reporting service
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-lg font-medium text-gray-900">Something went wrong</h2>
              <p className="mt-2 text-sm text-gray-600">
                We encountered an error while loading this page. Please try refreshing or contact support if the problem persists.
              </p>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => window.history.back()}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### 2. Loading States and Suspense

```typescript
// Loading and suspense patterns
// Author: Jasnoor Singh Khalsa

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
  </div>
);

const AssetsSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
      <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

const AppRouter: React.FC = () => {
  return (
    <Router>
      <RouteErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route 
                path="assets" 
                element={
                  <Suspense fallback={<AssetsSkeleton />}>
                    <Assets />
                  </Suspense>
                } 
              />
              <Route 
                path="calculations" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Calculations />
                  </Suspense>
                } 
              />
              <Route 
                path="reports" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Reports />
                  </Suspense>
                } 
              />
            </Route>
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </Router>
  );
};
```

## Performance Optimization

### 1. Code Splitting

```typescript
// Route-based code splitting
// Author: Jasnoor Singh Khalsa

const Assets = lazy(() => import('../pages/Assets'));
const Calculations = lazy(() => import('../pages/Calculations'));
const Reports = lazy(() => import('../pages/Reports'));
const Import = lazy(() => import('../pages/Import'));
const QRCodes = lazy(() => import('../pages/QRCodes'));
const AssetVerification = lazy(() => import('../pages/AssetVerification'));
const AMC = lazy(() => import('../pages/AMC'));
const Settings = lazy(() => import('../pages/Settings'));

// Component-based code splitting
const AssetForm = lazy(() => import('../components/AssetForm'));
const QRCodeGenerator = lazy(() => import('../components/QRCodeGenerator'));
const VerificationPanel = lazy(() => import('../components/verification/VerificationPanel'));
const ImportProcessor = lazy(() => import('../components/import/ImportProcessor'));

// Preload critical routes
const preloadRoutes = () => {
  import('../pages/Assets');
  import('../pages/Calculations');
  import('../components/AssetForm');
};

// Call preload on app initialization
setTimeout(preloadRoutes, 2000);
```

### 2. Route Prefetching

```typescript
// Route prefetching implementation
// Author: Jasnoor Singh Khalsa

const usePrefetch = (routes: string[]) => {
  useEffect(() => {
    const prefetchRoute = (route: string) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    };
    
    routes.forEach(prefetchRoute);
    
    return () => {
      // Cleanup prefetch links
      routes.forEach(route => {
        const link = document.querySelector(`link[href="${route}"]`);
        if (link) {
          document.head.removeChild(link);
        }
      });
    };
  }, [routes]);
};

// Usage in navigation component
const Navigation: React.FC = () => {
  usePrefetch(['/assets', '/calculations', '/reports']);
  
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);
  
  useEffect(() => {
    if (hoveredRoute) {
      // Prefetch on hover
      import(`../pages/${hoveredRoute}`);
    }
  }, [hoveredRoute]);
  
  return (
    <nav className="space-y-1">
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          onMouseEnter={() => setHoveredRoute(item.href.slice(1))}
          onMouseLeave={() => setHoveredRoute(null)}
          className="group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-50 hover:text-gray-900"
        >
          {item.icon}
          <span className="ml-3">{item.title}</span>
          {item.badge && (
            <span className="ml-auto inline-block py-0.5 px-3 text-xs rounded-full bg-gray-100 group-hover:bg-gray-200">
              {item.badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
};
```

### 3. Route Caching

```typescript
// Route data caching implementation
// Author: Jasnoor Singh Khalsa

class RouteCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set(key: string, data: any, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  clear(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }
}

export const routeCache = new RouteCache();

// Usage in components
const useAssetData = (assetId?: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      if (!assetId) return;
      
      const cacheKey = `asset_${assetId}`;
      const cached = routeCache.get(cacheKey);
      
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }
      
      try {
        const asset = await assetService.getAssetById(assetId);
        routeCache.set(cacheKey, asset);
        setData(asset);
      } catch (error) {
        console.error('Error loading asset:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [assetId]);
  
  return { data, loading };
};
```

**Routing and Connectivity Guide by: Jasnoor Singh Khalsa**
**Version: 1.0**
**Last Updated: 2024**
