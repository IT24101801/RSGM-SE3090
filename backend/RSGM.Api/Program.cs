using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RSGM.Api.Data;
using RSGM.Api.Models.Entities;
using RSGM.Api.Services;

var builder = WebApplication.CreateBuilder(args);


// ======================================================
// 1. CONTROLLERS
// ======================================================

builder.Services.AddControllers();


// ======================================================
// 2. SWAGGER / OPENAPI
// ======================================================

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "RSGM.Api",
        Version = "v1",
        Description = "Recruitment & Skill-Gap Matching Platform API"
    });

    // JWT Authorize button
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});


// ======================================================
// 3. DATABASE CONNECTION
// ======================================================

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "DefaultConnection is not configured.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));


// ======================================================
// 4. ASP.NET CORE IDENTITY
// ======================================================

builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        // Password rules
        options.Password.RequiredLength = 8;
        options.Password.RequireDigit = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireNonAlphanumeric = false;

        // User settings
        options.User.RequireUniqueEmail = true;
    })
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services
    .AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>();


// ======================================================
// BUILD APPLICATION
// ======================================================

var app = builder.Build();


// ======================================================
// 9. SWAGGER
// ======================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint(
            "/swagger/v1/swagger.json",
            "RSGM.Api v1"
        );
    });
}


// ======================================================
// 10. HTTPS
// ======================================================

app.UseHttpsRedirection();


// ======================================================
// 11. AUTHENTICATION + AUTHORIZATION
// ======================================================

// IMPORTANT:
// Authentication must come BEFORE Authorization.

app.UseAuthentication();

app.UseAuthorization();


// ======================================================
// 12. MAP CONTROLLERS
// ======================================================

app.MapControllers();


// ======================================================
// 13. HEALTH ENDPOINT
// ======================================================

app.MapHealthChecks("/health");


// ======================================================
// 14. SEED IDENTITY ROLES
// ======================================================

// Creates these roles if they do not already exist:
//
// JobSeeker
// Recruiter
// HRManager
// HiringPanelist
// SystemAdmin

await IdentitySeeder.SeedRolesAsync(app.Services);


// ======================================================
// 15. RUN APPLICATION
// ======================================================

app.Run();