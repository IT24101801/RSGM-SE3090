using Microsoft.AspNetCore.Identity;
using RSGM.Api.Common;
using RSGM.Api.Models.Entities;

namespace RSGM.Api.Data;

public static class IdentitySeeder
{
    public static async Task SeedAsync(
        IServiceProvider services,
        IConfiguration configuration)
    {
        using var scope = services.CreateScope();

        var roleManager =
            scope.ServiceProvider
                .GetRequiredService<RoleManager<IdentityRole<Guid>>>();

        var userManager =
            scope.ServiceProvider
                .GetRequiredService<UserManager<ApplicationUser>>();


        // ==================================================
        // 1. CREATE ROLES
        // ==================================================

        foreach (var roleName in AppRoles.All)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                var role =
                    new IdentityRole<Guid>(roleName);

                var roleResult =
                    await roleManager.CreateAsync(role);

                if (!roleResult.Succeeded)
                {
                    throw new InvalidOperationException(
                        $"Unable to create role: {roleName}");
                }
            }
        }


        // ==================================================
        // 2. READ ADMIN DETAILS FROM USER SECRETS
        // ==================================================

        var adminFullName =
            configuration["SeedAdmin:FullName"];

        var adminEmail =
            configuration["SeedAdmin:Email"];

        var adminPassword =
            configuration["SeedAdmin:Password"];


        // If admin settings are not configured,
        // simply skip admin creation.
        if (string.IsNullOrWhiteSpace(adminEmail) ||
            string.IsNullOrWhiteSpace(adminPassword))
        {
            return;
        }


        // ==================================================
        // 3. CHECK WHETHER ADMIN ALREADY EXISTS
        // ==================================================

        var admin =
            await userManager.FindByEmailAsync(adminEmail);

        if (admin == null)
        {
            admin = new ApplicationUser
            {
                FullName =
                    adminFullName
                    ?? "RSGM System Administrator",

                Email =
                    adminEmail.Trim().ToLowerInvariant(),

                UserName =
                    adminEmail.Trim().ToLowerInvariant(),

                EmailConfirmed = true,

                IsActive = true
            };


            // ==================================================
            // 4. CREATE ADMIN USER
            // ==================================================

            var createResult =
                await userManager.CreateAsync(
                    admin,
                    adminPassword);

            if (!createResult.Succeeded)
            {
                var errors = string.Join(
                    ", ",
                    createResult.Errors
                        .Select(error => error.Description));

                throw new InvalidOperationException(
                    $"Unable to create System Admin: {errors}");
            }
        }


        // ==================================================
        // 5. ASSIGN SYSTEM ADMIN ROLE
        // ==================================================

        if (!await userManager.IsInRoleAsync(
                admin,
                AppRoles.SystemAdmin))
        {
            var roleResult =
                await userManager.AddToRoleAsync(
                    admin,
                    AppRoles.SystemAdmin);

            if (!roleResult.Succeeded)
            {
                throw new InvalidOperationException(
                    "Unable to assign SystemAdmin role.");
            }
        }
    }
}