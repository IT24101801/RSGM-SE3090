namespace RSGM.Api.Models.DTOs.JobSeeker
{
    public class DashboardStatsDto
    {
        public int TotalApplications { get; set; }
        public int ActiveApplications { get; set; }
        public int WithdrawnApplications { get; set; }
        public double AverageMatchScore { get; set; }
        public int SkillsCount { get; set; }
        public bool CvUploaded { get; set; }
        public int ProfileCompleteness { get; set; } // 0-100
        public List<string> TopGapSkills { get; set; } = new();
    }
}