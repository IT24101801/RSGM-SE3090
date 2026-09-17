namespace RSGM.Api.Models.DTOs.JobSeeker
{
    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }
}