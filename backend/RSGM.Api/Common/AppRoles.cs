namespace RSGM.Api.Common;

public static class AppRoles
{
    public const string JobSeeker = "JobSeeker";
    public const string Recruiter = "Recruiter";
    public const string HRManager = "HRManager";
    public const string HiringPanelist = "HiringPanelist";
    public const string SystemAdmin = "SystemAdmin";

    public static readonly string[] All =
    {
        JobSeeker,
        Recruiter,
        HRManager,
        HiringPanelist,
        SystemAdmin
    };
}