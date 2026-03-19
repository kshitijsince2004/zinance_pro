
# Implementation Guide - FAMS
**Developed by: Jasnoor Singh Khalsa**

## Prerequisites

### Frontend Requirements
- Node.js 18+ 
- npm or yarn
- Modern web browser with ES6 support

### Backend Requirements
- .NET 8.0 SDK
- MySQL 8.0+
- Visual Studio 2022 or VS Code
- MySQL Workbench (optional)

## Step-by-Step Implementation

### Phase 1: Database Setup

1. **Create MySQL Database**
```sql
CREATE DATABASE FAMS_DB;
USE FAMS_DB;
```

2. **Run Entity Framework Migrations**
```bash
cd FAMS.Backend/FAMS.API
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Phase 2: Backend Setup

1. **Clone and Setup Backend Project**
```bash
mkdir FAMS.Backend
cd FAMS.Backend
dotnet new webapi -n FAMS.API
dotnet new classlib -n FAMS.Core
dotnet new classlib -n FAMS.Data
dotnet new classlib -n FAMS.Models
```

2. **Install Required NuGet Packages**
```bash
# In FAMS.API
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet add package Pomelo.EntityFrameworkCore.MySql
dotnet add package Microsoft.AspNetCore.Cors

# In FAMS.Data
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Pomelo.EntityFrameworkCore.MySql
```

3. **Configure Connection String**
```json
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=FAMS_DB;Uid=root;Pwd=your_password;"
  }
}
```

### Phase 3: Frontend Integration

1. **Update API Base URL**
```typescript
// src/lib/api-config.ts
export const API_BASE_URL = 'https://localhost:5001/api';
```

2. **Create API Service Layer**
```typescript
// src/lib/api-service.ts
import axios from 'axios';
import { API_BASE_URL } from './api-config';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const assetApi = {
  getAll: () => apiClient.get('/assets'),
  getById: (id: string) => apiClient.get(`/assets/${id}`),
  create: (asset: any) => apiClient.post('/assets', asset),
  update: (id: string, asset: any) => apiClient.put(`/assets/${id}`, asset),
  delete: (id: string) => apiClient.delete(`/assets/${id}`),
};
```

### Phase 4: Security Implementation

1. **Add Authentication**
```csharp
// In Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });
```

2. **Add Authorization**
```csharp
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AssetsController : ControllerBase
{
    // Controller implementation
}
```

### Phase 5: Testing

1. **Backend Unit Tests**
```csharp
// Tests/AssetServiceTests.cs
[TestClass]
public class AssetServiceTests
{
    [TestMethod]
    public async Task CreateAsset_ValidAsset_ReturnsCreatedAsset()
    {
        // Arrange
        var mockRepository = new Mock<IAssetRepository>();
        var service = new AssetService(mockRepository.Object);
        
        // Act & Assert
        // Test implementation
    }
}
```

2. **Frontend Integration Tests**
```typescript
// src/tests/api-integration.test.ts
describe('Asset API Integration', () => {
  test('should create asset successfully', async () => {
    const newAsset = {
      name: 'Test Asset',
      type: 'Equipment',
      purchasePrice: 10000
    };
    
    const response = await assetApi.create(newAsset);
    expect(response.status).toBe(201);
  });
});
```

### Phase 6: Deployment

1. **Backend Deployment**
```bash
dotnet publish -c Release -o ./publish
```

2. **Frontend Build**
```bash
npm run build
```

3. **Docker Configuration**
```dockerfile
# Dockerfile for API
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["FAMS.API/FAMS.API.csproj", "FAMS.API/"]
RUN dotnet restore "FAMS.API/FAMS.API.csproj"
COPY . .
WORKDIR "/src/FAMS.API"
RUN dotnet build "FAMS.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FAMS.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FAMS.API.dll"]
```

## Configuration Files

### Database Configuration
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=FAMS_DB;Uid=fams_user;Pwd=secure_password;",
    "LoggingConnection": "Server=localhost;Database=FAMS_LOGS;Uid=fams_user;Pwd=secure_password;"
  },
  "Jwt": {
    "Key": "your-super-secret-key-here",
    "Issuer": "FAMS-API",
    "Audience": "FAMS-Client",
    "ExpiryMinutes": 60
  }
}
```

### CORS Configuration
```csharp
services.AddCors(options =>
{
    options.AddPolicy("FAMSPolicy", builder =>
    {
        builder.WithOrigins("http://localhost:3000", "https://fams.yourcompany.com")
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();
    });
});
```

## Performance Optimization

### Database Indexing
```sql
CREATE INDEX IX_Assets_Company_Department ON Assets(Company, Department);
CREATE INDEX IX_Assets_SerialNumber ON Assets(SerialNumber);
CREATE INDEX IX_Assets_QRCode ON Assets(QRCode);
CREATE INDEX IX_AssetHistory_AssetId_Timestamp ON AssetHistory(AssetId, Timestamp);
```

### Caching Strategy
```csharp
// Add Redis caching
services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "localhost:6379";
});

// Use in service
public class AssetService : IAssetService
{
    private readonly IDistributedCache _cache;
    
    public async Task<Asset> GetAssetByIdAsync(Guid id)
    {
        var cacheKey = $"asset_{id}";
        var cachedAsset = await _cache.GetStringAsync(cacheKey);
        
        if (cachedAsset != null)
        {
            return JsonSerializer.Deserialize<Asset>(cachedAsset);
        }
        
        var asset = await _repository.GetAssetByIdAsync(id);
        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(asset));
        
        return asset;
    }
}
```

## Monitoring and Logging

### Application Insights
```csharp
services.AddApplicationInsightsTelemetry();
```

### Structured Logging
```csharp
services.AddLogging(builder =>
{
    builder.AddConsole();
    builder.AddFile("Logs/fams-{Date}.log");
});
```

**Implementation Guide by: Jasnoor Singh Khalsa**
