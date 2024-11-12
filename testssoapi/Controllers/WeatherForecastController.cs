using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace testssoapi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<WeatherForecastController> _logger;

        public WeatherForecastController(ILogger<WeatherForecastController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult> GetEvents()
        {
            var forecasts = Enumerable.Range(1, 5).Select(index => new
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)).ToString("yyyy-MM-dd"),
                TemperatureC = Random.Shared.Next(-20, 55),
                TemperatureF = 32 + (int)(Random.Shared.Next(-20, 55) / 0.5556),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            }).ToArray();

            // Simulate an asynchronous operation
            await Task.Delay(10); // This represents a simulated delay, e.g., for database calls.

            return Ok(forecasts);
        }
    }
}
