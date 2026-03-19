# ZINANCE — Fixed Asset Management System
## Complete Platform Documentation & Redevelopment Prompt

---

## 1. OBJECTIVES

- **End-to-End Asset Lifecycle Management**: Track every asset from acquisition → registration → deployment → maintenance → verification → depreciation → revaluation → disposal with full audit trails
- **Multi-Method Depreciation Engine**: Support 6 depreciation methods — SLM, WDV, WDV Fixed Slab (IT Act), Double Declining Balance, Sum of Years' Digits, Units of Production — all with date-to-date precision and financial-year-aware calculations
- **Real-Time QR-Based Verification**: Session-based physical verification campaigns using QR code scanning, with location tracking, condition assessment, and discrepancy management
- **Regulatory Compliance Reporting**: Auto-generate Companies Act Schedule II and Income Tax Act Section 32 compliant reports (FA Register, IT Act Depreciation Schedules)
- **AMC & Service Contract Management**: Schedule, track, and manage Annual Maintenance Contracts, warranty periods, insurance policies, and vendor service records with automated reminders
- **Block-Wise Asset Organization**: Organize assets across companies, departments, locations, cost centers, and blocks for structured depreciation and reporting
- **Enterprise Data Integration**: Import/export with Excel/CSV, plus connector architecture for SAP, Tally, and Dynamics 365 ERP systems
- **Granular Role-Based Access Control (RBAC)**: Multi-tier user system with 5 roles (super_admin, admin, manager, amc_officer, viewer), company/department-level access scoping, and permission matrix management
- **Impact Analysis & What-If Scenarios**: Analyze the financial impact of asset decisions before execution
- **Public-Facing Website with Authenticated Platform**: Marketing website (home, features, pricing, about) connected to the authenticated FAMS platform

---

## 2. SYSTEM BLOCK DIAGRAM

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PUBLIC WEBSITE (Unauthenticated)                     │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Home   │  │ Features │  │ Pricing │  │  About   │  │ Contact/CTA   │  │
│  │  Page   │  │   Page   │  │  Page   │  │   Page   │  │  → Login/Reg  │  │
│  └─────────┘  └──────────┘  └─────────┘  └──────────┘  └───────────────┘  │
└───────────────────────────────┬──────────────────────────────────────────────┘
                                │ Authentication Gate
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION & SESSION LAYER                           │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐  ┌────────────┐  │
│  │ Login/Register│  │ JWT Token Mgmt│  │ Session Manager│  │ Cross-Tab  │  │
│  │ (Email+Pass) │  │ (Issue/Verify)│  │ (localStorage) │  │ Sync Events│  │
│  └──────────────┘  └───────────────┘  └────────────────┘  └────────────┘  │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐                  │
│  │ Role Manager │  │ Permission    │  │ Access Control │                  │
│  │ (5 roles)    │  │ Matrix Check  │  │ (Co/Dept/Global│                  │
│  └──────────────┘  └───────────────┘  └────────────────┘                  │
└───────────────────────────────┬──────────────────────────────────────────────┘
                                │ Authorized
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER (React SPA)                         │
│                                                                             │
│  MAIN MENU:                                                                │
│  ┌───────────┐ ┌────────┐ ┌──────────────┐ ┌──────────┐                   │
│  │ Dashboard │ │ Assets │ │ Import/Export │ │ QR Codes │                   │
│  │ (Index)   │ │ (CRUD) │ │ (Excel/CSV)  │ │ (Generate│                   │
│  └───────────┘ └────────┘ └──────────────┘ └──────────┘                   │
│                                                                             │
│  CONDITIONAL MODULES (toggleable via Settings):                            │
│  ┌──────────────┐ ┌──────────────────┐ ┌─────────┐ ┌──────────────┐       │
│  │ Calculations │ │ IT Act           │ │ Reports │ │ Integrations │       │
│  │ (6 methods)  │ │ Depreciation     │ │ (FA Reg)│ │ (SAP/Tally)  │       │
│  └──────────────┘ └──────────────────┘ └─────────┘ └──────────────┘       │
│                                                                             │
│  MANAGEMENT:                                                               │
│  ┌───────────┐ ┌──────────────┐ ┌────────────────┐                        │
│  │ Companies │ │ Verification │ │ AMC Management │                        │
│  └───────────┘ └──────────────┘ └────────────────┘                        │
│                                                                             │
│  ADMINISTRATION:                                                           │
│  ┌──────────────────┐ ┌─────────────┐ ┌──────────┐ ┌────────┐            │
│  │ Roles&Permissions│ │ Admin Panel │ │ Settings │ │ Impact │            │
│  └──────────────────┘ └─────────────┘ └──────────┘ └────────┘            │
└───────────────────────────────┬──────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LOGIC LAYER                               │
│                                                                             │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────────┐  │
│  │ Asset Service       │  │ Depreciation        │  │ Asset Analytics      │  │
│  │ • createAsset()     │  │ Calculator          │  │ • getAssetSummary()  │  │
│  │ • updateAsset()     │  │ • SLM (date-to-date)│  │ • getByDepartment()  │  │
│  │ • deleteAsset()     │  │ • WDV (compound)    │  │ • getByCompany()     │  │
│  │ • disposeAsset()    │  │ • WDV Fixed Slab    │  │ • getAmcStatus()     │  │
│  │ • verifyAsset()     │  │ • Double Declining  │  │ • getValueTrend()    │  │
│  │ • bulkCreateAssets()│  │ • Sum of Years      │  │ • getReminders()     │  │
│  │ • importFromExcel() │  │ • Units of Prod.    │  │                      │  │
│  └────────────────────┘  └────────────────────┘  └──────────────────────┘  │
│                                                                             │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────────┐  │
│  │ Company Manager     │  │ Audit Service       │  │ Notification Service │  │
│  │ • createCompany()   │  │ • logAssetCreated() │  │ • addNotification()  │  │
│  │ • generateSerial()  │  │ • logAssetUpdated() │  │ • getNotifications() │  │
│  │ • updateSerialFmt() │  │ • logAssetDeleted() │  │ • markRead()         │  │
│  └────────────────────┘  └────────────────────┘  └──────────────────────┘  │
│                                                                             │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────────┐  │
│  │ Service Records Mgr │  │ Import Logger       │  │ Reports Service      │  │
│  │ • addRecord()       │  │ • logImport()       │  │ • generateFARegister │  │
│  │ • updateStatus()    │  │ • getImportLogs()   │  │ • generateDepReport  │  │
│  │ • cleanupOrphaned() │  │ • getBatchDetails() │  │ • exportPDF/Excel    │  │
│  └────────────────────┘  └────────────────────┘  └──────────────────────┘  │
│                                                                             │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────────┐  │
│  │ Asset Storage       │  │ Asset Trends        │  │ Impact Analysis      │  │
│  │ (localStorage now,  │  │ • getTotalTrend()   │  │ • whatIfScenarios()  │  │
│  │  database in redev) │  │ • getValueTrend()   │  │ • disposalImpact()   │  │
│  │ • saveAssets()      │  │ • getAmcTrend()     │  │ • revaluationImpact()│  │
│  │ • getActivities()   │  │ • getExpiringTrend()│  │                      │  │
│  └────────────────────┘  └────────────────────┘  └──────────────────────┘  │
└───────────────────────────────┬──────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATA PERSISTENCE LAYER                              │
│  Currently: localStorage (browser)                                         │
│  Target: PostgreSQL / MySQL database via REST API                          │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ assets       │  │ companies    │  │ users        │  │ audit_logs   │   │
│  │ • id         │  │ • id         │  │ • id         │  │ • id         │   │
│  │ • name       │  │ • name       │  │ • email      │  │ • action     │   │
│  │ • type       │  │ • departments│  │ • name       │  │ • entity     │   │
│  │ • category   │  │ • serialFmt  │  │ • role       │  │ • entityId   │   │
│  │ • purchaseP  │  │ • deprMethod │  │ • accessLevel│  │ • changes    │   │
│  │ • residualV  │  │              │  │ • allowedCo  │  │ • timestamp  │   │
│  │ • currentV   │  │              │  │ • allowedDpt │  │              │   │
│  │ • deprMethod │  │              │  │              │  │              │   │
│  │ • status     │  │              │  │              │  │              │   │
│  │ • company    │  │              │  │              │  │              │   │
│  │ • department │  │              │  │              │  │              │   │
│  │ • ...40+flds │  │              │  │              │  │              │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ depreciation │  │ verification │  │ amc_contracts│  │ service_     │   │
│  │ _records     │  │ _sessions    │  │              │  │ records      │   │
│  │ • assetId    │  │ • sessionId  │  │ • assetId    │  │ • assetId    │   │
│  │ • method     │  │ • assetIds   │  │ • vendorName │  │ • serviceType│   │
│  │ • yearlyAmts │  │ • status     │  │ • startDate  │  │ • date       │   │
│  │ • schedule   │  │ • verifiedBy │  │ • endDate    │  │ • vendor     │   │
│  │ • fyYear     │  │ • location   │  │ • cost       │  │ • cost       │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                     │
│  │ import_logs  │  │ notifications│  │ blocks       │                     │
│  │ • batchId    │  │ • userId     │  │ • blockName  │                     │
│  │ • fileName   │  │ • title      │  │ • company    │                     │
│  │ • rowCount   │  │ • message    │  │ • department │                     │
│  │ • success    │  │ • type       │  │ • assetIds   │                     │
│  │ • failed     │  │ • isRead     │  │ • deprRate   │                     │
│  └──────────────┘  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 User Flow Diagram

```
                    ┌─────────────────┐
                    │  Public Website  │
                    │  (Home/Features/ │
                    │   Pricing/About) │
                    └────────┬────────┘
                             │
                     ┌───────▼───────┐
                     │   Auth Gate   │
                     │ Login/Register│
                     └───────┬───────┘
                             │ Authenticated
                    ┌────────▼────────┐
                    │    Dashboard    │
                    │ (Stats, Charts, │
                    │ Activities,     │
                    │ Reminders)      │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐     ┌─────▼─────┐     ┌─────▼─────┐
    │ MAIN MENU │     │ MANAGEMENT│     │   ADMIN   │
    ├───────────┤     ├───────────┤     ├───────────┤
    │• Assets   │     │• Companies│     │• Roles    │
    │• Import   │     │• Verify   │     │• Admin    │
    │• QR Codes │     │• AMC      │     │• Settings │
    │• Calcs    │     └───────────┘     │• Impact   │
    │• IT Act   │                       └───────────┘
    │• Reports  │
    │• Integrate│
    └───────────┘
```

### 2.3 Asset Lifecycle Flow

```
  Purchase/Acquire
        │
        ▼
  ┌─────────────┐     ┌──────────────┐
  │ Registration │────▶│ Serial Number│
  │ (Manual/Bulk │     │ Generation   │
  │  /Import)    │     └──────┬───────┘
  └──────┬───────┘            │
         │              ┌─────▼──────┐
         │              │ QR Code    │
         │              │ Generation │
         │              └────────────┘
         ▼
  ┌─────────────┐
  │ Active Asset │◀──────────────────────────┐
  │ (Deployed)   │                           │
  └──────┬───────┘                           │
         │                                   │
    ┌────┴────┐                              │
    │         │                              │
    ▼         ▼                              │
┌────────┐ ┌───────────┐              ┌─────┴──────┐
│Maintain│ │ Depreciate│              │ Revaluate  │
│(AMC/   │ │ (6 methods│              │ (Fair Value│
│Service)│ │  applied) │              │  Adjust)   │
└────────┘ └───────────┘              └────────────┘
    │         │
    ▼         ▼
┌─────────────────┐
│    Verify       │
│ (QR Scan, Phys.)│
│ (Session-based) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Dispose      │
│ • Sale          │
│ • Write-off     │
│ • Transfer      │
│ • Scrap         │
└─────────────────┘
    Status → 'sold' or 'retired'
    No depreciation in disposal year (IT Act rule)
```

---

## 3. METHODOLOGY

### 3.1 Technology Stack (Current)
- **Frontend**: React 18 + TypeScript + Vite 5
- **Styling**: Tailwind CSS 3.4 + shadcn/ui components
- **State Management**: React Query (TanStack) + React Context
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **QR**: qrcode.react (generation) + jsqr (scanning)
- **Excel**: xlsx library for import/export
- **Routing**: React Router DOM v6

### 3.2 Current Data Storage
- **ALL data stored in localStorage** (browser-only, no backend)
- Asset data: `localStorage.getItem('assets')`
- Company data: `localStorage.getItem('companies')`
- User session: `localStorage.getItem('currentUser')`
- Module config: `localStorage.getItem('module_<key>')`
- Activities: `localStorage.getItem('activities')`
- Notifications: `localStorage.getItem('notifications')`
- Audit logs: `localStorage.getItem('audit_logs')`
- Import logs: `localStorage.getItem('import_logs')`
- Service records: `localStorage.getItem('service_records')`

### 3.3 Authentication System (Current)
- **Mock-based**: 4 hardcoded users in `src/lib/auth.ts`
- **Roles**: super_admin, admin, manager, amc_officer, viewer
- **Demo credentials**: admin@herocorp.com / password123
- **Session**: Stored in localStorage, cross-tab sync via StorageEvent
- **Access levels**: global (all companies), company (specific companies), department (specific departments)
- **Access modifiers**: isCompanyHead (all depts in company), isDepartmentHead (own dept)

### 3.4 Role-Permission Matrix (Current)
| Role | Dashboard | Assets (R/W) | Import | QR | Calculations | IT Act | Reports | Integrations | Companies | Verification | AMC | Roles | Admin | Settings |
|------|-----------|-------------|--------|-----|-------------|--------|---------|-------------|-----------|-------------|-----|-------|-------|----------|
| super_admin | ✅ | ✅/✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| admin | ✅ | ✅/✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| manager | ✅ | ✅/✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| amc_officer | ✅ | ✅/❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |
| viewer | ✅ | ✅/❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 3.5 Design System & Color Theme

#### Dark Mode (Default — Primary Theme)
| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--background` | `0 0% 0%` | Page background (pure black) |
| `--foreground` | `0 0% 100%` | Primary text (white) |
| `--card` | `0 0% 5%` | Card backgrounds |
| `--primary` | `120 100% 25%` | Brand green (buttons, accents, links) |
| `--primary-foreground` | `0 0% 100%` | Text on primary (white) |
| `--secondary` | `0 0% 10%` | Secondary backgrounds |
| `--muted` | `0 0% 10%` | Muted backgrounds |
| `--muted-foreground` | `0 0% 65%` | Muted text |
| `--destructive` | `25 100% 50%` | Error/warning (orange) |
| `--border` | `0 0% 15%` | Border color |
| `--ring` | `120 100% 25%` | Focus ring (green) |

#### Light Mode
| Token | HSL Value | Usage |
|-------|-----------|-------|
| `--background` | `0 0% 100%` | Page background (white) |
| `--foreground` | `240 10% 3.9%` | Primary text (near-black) |
| `--card` | `0 0% 100%` | Card backgrounds |
| `--primary` | `120 100% 25%` | Same brand green |
| `--muted-foreground` | `240 3.8% 46.1%` | Muted text |

#### Custom CSS Variables (Both Modes)
| Variable | Dark Value | Light Value | Purpose |
|----------|-----------|-------------|---------|
| `--green` | `#16a34a` | `#16a34a` | Brand green accent |
| `--orange` | `#ea580c` | `#ea580c` | Warning/destructive |
| `--text-primary` | `#ffffff` | `#000000` | Primary text |
| `--text-secondary` | `#d1d5db` | `#374151` | Secondary text |
| `--text-muted` | `#9ca3af` | `#6b7280` | Muted text |
| `--bg-card` | `rgba(23,23,23,0.8)` | `rgba(255,255,255,0.9)` | Glass card bg |
| `--bg-glass` | `rgba(23,23,23,0.95)` | `rgba(255,255,255,0.95)` | Glass effect bg |

#### Visual Effects
- **Glass morphism**: `backdrop-filter: blur(10px)` on cards and sidebar
- **Animations**: `fadeIn`, `slideUp`, `scaleIn`, `shimmer`, `glow`
- **Shadows**: `card-hover: 0 20px 40px -12px rgba(34, 197, 94, 0.3)` (green glow)
- **Border style**: `border-green-500/20` for card borders (subtle green border)

### 3.6 Navigation Structure

**Sidebar Layout** (`AppSidebar.tsx`):
```
┌──────────────────────────────┐
│  [Logo] Zinance              │
│  Enterprise Asset Management │
├──────────────────────────────┤
│  MAIN MENU                   │
│  ▸ Dashboard          (/)    │
│  ▸ Assets        (/assets)   │
│  ▸ Import/Export (/import)   │
│  ▸ QR Codes    (/qr-codes)  │
│  ▸ Calculations*(/calcs)    │
│  ▸ IT Act Depr* (/it-act)   │
│  ▸ Reports*    (/reports)   │
│  ▸ Integrations*(/integr)   │
├──────────────────────────────┤
│  MANAGEMENT                  │
│  ▸ Companies   (/companies) │
│  ▸ Verification(/verify)    │
│  ▸ AMC Mgmt   (/amc)       │
├──────────────────────────────┤
│  ADMINISTRATION              │
│  ▸ Roles & Perm (/roles)    │
│  ▸ Admin Panel  (/admin)    │
│  ▸ Settings    (/settings)  │
├──────────────────────────────┤
│  [Avatar] User Name          │
│           Role               │
│  [Bell] [Logout]             │
└──────────────────────────────┘

* = Conditionally shown based on module toggle (Settings page)
```

### 3.7 Page-by-Page Breakdown

#### 3.7.1 Dashboard (`/` → `Index.tsx`)
- **Stats Cards (4)**: Total Assets, Total Value (₹), Active AMCs, Expiring Soon (30 days)
- Each card shows trend badge (e.g., "+12.5%", "-3.2%", "No change") calculated from `AssetTrends` service
- **Bar Chart**: Assets by Department (or Company if no department data)
- **Pie Chart**: AMC Status breakdown (Active, Expired, Expiring, No AMC)
- **Line Chart**: Asset Value Trend over time (with depreciation applied)
- **Recent Activity Feed**: Last 5 activities (asset added/updated/deleted/verified)
- **Upcoming Reminders**: Warranty/AMC/Insurance expiry within 30 days with priority badges
- **Quick Action Button**: "+ Add Asset" (visible to users with write permission)

#### 3.7.2 Assets (`/assets` → `Assets.tsx`)
- **Sub-components**: `AssetStatsCards`, `AssetFilters`, `AssetTable`, `BulkActionsBar`, `DisposedAssetsSection`, `FARegisterSection`, `DepreciationDateSelector`
- **Features**: Search, filter by company/department/status/type, sort, bulk select, pagination
- **Asset Table columns**: Serial No, Name, Category, Company, Department, Purchase Price, Current Value, Depreciation %, Status, Actions
- **Bulk Actions**: Bulk verify, bulk dispose, bulk export
- **FA Register tab**: Companies Act compliant Fixed Asset Register view
- **Disposed Assets tab**: View retired/sold assets separately

#### 3.7.3 Asset Form (`/assets/new`, `/assets/:id/edit` → `AssetForm.tsx`)
- Multi-section form with all 40+ asset fields
- Auto-generates serial number based on company serial format
- Auto-sets warranty/AMC/insurance dates based on industry standards per category
- QR code auto-generated on save
- Depreciation method selector with live preview
- Parent-child asset linking (accessories)
- Invoice/billing details section
- Company and department dropdowns filtered by user access

#### 3.7.4 Asset Detail (`/assets/:id` → `AssetDetail.tsx`)
- Full asset information display
- Depreciation schedule visualization
- Ownership history (`AssetOwnershipHistory` component)
- Service records history
- QR code display with download
- Edit/Dispose/Verify action buttons
- Asset history timeline (`AssetHistorySection`)

#### 3.7.5 Import & Export (`/import` → `Import.tsx`)
- **Sub-components**: `FileUploader`, `ColumnMapper`, `DataPreview`, `DataTable`, `ImportProgress`, `ImportResult`, `ImportSummary`, `ExportModule`, `ImportLogs`, `ValidationAlerts`, `SmartDecisionAlerts`, `ImpactAnalysisPreview`, `HistoricalImportWizard`
- **Import Flow**: Upload Excel/CSV → Column Mapping → Data Validation → Preview → Smart Alerts → Process → Result Summary
- **Historical Import**: Separate wizard for importing historical asset data with existing book values
- **Export**: Generate Excel/CSV with filtered data
- **Import Logs**: Full audit trail of all imports with batch IDs, success/fail counts

#### 3.7.6 QR Codes (`/qr-codes` → `QRCodes.tsx`)
- **Sub-components**: `QRCodeDisplay`, `QRCodeActions`, `QRCodeOptions`, `AssetDetails`
- Generate QR codes for individual or all assets
- Configurable QR options (size, format, label inclusion)
- Bulk print/download QR code sheets
- QR encodes asset serial number linked to `/lookup/:serialNumber` public route

#### 3.7.7 Calculations (`/calculations` → `Calculations.tsx`)
- **Sub-components**: `CalculatorInputs`, `CalculationResults`, `CalculationSummary`, `AssetClassesSection`, `MethodsSection`, `AdvancedSettingsSection`, `AdvancedMethodsSection`, `AdvancedAssetClassesSection`, `YearOnYearTable`, `StepByStepDisplay`, `AssetLifecycleDisplay`
- Interactive depreciation calculator for any asset parameters
- Side-by-side method comparison (SLM vs WDV vs DDB vs SYD)
- Year-on-year depreciation schedule table
- Step-by-step calculation breakdown with formulas shown
- Asset lifecycle visualization

#### 3.7.8 Detailed Calculations (`/calculations/:id`, `/calculations/detailed` → `DetailedCalculations.tsx`)
- Deep-dive calculation view for specific assets
- `EnhancedDepreciationCalculators` and `DetailedMethodCalculators` components
- Full schedule with monthly/yearly breakdown

#### 3.7.9 IT Act Depreciation (`/it-act-depreciation` → `ITActDepreciation.tsx`)
- **Sub-components**: `ITActCalculations`, `ITActFilters`, `ITActReports`, `ITActSlabForm`, `ITActTabs`
- Income Tax Act Section 32 fixed slab rates (from `FIXED_DEPRECIATION_RATES`)
- Block-wise depreciation as per IT Act
- 62 predefined asset categories with IT Act rates (e.g., Computers: 40%, Buildings: 5%, Furniture: 25%)
- Financial year aware (April-March)
- IT Act rule: No depreciation in disposal year

#### 3.7.10 Reports (`/reports` → `Reports.tsx`)
- **Sub-components**: `ReportsFilters`, `DashboardWidgets`, `ComparisonModule`, `ExportModule`, `TrendAnalysis`
- Fixed Asset Register (Companies Act Schedule II format)
- Depreciation schedule reports
- Asset comparison across periods
- Trend analysis with charts
- Export to PDF/Excel

#### 3.7.11 Integrations (`/integrations` → `Integrations.tsx`)
- **Sub-components**: `SAPIntegration`, `TallyIntegration`, `DynamicsIntegration`, `FieldMapper`, `ImportExportControls`, `IntegrationLogs`, `SyncStatus`
- Connector UI for SAP, Tally, Dynamics 365
- Field mapping configuration
- Sync status monitoring
- Integration activity logs
- **Note**: Currently UI-only, no actual API connections

#### 3.7.12 Companies (`/companies` → `CompanyManagement.tsx`)
- **Sub-components**: `CompanySetup`, `SerialNumberSetup`
- Create and manage companies
- Configure departments per company
- Set up serial number format per department per asset class (e.g., `IT-LAP-{0001}`)
- Set default depreciation methods per department

#### 3.7.13 Verification (`/verification` → `AssetVerification.tsx`)
- **Sub-components**: `VerificationModule`, `VerificationSessionManager`, `QRScanVerification`, `DisposalQueue`, `SessionDetailsDialog`
- Create verification sessions (select assets to verify)
- QR scan interface using device camera (jsqr library)
- Mark assets as verified with location/condition
- Track discrepancies (missing, damaged, relocated)
- Disposal queue for assets flagged during verification

#### 3.7.14 AMC Management (`/amc` → `AMC.tsx`)
- **Sub-components**: `AmcSummaryCards`, `ServiceManagement`, `TaskManagement`, `CalendarView`, `ReminderConfiguration`, `ServiceCard`, `ServiceForm`
- AMC summary dashboard (active, expiring, expired contracts)
- Service record management (add/edit service entries)
- Task management for maintenance activities
- Calendar view for scheduled services
- Configurable reminder settings (days before expiry)

#### 3.7.15 Roles & Permissions (`/roles` → `Roles.tsx`)
- **Sub-components**: `RoleDefinitionManager`, `PermissionMatrixManager`, `AccessControlManager`
- Define custom roles
- Configure permission matrix (resource × action)
- Access control manager for company/department scoping

#### 3.7.16 Admin Panel (`/admin` → `Admin.tsx`)
- User management (create, edit, activate/deactivate users)
- `UserDialog` component for user CRUD
- View user statistics and role distribution
- System overview

#### 3.7.17 Settings (`/settings` → `Settings.tsx`)
- **Sub-component**: `FieldConfiguration`
- Module toggle (enable/disable: Calculations, IT Act, Reports, Integrations, Blocks)
- Module state persisted in localStorage (`module_<key>`)
- Field configuration for custom asset fields
- Theme toggle (dark/light via `ThemeContext`)

#### 3.7.18 Impact Analysis (`/impact` → `Impact.tsx`)
- **Sub-component**: `ImpactAnalysisModule`
- What-if scenario analysis for asset decisions
- Financial impact preview before disposal/revaluation

#### 3.7.19 Blocks (`/blocks` → `Blocks.tsx`)
- **Sub-components**: `BlockManagement`, `BlockTable`, `BlockForm`, `BlockFilters`, `BlockSummaryCards`, `BlockReports`, `BlockAssetManager`, `AssetAssignment`
- Block-wise asset grouping for IT Act depreciation
- Block creation with depreciation rates
- Asset assignment to blocks
- Block summary reports

#### 3.7.20 Asset Lookup (`/lookup/:serialNumber` → `AssetLookup.tsx`)
- **Public route** (no auth required)
- Scanned QR code leads here
- Displays basic asset information for physical verification

### 3.8 Depreciation Calculation Logic (Detailed)

All calculations are in `src/lib/depreciation/calculations.ts`:

#### SLM (Straight Line Method) — Date-to-Date
```
Depreciable Amount = Purchase Price - Residual Value
Days Elapsed = (Current Date - Put to Use Date) in days
Total Useful Life Days = Useful Life × 365
Total Depreciation = min(Depreciable Amount × Days Elapsed / Total Useful Life Days, Depreciable Amount)
Current Value = max(Purchase Price - Total Depreciation, Residual Value)
```

#### WDV (Written Down Value) — Compound Depreciation
```
Rate = (1 - (Residual Value / Cost)^(1/Useful Life)) × 100
  - Rate clamped between 1% and 100%
  - Residual value adjusted to min 5% of cost
Years Elapsed = Days Elapsed / 365
Current Value = Purchase Price × (1 - Rate/100)^Years Elapsed
Final Value = max(Current Value, Residual Value)
```

#### WDV Fixed Slab (IT Act) — Financial Year Based
```
Rate = FIXED_DEPRECIATION_RATES[category] (e.g., Computers: 40%)
Financial Year = April 1 to March 31
For each FY from put-to-use year to current FY:
  Yearly Depreciation = Book Value × Rate / 100
  Book Value = Book Value - Yearly Depreciation
DISPOSAL RULE: No depreciation in year of disposal
  If disposed in same year as purchase → 0 depreciation
```

#### Double Declining Balance — Daily
```
Rate = (2 / Useful Life) × 100
Daily Rate = Rate / 100 / 365.25
For each day elapsed:
  Daily Depreciation = Book Value × Daily Rate
  If (Book Value - Daily Depreciation) < Residual Value → stop
  Book Value = Book Value - Daily Depreciation
```

#### Sum of Years' Digits — Hybrid
```
Sum of Years = Useful Life × (Useful Life + 1) / 2
Depreciable Base = Purchase Price - Residual Value
For each complete year:
  Remaining Life = Useful Life - Year + 1
  Yearly Depreciation = (Remaining Life / Sum of Years) × Depreciable Base
For partial year: pro-rata of next year's depreciation
Current Value = max(Purchase Price - Total Depreciation, Residual Value)
```

#### Units of Production
```
Depreciable Amount = Purchase Price - Residual Value
Depreciation Per Unit = Depreciable Amount / Total Production Capacity
Units Used = min(Units Produced, Total Capacity)
Total Depreciation = Depreciation Per Unit × Units Used
Current Value = max(Purchase Price - Total Depreciation, Residual Value)
```

### 3.9 Asset Data Model (Complete — 40+ Fields)

```typescript
interface Asset {
  // Core Identity
  id: string;
  name: string;
  type: string;                    // e.g., "Laptop", "Furniture"
  category: string;                // Maps to IT Act slab rates
  serialNumber?: string;           // Auto-generated or manual

  // Financial
  purchaseDate: string;
  putToUseDate?: string;           // When asset was first used (for depreciation start)
  purchasePrice: number;
  depreciationRate: number;
  residualValue: number;
  currentValue: number;            // Auto-calculated by depreciation engine
  depreciationMethod: 'SLM' | 'WDV' | 'WDV_FIXED_SLAB' | 'UNITS' | 'DOUBLE_DECLINING' | 'SUM_OF_YEARS';
  usefulLife?: number;             // In years
  startFromCurrentValue?: boolean; // For historical imports

  // Organizational
  owner: string;
  department: string;
  company: string;
  location: string;
  office: string;
  assignedTo?: string;

  // Vendor & Invoice
  vendor: string;
  invoiceNumber: string;
  poNumber?: string;
  billToAddress?: string;
  shipToAddress?: string;
  gstNumber?: string;
  panNumber?: string;
  taxAmount?: number;
  discountAmount?: number;
  shippingAmount?: number;
  totalAmount?: number;
  paymentMethod?: string;
  paymentTerms?: string;

  // Description
  description?: string;
  model?: string;
  manufacturer?: string;
  uniqueIdentificationNumber?: string;  // IMEI, System ID, etc.
  assetImage?: string;                  // Base64 or URL

  // Service Dates
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  amcStartDate?: string;
  amcEndDate?: string;
  insuranceStartDate?: string;
  insuranceEndDate?: string;
  insuranceProvider?: string;
  insuranceAmount?: number;

  // Relationships
  parentAssetId?: string;
  accessoryAssets?: string[];
  isAccessory?: boolean;

  // Status & Disposal
  status: 'active' | 'retired' | 'sold';
  soldDate?: string;
  soldPrice?: number;
  verificationDate?: string;
  notes?: string;
  qrCode?: string;

  // Production (Units method)
  productionCapacity?: number;
  unitsProduced?: number;

  // Import Metadata (immutable)
  importMetadata?: {
    batchId: string;
    importDate: string;
    importTime: string;
    fileName: string;
    rowNumber: number;
    importedBy: string;
    importMethod: 'excel' | 'csv' | 'manual';
    originalData?: Record<string, any>;
  };

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

### 3.10 Module Toggle System
Modules can be enabled/disabled from Settings page:
- `calculations` (default: enabled) — Depreciation calculator
- `itActDepreciation` (default: enabled) — IT Act slab rates
- `reports` (default: enabled) — Report generation
- `integrations` (default: disabled) — ERP connectors
- `blocks` (default: enabled) — Block-wise management
- `settings` (always enabled)

State stored in localStorage as `module_<key>` = `true/false`
Navigation sidebar listens for `moduleConfigChanged` custom event to show/hide menu items.

### 3.11 Auto-Service Date Logic
When creating an asset, warranty/AMC/insurance dates are auto-set based on category:
| Category | Warranty | AMC | Insurance |
|----------|----------|-----|-----------|
| Laptop | 24 months | 12 months | 12 months |
| Computer | 12 months | 12 months | 12 months |
| Server | 36 months | 12 months | 12 months |
| Furniture | 60 months | 0 | 12 months |
| Vehicle | 36 months | 6 months | 12 months |
| Software | 12 months | 12 months | 0 |
| Default | 12 months | 12 months | 12 months |

### 3.12 IT Act Fixed Depreciation Rates (62 Categories)
Key rates from `src/lib/depreciation/constants.ts`:
- Buildings: 5% | Factory Buildings: 10% | Temporary Structures: 100%
- Furniture: 25% | Plant & Machinery: 20%
- Computers/Software: 40% | Scientific/Medical Equipment: 40%
- Vehicles (Cars): 25% | Buses/Trucks: 30%
- Books/Library: 50% | Musical/Sports Equipment: 50%
- Intangible Assets: 20% | Patents: 20% | Goodwill: 10%

---

## 4. FUTURE WORK

### 4.1 Immediate (Redevelopment)
- Replace all localStorage with proper database (PostgreSQL via Supabase/backend API)
- Add public-facing marketing website (Home, Features, Pricing, About pages)
- Implement proper authentication (Supabase Auth or JWT backend)
- API layer for all CRUD operations
- Real-time data sync across sessions/devices

### 4.2 Technical Enhancements
- **Mobile Application**: Native Android/iOS for field verification with offline QR scanning
- **AI-Powered Analytics**: Predictive maintenance, asset lifecycle forecasting, anomaly detection
- **OCR Integration**: Auto-extract data from invoices, purchase orders, receipts
- **Barcode Support**: Support barcode scanning alongside QR codes

### 4.3 Feature Additions
- **Asset Revaluation Module**: Fair value adjustments with journal entries
- **Insurance Management**: Full policy tracking, claim management, premium scheduling
- **Lease Accounting**: IND AS 116 / IFRS 16 compliance (right-of-use assets)
- **Capital Budgeting**: ROI analysis, payback period, NPV calculations
- **IoT Integration**: Real-time asset monitoring via sensors (temperature, usage, location)
- **Multi-Currency Support**: For organizations with international assets

### 4.4 Integration Expansions
- Oracle EBS, QuickBooks, Zoho Books connectors
- Power BI / Tableau embedded analytics
- Custom API webhooks for third-party systems
- Email/SMS notification gateway (SMTP, Twilio)

### 4.5 Compliance Updates
- **GST Integration**: Input tax credit tracking on capital goods
- **Transfer Pricing**: Related party asset transaction documentation
- **XBRL Export**: Automated regulatory filing
- **Environmental Reporting**: Carbon footprint tracking per asset

---

## 5. REFERENCES

### Regulatory & Accounting Standards
1. Companies Act, 2013 — Schedule II (Useful Lives of Assets)
2. Income Tax Act, 1961 — Section 32 (Depreciation Provisions)
3. Accounting Standard (AS) 6 — Depreciation Accounting (ICAI)
4. Indian Accounting Standard (Ind AS) 16 — Property, Plant and Equipment
5. ISO 55000 — Asset Management Standards

### Technology Stack Documentation
6. React 18 — https://react.dev
7. TypeScript — https://www.typescriptlang.org/docs
8. Tailwind CSS 3.4 — https://tailwindcss.com/docs
9. shadcn/ui — https://ui.shadcn.com
10. React Router v6 — https://reactrouter.com
11. TanStack React Query — https://tanstack.com/query
12. Recharts — https://recharts.org
13. Vite — https://vitejs.dev

### Security & Best Practices
14. OWASP Security Guidelines — https://owasp.org
15. REST API Design Best Practices — https://restfulapi.net
16. ITIL 4 — IT Service Management Framework

---

**Document Version**: 2.0
**Last Updated**: March 2026
**Platform**: Zinance — Enterprise Fixed Asset Management System
**Total Components**: 90+ React components across 20 pages
**Total Services**: 12 service modules (Asset, Auth, Depreciation, Audit, Notification, Analytics, Trends, Storage, Reports, Import, Blocks, Impact)
