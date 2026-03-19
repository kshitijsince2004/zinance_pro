
# Entity Relationship Diagrams - FAMS
**Developed by: Jasnoor Singh Khalsa**

## Database Schema Overview

### Core Entities

#### 1. Assets Table
```sql
Assets {
  Id: GUID (Primary Key)
  Name: VARCHAR(255) NOT NULL
  Type: VARCHAR(100) NOT NULL
  Category: VARCHAR(100) NOT NULL
  PurchaseDate: DATE NOT NULL
  PutToUseDate: DATE
  PurchasePrice: DECIMAL(15,2) NOT NULL
  DepreciationRate: DECIMAL(5,2)
  ResidualValue: DECIMAL(15,2)
  CurrentValue: DECIMAL(15,2)
  Owner: VARCHAR(255)
  Department: VARCHAR(100)
  Company: VARCHAR(255)
  Location: VARCHAR(255)
  Office: VARCHAR(255)
  Vendor: VARCHAR(255)
  InvoiceNumber: VARCHAR(100)
  Status: ENUM('active', 'retired', 'sold')
  DepreciationMethod: ENUM('SLM', 'WDV', 'WDV_FIXED_SLAB', 'UNITS', 'DOUBLE_DECLINING', 'SUM_OF_YEARS')
  UsefulLife: INT
  SerialNumber: VARCHAR(100)
  QRCode: VARCHAR(255)
  CreatedAt: DATETIME
  UpdatedAt: DATETIME
}
```

#### 2. Companies Table
```sql
Companies {
  Id: GUID (Primary Key)
  Name: VARCHAR(255) NOT NULL
  Departments: JSON
  SerialNumberFormat: JSON
  DefaultDepreciationMethods: JSON
  CreatedAt: DATETIME
  UpdatedAt: DATETIME
}
```

#### 3. AssetHistory Table
```sql
AssetHistory {
  Id: GUID (Primary Key)
  AssetId: GUID (Foreign Key -> Assets.Id)
  Action: VARCHAR(100) NOT NULL
  Details: TEXT
  User: VARCHAR(255)
  Timestamp: DATETIME
  Type: ENUM('success', 'info', 'warning', 'error')
}
```

#### 4. ImportLogs Table
```sql
ImportLogs {
  Id: GUID (Primary Key)
  BatchId: VARCHAR(100) NOT NULL
  FileName: VARCHAR(255)
  ImportDate: DATE
  ImportTime: DATETIME
  ImportedBy: VARCHAR(255)
  ImportMethod: ENUM('excel', 'csv', 'manual')
  TotalRows: INT
  SuccessCount: INT
  FailedCount: INT
  SkippedCount: INT
  Metadata: JSON
  CreatedAt: DATETIME
}
```

#### 5. AssetReminders Table
```sql
AssetReminders {
  Id: GUID (Primary Key)
  AssetId: GUID (Foreign Key -> Assets.Id)
  Title: VARCHAR(255) NOT NULL
  Date: DATE NOT NULL
  Days: INT
  Priority: ENUM('high', 'medium', 'low')
  Type: ENUM('amc', 'warranty')
  CreatedAt: DATETIME
}
```

### Relationships

1. **Assets -> Companies**: Many-to-One
2. **Assets -> AssetHistory**: One-to-Many
3. **Assets -> AssetReminders**: One-to-Many
4. **Assets -> ImportLogs**: Many-to-One (via metadata)

### ER Diagram Visualization

```
[Companies] 1----* [Assets] 1----* [AssetHistory]
                      |
                      |
                      1----* [AssetReminders]
                      |
                      *----1 [ImportLogs]
```

## Index Strategy
- Primary Keys: Clustered indexes on all Id columns
- Foreign Keys: Non-clustered indexes on AssetId references
- Search Optimization: Indexes on Name, SerialNumber, QRCode
- Performance: Composite indexes on (Company, Department, Status)

**Database Design by: Jasnoor Singh Khalsa**
