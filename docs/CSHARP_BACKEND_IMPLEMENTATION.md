
# C# Backend Implementation for FAMS
**Developed by: Jasnoor Singh Khalsa**

## Project Structure

```
FAMS.Backend/
├── FAMS.API/                   # Web API Controllers
├── FAMS.Core/                  # Business Logic Layer
├── FAMS.Data/                  # Data Access Layer
├── FAMS.Models/                # Domain Models
└── FAMS.Infrastructure/        # External Services
```

## 1. Domain Models (FAMS.Models)

```csharp
// Models/Asset.cs
// Author: Jasnoor Singh Khalsa
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FAMS.Models
{
    public class Asset
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        [StringLength(255)]
        public string Name { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Type { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Category { get; set; }
        
        [Required]
        public DateTime PurchaseDate { get; set; }
        
        public DateTime? PutToUseDate { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(15,2)")]
        public decimal PurchasePrice { get; set; }
        
        [Column(TypeName = "decimal(5,2)")]
        public decimal? DepreciationRate { get; set; }
        
        [Column(TypeName = "decimal(15,2)")]
        public decimal ResidualValue { get; set; }
        
        [Column(TypeName = "decimal(15,2)")]
        public decimal CurrentValue { get; set; }
        
        [StringLength(255)]
        public string Owner { get; set; }
        
        [StringLength(100)]
        public string Department { get; set; }
        
        [StringLength(255)]
        public string Company { get; set; }
        
        [StringLength(255)]
        public string Location { get; set; }
        
        [StringLength(255)]
        public string Office { get; set; }
        
        [StringLength(255)]
        public string Vendor { get; set; }
        
        [StringLength(100)]
        public string InvoiceNumber { get; set; }
        
        public AssetStatus Status { get; set; } = AssetStatus.Active;
        
        public DepreciationMethod DepreciationMethod { get; set; } = DepreciationMethod.SLM;
        
        public int? UsefulLife { get; set; }
        
        [StringLength(100)]
        public string SerialNumber { get; set; }
        
        [StringLength(255)]
        public string QRCode { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation Properties
        public virtual ICollection<AssetHistory> History { get; set; }
        public virtual ICollection<AssetReminder> Reminders { get; set; }
    }
    
    public enum AssetStatus
    {
        Active,
        Retired,
        Sold
    }
    
    public enum DepreciationMethod
    {
        SLM,
        WDV,
        WDV_FIXED_SLAB,
        UNITS,
        DOUBLE_DECLINING,
        SUM_OF_YEARS
    }
}
```

## 2. Data Access Layer (FAMS.Data)

```csharp
// Data/FAMSDbContext.cs
// Author: Jasnoor Singh Khalsa
using Microsoft.EntityFrameworkCore;
using FAMS.Models;

namespace FAMS.Data
{
    public class FAMSDbContext : DbContext
    {
        public FAMSDbContext(DbContextOptions<FAMSDbContext> options) : base(options)
        {
        }
        
        public DbSet<Asset> Assets { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<AssetHistory> AssetHistory { get; set; }
        public DbSet<ImportLog> ImportLogs { get; set; }
        public DbSet<AssetReminder> AssetReminders { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Asset Configuration
            modelBuilder.Entity<Asset>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.HasIndex(e => e.SerialNumber).IsUnique();
                entity.HasIndex(e => e.QRCode).IsUnique();
                entity.HasIndex(e => new { e.Company, e.Department, e.Status });
            });
            
            // AssetHistory Configuration
            modelBuilder.Entity<AssetHistory>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne<Asset>()
                    .WithMany(a => a.History)
                    .HasForeignKey(h => h.AssetId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
            
            // AssetReminder Configuration
            modelBuilder.Entity<AssetReminder>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne<Asset>()
                    .WithMany(a => a.Reminders)
                    .HasForeignKey(r => r.AssetId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
            
            base.OnModelCreating(modelBuilder);
        }
    }
}
```

## 3. Repository Pattern

```csharp
// Data/Repositories/IAssetRepository.cs
// Author: Jasnoor Singh Khalsa
using FAMS.Models;

namespace FAMS.Data.Repositories
{
    public interface IAssetRepository
    {
        Task<IEnumerable<Asset>> GetAllAssetsAsync();
        Task<Asset> GetAssetByIdAsync(Guid id);
        Task<Asset> CreateAssetAsync(Asset asset);
        Task<Asset> UpdateAssetAsync(Asset asset);
        Task<bool> DeleteAssetAsync(Guid id);
        Task<IEnumerable<Asset>> GetAssetsByCompanyAsync(string company);
        Task<IEnumerable<Asset>> GetAssetsByDepartmentAsync(string department);
        Task<Asset> GetAssetBySerialNumberAsync(string serialNumber);
        Task<Asset> GetAssetByQRCodeAsync(string qrCode);
    }
}
```

## 4. Business Logic Layer (FAMS.Core)

```csharp
// Core/Services/AssetService.cs
// Author: Jasnoor Singh Khalsa
using FAMS.Data.Repositories;
using FAMS.Models;

namespace FAMS.Core.Services
{
    public class AssetService : IAssetService
    {
        private readonly IAssetRepository _assetRepository;
        private readonly IAssetHistoryRepository _historyRepository;
        
        public AssetService(IAssetRepository assetRepository, IAssetHistoryRepository historyRepository)
        {
            _assetRepository = assetRepository;
            _historyRepository = historyRepository;
        }
        
        public async Task<Asset> CreateAssetAsync(Asset asset)
        {
            // Validate asset data
            ValidateAsset(asset);
            
            // Generate QR Code
            asset.QRCode = GenerateQRCode(asset.Id);
            
            // Calculate current value
            asset.CurrentValue = CalculateCurrentValue(asset);
            
            // Create asset
            var createdAsset = await _assetRepository.CreateAssetAsync(asset);
            
            // Log creation
            await _historyRepository.AddHistoryAsync(new AssetHistory
            {
                AssetId = createdAsset.Id,
                Action = "Created",
                Details = $"Asset {createdAsset.Name} created",
                User = "System",
                Timestamp = DateTime.UtcNow,
                Type = AssetActivityType.Success
            });
            
            return createdAsset;
        }
        
        public async Task<decimal> CalculateDepreciationAsync(Guid assetId, DateTime toDate)
        {
            var asset = await _assetRepository.GetAssetByIdAsync(assetId);
            if (asset == null) throw new ArgumentException("Asset not found");
            
            return asset.DepreciationMethod switch
            {
                DepreciationMethod.SLM => CalculateSLMDepreciation(asset, toDate),
                DepreciationMethod.WDV => CalculateWDVDepreciation(asset, toDate),
                _ => throw new NotSupportedException($"Depreciation method {asset.DepreciationMethod} not supported")
            };
        }
        
        private decimal CalculateSLMDepreciation(Asset asset, DateTime toDate)
        {
            var years = (toDate - (asset.PutToUseDate ?? asset.PurchaseDate)).Days / 365.25;
            var annualDepreciation = (asset.PurchasePrice - asset.ResidualValue) / (asset.UsefulLife ?? 5);
            return (decimal)years * annualDepreciation;
        }
        
        private decimal CalculateWDVDepreciation(Asset asset, DateTime toDate)
        {
            var years = (int)Math.Floor((toDate - (asset.PutToUseDate ?? asset.PurchaseDate)).Days / 365.25);
            var currentValue = asset.PurchasePrice;
            var rate = asset.DepreciationRate ?? 20;
            
            for (int i = 0; i < years; i++)
            {
                currentValue -= currentValue * (rate / 100);
            }
            
            return asset.PurchasePrice - Math.Max(currentValue, asset.ResidualValue);
        }
        
        private void ValidateAsset(Asset asset)
        {
            if (string.IsNullOrEmpty(asset.Name))
                throw new ArgumentException("Asset name is required");
            
            if (asset.PurchasePrice <= 0)
                throw new ArgumentException("Purchase price must be greater than zero");
        }
        
        private string GenerateQRCode(Guid assetId)
        {
            return $"FAMS_{assetId:N}";
        }
    }
}
```

## 5. Web API Controllers

```csharp
// API/Controllers/AssetsController.cs
// Author: Jasnoor Singh Khalsa
using Microsoft.AspNetCore.Mvc;
using FAMS.Core.Services;
using FAMS.Models;

namespace FAMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssetsController : ControllerBase
    {
        private readonly IAssetService _assetService;
        
        public AssetsController(IAssetService assetService)
        {
            _assetService = assetService;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Asset>>> GetAssets()
        {
            try
            {
                var assets = await _assetService.GetAllAssetsAsync();
                return Ok(assets);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<Asset>> GetAsset(Guid id)
        {
            try
            {
                var asset = await _assetService.GetAssetByIdAsync(id);
                if (asset == null)
                {
                    return NotFound();
                }
                return Ok(asset);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        [HttpPost]
        public async Task<ActionResult<Asset>> CreateAsset(Asset asset)
        {
            try
            {
                var createdAsset = await _assetService.CreateAssetAsync(asset);
                return CreatedAtAction(nameof(GetAsset), new { id = createdAsset.Id }, createdAsset);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAsset(Guid id, Asset asset)
        {
            if (id != asset.Id)
            {
                return BadRequest();
            }
            
            try
            {
                await _assetService.UpdateAssetAsync(asset);
                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsset(Guid id)
        {
            try
            {
                await _assetService.DeleteAssetAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        [HttpGet("{id}/depreciation")]
        public async Task<ActionResult<decimal>> GetDepreciation(Guid id, [FromQuery] DateTime toDate)
        {
            try
            {
                var depreciation = await _assetService.CalculateDepreciationAsync(id, toDate);
                return Ok(depreciation);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
```

## 6. Dependency Injection Setup

```csharp
// API/Program.cs
// Author: Jasnoor Singh Khalsa
using Microsoft.EntityFrameworkCore;
using FAMS.Data;
using FAMS.Data.Repositories;
using FAMS.Core.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database Context
builder.Services.AddDbContext<FAMSDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"),
    ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

// Repository Registration
builder.Services.AddScoped<IAssetRepository, AssetRepository>();
builder.Services.AddScoped<IAssetHistoryRepository, AssetHistoryRepository>();

// Service Registration
builder.Services.AddScoped<IAssetService, AssetService>();

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", builder =>
    {
        builder.WithOrigins("http://localhost:3000", "https://localhost:3000")
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

app.Run();
```

**Backend Implementation by: Jasnoor Singh Khalsa**
