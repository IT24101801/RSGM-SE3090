using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RSGM.Api.Data;

namespace RSGM.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public NotificationsController(ApplicationDbContext db) => _db = db;

    private Guid? CurrentUserId() =>
        Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
            ? id : null;

    [HttpGet]
    public async Task<IActionResult> GetMine()
    {
        var userId = CurrentUserId();
        if (userId == null) return Unauthorized();
        var items = await _db.UserNotifications.AsNoTracking()
            .Where(n => n.RecipientId == userId.Value)
            .OrderByDescending(n => n.CreatedAt)
            .Take(100)
            .Select(n => new
            {
                n.Id,
                Kind = n.Kind.ToString(),
                n.Title, n.Message, n.Link, n.CreatedAt, n.ReadAt
            })
            .ToListAsync();
        return Ok(items);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> UnreadCount()
    {
        var userId = CurrentUserId();
        if (userId == null) return Unauthorized();
        var count = await _db.UserNotifications.CountAsync(n =>
            n.RecipientId == userId.Value && n.ReadAt == null);
        return Ok(new { count });
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id)
    {
        var userId = CurrentUserId();
        if (userId == null) return Unauthorized();
        var item = await _db.UserNotifications.FirstOrDefaultAsync(n =>
            n.Id == id && n.RecipientId == userId.Value);
        if (item == null) return NotFound();
        if (item.ReadAt == null)
        {
            item.ReadAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }
        return Ok(new { item.Id, item.ReadAt });
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        var userId = CurrentUserId();
        if (userId == null) return Unauthorized();
        var changed = await _db.UserNotifications
            .Where(n => n.RecipientId == userId.Value && n.ReadAt == null)
            .ExecuteUpdateAsync(set => set.SetProperty(n => n.ReadAt, DateTime.UtcNow));
        return Ok(new { changed });
    }
}
