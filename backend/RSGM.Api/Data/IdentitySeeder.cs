using Microsoft.AspNetCore.Identity;
using RSGM.Api.Common;

namespace RSGM.Api.Data;

public static class IdentitySeeder
{
    public static async Task SeedRolesAsync(
        IServiceProvider services)
    {
        using var scope = services.CreateScope();

        var roleManager =
            scope.ServiceProvider
                .GetRequiredService<
                    RoleManager<IdentityRole<Guid>>>();

        foreach (var roleName in AppRoles.All)
        {
            if (!await roleManager
                    .RoleExistsAsync(roleName))
            {
                var role =
                    new IdentityRole<Guid>(
                        roleName);

                await roleManager
                    .CreateAsync(role);
            }
        }
    }
}