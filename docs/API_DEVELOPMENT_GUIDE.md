
# API Development Guide - FAMS
**API Architect: Jasnoor Singh Khalsa**

## Overview

This comprehensive guide covers all API endpoints, functions, and connectivity patterns for the Fixed Asset Management System. Each endpoint is designed to provide secure, efficient, and scalable access to the FAMS functionality.

## API Architecture

### Base URL
```
Production: https://api.fams.com/v1
Development: https://dev-api.fams.com/v1
Local: https://localhost:5001/api
```

### Authentication
All API endpoints require Bearer token authentication:
```http
Authorization: Bearer <JWT_TOKEN>
```

## Asset Management APIs

### 1. Asset CRUD Operations

#### Get All Assets
```http
GET /api/assets
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `company`: Filter by company
- `department`: Filter by department
- `status`: Filter by status (active, retired, sold)
- `type`: Filter by asset type
- `search`: Search term for name/serial number

**Response Example:**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Dell Laptop",
      "type": "IT Equipment",
      "category": "Computers",
      "purchaseDate": "2023-01-15",
      "purchasePrice": 50000.00,
      "currentValue": 35000.00,
      "depreciationRate": 20.0,
      "owner": "John Doe",
      "department": "IT",
      "company": "ABC Corp",
      "serialNumber": "DL123456",
      "qrCode": "FAMS_123e4567e89b12d3a456426614174000",
      "status": "active",
      "createdAt": "2023-01-15T10:30:00Z",
      "updatedAt": "2023-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

#### Get Asset by ID
```http
GET /api/assets/{id}
```

**Path Parameters:**
- `id`: Asset UUID

**Response Example:**
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Dell Laptop",
    "type": "IT Equipment",
    "category": "Computers",
    "purchaseDate": "2023-01-15",
    "putToUseDate": "2023-01-16",
    "purchasePrice": 50000.00,
    "currentValue": 35000.00,
    "depreciationRate": 20.0,
    "residualValue": 5000.00,
    "owner": "John Doe",
    "department": "IT",
    "company": "ABC Corp",
    "location": "Mumbai Office",
    "office": "Floor 3",
    "vendor": "Dell India",
    "invoiceNumber": "INV-2023-001",
    "serialNumber": "DL123456",
    "qrCode": "FAMS_123e4567e89b12d3a456426614174000",
    "status": "active",
    "depreciationMethod": "SLM",
    "usefulLife": 5,
    "warrantyStartDate": "2023-01-15",
    "warrantyEndDate": "2024-01-15",
    "notes": "Allocated to developer team",
    "createdAt": "2023-01-15T10:30:00Z",
    "updatedAt": "2023-01-15T10:30:00Z"
  }
}
```

#### Create Asset
```http
POST /api/assets
```

**Request Body:**
```json
{
  "name": "Dell Laptop",
  "type": "IT Equipment",
  "category": "Computers",
  "purchaseDate": "2023-01-15",
  "putToUseDate": "2023-01-16",
  "purchasePrice": 50000.00,
  "depreciationRate": 20.0,
  "residualValue": 5000.00,
  "owner": "John Doe",
  "department": "IT",
  "company": "ABC Corp",
  "location": "Mumbai Office",
  "office": "Floor 3",
  "vendor": "Dell India",
  "invoiceNumber": "INV-2023-001",
  "serialNumber": "DL123456",
  "depreciationMethod": "SLM",
  "usefulLife": 5,
  "warrantyStartDate": "2023-01-15",
  "warrantyEndDate": "2024-01-15",
  "notes": "Allocated to developer team"
}
```

**Response:**
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Dell Laptop",
    "qrCode": "FAMS_123e4567e89b12d3a456426614174000",
    "currentValue": 50000.00,
    "createdAt": "2023-01-15T10:30:00Z"
  },
  "message": "Asset created successfully"
}
```

#### Update Asset
```http
PUT /api/assets/{id}
```

**Path Parameters:**
- `id`: Asset UUID

**Request Body:** (Same as Create Asset)

**Response:**
```json
{
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "updatedAt": "2023-01-15T10:30:00Z"
  },
  "message": "Asset updated successfully"
}
```

#### Delete Asset
```http
DELETE /api/assets/{id}
```

**Path Parameters:**
- `id`: Asset UUID

**Response:**
```json
{
  "message": "Asset deleted successfully"
}
```

### 2. Asset Search and Lookup

#### Search Assets
```http
GET /api/assets/search?q={searchTerm}
```

**Query Parameters:**
- `q`: Search term
- `fields`: Fields to search (name, serialNumber, qrCode)
- `limit`: Number of results (default: 10)

#### Get Asset by Serial Number
```http
GET /api/assets/serial/{serialNumber}
```

#### Get Asset by QR Code
```http
GET /api/assets/qr/{qrCode}
```

## Depreciation Management APIs

### 1. Depreciation Calculations

#### Calculate Depreciation
```http
POST /api/depreciation/calculate
```

**Request Body:**
```json
{
  "assetId": "123e4567-e89b-12d3-a456-426614174000",
  "method": "SLM",
  "toDate": "2023-12-31",
  "customRate": 20.0
}
```

**Response:**
```json
{
  "data": {
    "assetId": "123e4567-e89b-12d3-a456-426614174000",
    "method": "SLM",
    "totalDepreciation": 15000.00,
    "currentValue": 35000.00,
    "yearlyBreakdown": [
      {
        "year": 2023,
        "startValue": 50000.00,
        "depreciation": 10000.00,
        "endValue": 40000.00
      },
      {
        "year": 2024,
        "startValue": 40000.00,
        "depreciation": 5000.00,
        "endValue": 35000.00
      }
    ]
  }
}
```

#### Get Depreciation History
```http
GET /api/assets/{id}/depreciation/history
```

**Response:**
```json
{
  "data": [
    {
      "year": 2023,
      "method": "SLM",
      "rate": 20.0,
      "startValue": 50000.00,
      "depreciation": 10000.00,
      "endValue": 40000.00,
      "calculatedAt": "2023-12-31T23:59:59Z"
    }
  ]
}
```

### 2. Depreciation Reports

#### Generate Depreciation Report
```http
POST /api/reports/depreciation
```

**Request Body:**
```json
{
  "reportType": "annual",
  "year": 2023,
  "company": "ABC Corp",
  "department": "IT",
  "format": "pdf"
}
```

## Import/Export APIs

### 1. Asset Import

#### Upload Import File
```http
POST /api/import/upload
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Excel/CSV file
- `importType`: "assets" | "historical"

**Response:**
```json
{
  "data": {
    "uploadId": "upload_123456",
    "fileName": "assets_import.xlsx",
    "recordCount": 150,
    "columns": ["Name", "Type", "Purchase Date", "Purchase Price"]
  }
}
```

#### Map Import Columns
```http
POST /api/import/map
```

**Request Body:**
```json
{
  "uploadId": "upload_123456",
  "columnMapping": {
    "Name": "name",
    "Type": "type",
    "Purchase Date": "purchaseDate",
    "Purchase Price": "purchasePrice"
  }
}
```

#### Process Import
```http
POST /api/import/process
```

**Request Body:**
```json
{
  "uploadId": "upload_123456",
  "validateOnly": false
}
```

**Response:**
```json
{
  "data": {
    "batchId": "batch_123456",
    "processedCount": 148,
    "successCount": 145,
    "failedCount": 3,
    "errors": [
      {
        "row": 5,
        "error": "Invalid purchase date format"
      }
    ]
  }
}
```

### 2. Asset Export

#### Export Assets
```http
GET /api/export/assets
```

**Query Parameters:**
- `format`: "excel" | "csv" | "pdf"
- `company`: Filter by company
- `department`: Filter by department
- `fields`: Comma-separated list of fields to export

**Response:**
```json
{
  "data": {
    "downloadUrl": "https://api.fams.com/downloads/export_123456.xlsx",
    "fileName": "assets_export.xlsx",
    "expiresAt": "2023-01-15T10:30:00Z"
  }
}
```

## QR Code Management APIs

### 1. QR Code Generation

#### Generate QR Code
```http
POST /api/qr/generate
```

**Request Body:**
```json
{
  "assetId": "123e4567-e89b-12d3-a456-426614174000",
  "size": 200,
  "format": "png"
}
```

**Response:**
```json
{
  "data": {
    "qrCode": "FAMS_123e4567e89b12d3a456426614174000",
    "imageUrl": "https://api.fams.com/qr/FAMS_123e4567e89b12d3a456426614174000.png",
    "imageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

#### Bulk QR Code Generation
```http
POST /api/qr/bulk
```

**Request Body:**
```json
{
  "assetIds": ["123e4567-e89b-12d3-a456-426614174000", "..."],
  "format": "pdf",
  "layout": "grid",
  "size": 150
}
```

### 2. QR Code Scanning

#### Scan QR Code
```http
POST /api/qr/scan
```

**Request Body:**
```json
{
  "qrCode": "FAMS_123e4567e89b12d3a456426614174000",
  "location": "Mumbai Office",
  "scannedBy": "user123"
}
```

**Response:**
```json
{
  "data": {
    "asset": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Dell Laptop",
      "currentLocation": "Mumbai Office",
      "status": "active"
    },
    "scanHistory": {
      "scannedAt": "2023-01-15T10:30:00Z",
      "scannedBy": "user123",
      "location": "Mumbai Office"
    }
  }
}
```

## Verification and Audit APIs

### 1. Asset Verification

#### Create Verification Session
```http
POST /api/verification/sessions
```

**Request Body:**
```json
{
  "name": "Q1 2023 Verification",
  "department": "IT",
  "scheduledDate": "2023-03-31",
  "verifiers": ["user123", "user456"],
  "assetFilters": {
    "company": "ABC Corp",
    "department": "IT",
    "type": "IT Equipment"
  }
}
```

#### Get Verification Sessions
```http
GET /api/verification/sessions
```

#### Update Verification Status
```http
PUT /api/verification/assets/{assetId}/status
```

**Request Body:**
```json
{
  "sessionId": "session_123",
  "status": "verified",
  "notes": "Asset found and verified",
  "verifiedBy": "user123",
  "location": "Mumbai Office"
}
```

### 2. Audit Trail

#### Get Audit Trail
```http
GET /api/audit/trail
```

**Query Parameters:**
- `assetId`: Filter by asset ID
- `user`: Filter by user
- `action`: Filter by action type
- `startDate`: Start date filter
- `endDate`: End date filter

**Response:**
```json
{
  "data": [
    {
      "id": "audit_123",
      "assetId": "123e4567-e89b-12d3-a456-426614174000",
      "action": "created",
      "details": "Asset created with initial value 50000",
      "user": "user123",
      "timestamp": "2023-01-15T10:30:00Z",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0..."
    }
  ]
}
```

## Company and Department Management APIs

### 1. Company Management

#### Get Companies
```http
GET /api/companies
```

#### Create Company
```http
POST /api/companies
```

**Request Body:**
```json
{
  "name": "ABC Corp",
  "departments": ["IT", "HR", "Finance"],
  "serialNumberFormat": {
    "IT": {
      "Computers": {
        "prefix": "IT-COMP",
        "nextNumber": 1001
      }
    }
  }
}
```

### 2. Department Management

#### Get Departments
```http
GET /api/companies/{companyId}/departments
```

#### Add Department
```http
POST /api/companies/{companyId}/departments
```

## AMC and Warranty APIs

### 1. AMC Management

#### Get AMC Contracts
```http
GET /api/amc/contracts
```

#### Create AMC Contract
```http
POST /api/amc/contracts
```

**Request Body:**
```json
{
  "assetId": "123e4567-e89b-12d3-a456-426614174000",
  "vendor": "Dell India",
  "startDate": "2023-01-15",
  "endDate": "2024-01-15",
  "contractValue": 5000.00,
  "serviceLevel": "Premium",
  "contactPerson": "John Doe",
  "contactEmail": "john@dell.com",
  "contactPhone": "+91-9876543210"
}
```

### 2. Warranty Management

#### Get Warranty Information
```http
GET /api/warranty/asset/{assetId}
```

#### Update Warranty
```http
PUT /api/warranty/asset/{assetId}
```

## Reporting and Analytics APIs

### 1. Dashboard APIs

#### Get Dashboard Data
```http
GET /api/dashboard/overview
```

**Response:**
```json
{
  "data": {
    "totalAssets": 1500,
    "totalValue": 75000000.00,
    "activeAssets": 1400,
    "retiredAssets": 80,
    "soldAssets": 20,
    "monthlyDepreciation": 250000.00,
    "expiringWarranties": 25,
    "expiringAMCs": 15,
    "recentActivities": [
      {
        "action": "Asset Created",
        "assetName": "Dell Laptop",
        "user": "user123",
        "timestamp": "2023-01-15T10:30:00Z"
      }
    ]
  }
}
```

### 2. Reports API

#### Generate Report
```http
POST /api/reports/generate
```

**Request Body:**
```json
{
  "reportType": "asset_register",
  "filters": {
    "company": "ABC Corp",
    "department": "IT",
    "dateRange": {
      "start": "2023-01-01",
      "end": "2023-12-31"
    }
  },
  "format": "pdf",
  "includeCharts": true
}
```

## WebSocket APIs for Real-time Updates

### Connection
```javascript
const socket = io('https://api.fams.com', {
  auth: {
    token: 'Bearer JWT_TOKEN'
  }
});
```

### Events
- `asset_created`: New asset created
- `asset_updated`: Asset updated
- `verification_completed`: Verification completed
- `import_progress`: Import progress updates
- `system_notification`: System-wide notifications

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "ASSET_NOT_FOUND",
    "message": "Asset with ID 123e4567-e89b-12d3-a456-426614174000 not found",
    "details": {
      "assetId": "123e4567-e89b-12d3-a456-426614174000"
    }
  }
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## Rate Limiting

### Limits
- Standard API: 1000 requests/hour
- Import API: 10 requests/hour
- Export API: 50 requests/hour

### Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## SDK and Client Libraries

### JavaScript/TypeScript
```typescript
import { FAMSClient } from '@fams/client';

const client = new FAMSClient({
  baseUrl: 'https://api.fams.com/v1',
  apiKey: 'your-api-key'
});

// Get all assets
const assets = await client.assets.getAll();

// Create asset
const newAsset = await client.assets.create({
  name: 'Dell Laptop',
  type: 'IT Equipment',
  purchasePrice: 50000
});
```

### C# Client
```csharp
using FAMS.Client;

var client = new FAMSClient("https://api.fams.com/v1", "your-api-key");

// Get all assets
var assets = await client.Assets.GetAllAsync();

// Create asset
var newAsset = await client.Assets.CreateAsync(new CreateAssetRequest
{
    Name = "Dell Laptop",
    Type = "IT Equipment",
    PurchasePrice = 50000
});
```

## Testing

### Postman Collection
A comprehensive Postman collection is available at:
`https://api.fams.com/postman/collection.json`

### API Testing
```bash
# Test asset creation
curl -X POST https://api.fams.com/v1/assets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Asset", "type": "Equipment", "purchasePrice": 10000}'
```

**API Development Guide by: Jasnoor Singh Khalsa**
**Version: 1.0**
**Last Updated: 2024**
