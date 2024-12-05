using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Step 1: Configure CORS to allow specific origins
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("CorsPolicy", policy =>
    {
        policy.AllowAnyOrigin() // Allow all origins
              .AllowAnyHeader() // Allow all headers
              .AllowAnyMethod(); // Allow all methods (GET, POST, PUT, DELETE, etc.)
    });
});

// Step 2: Add authentication services using JWT Bearer authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // Set to true in production with HTTPS
    options.SaveToken = true; // Save the token for potential retrieval

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
         ValidateLifetime = true,
         ClockSkew = TimeSpan.Zero,
        ValidIssuer = "https://localhost:7274", // SSO server issuer
        ValidAudience = "resource-server-1", // Expected audience
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("YourSuperSecureRandomSecretKey123!"))
    };

    // Logging for detailed token validation diagnostics
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            if (context.Request.Headers.TryGetValue("Authorization", out var authHeader))
            {
                Console.WriteLine("Authorization Header in OnMessageReceived: " + authHeader);
            }
            else
            {
                Console.WriteLine("No Authorization header found in OnMessageReceived.");
            }
            return Task.CompletedTask;
        },

        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"Authentication failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine("Token validated successfully.");

            // Log the entire JWT token if available
            if (context.SecurityToken is System.IdentityModel.Tokens.Jwt.JwtSecurityToken jwtToken)
            {
                Console.WriteLine("Token: " + jwtToken.RawData);
            }

            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            Console.WriteLine("Authentication challenge triggered.");

            // Log all headers on challenge
            foreach (var header in context.Request.Headers)
            {
                Console.WriteLine($"{header.Key}: {header.Value}");
            }

            // Check for the Authorization header
            if (context.Request.Headers.TryGetValue("Authorization", out var authHeader))
            {
                Console.WriteLine("Authorization Header: " + authHeader);

                // Extract and log the token part of the Authorization header
                if (authHeader.ToString().StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                {
                    var token = authHeader.ToString().Substring("Bearer ".Length).Trim();
                    Console.WriteLine("Token on challenge: " + token);
                }
            }
            else
            {
                Console.WriteLine("No Authorization header found.");
            }

            return Task.CompletedTask;
        }
    };
});



// Step 3: Add controllers with a default authorization policy for authenticated users
builder.Services.AddControllers(options =>
{
    var policy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
    options.Filters.Add(new AuthorizeFilter(policy));
});

// Step 4: Configure Swagger for API documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Middleware to log all incoming headers before authentication

app.Use(async (context, next) =>
{
    if (context.Request.Path == "/signin-oidc" && context.Request.Query.TryGetValue("state", out var state))
    {
        // Check the state parameter to identify which tenant initiated the request
        if (state.ToString().StartsWith("army-"))
        {
            // Set the authentication scheme to "army"
            var result = await context.AuthenticateAsync("ArmyCookieScheme");

            if (result.Succeeded)
            {
                // Handle the success for army, redirect or process as needed
                var clientRedirectUri = result.Properties?.Items["redirect_uri"];
                if (!string.IsNullOrEmpty(clientRedirectUri))
                {
                    context.Response.Redirect(clientRedirectUri);
                    return;
                }
            }
        }
        else if (state.ToString().StartsWith("edu-"))
        {
            // Set the authentication scheme to "edu"
            var result = await context.AuthenticateAsync("EduCookieScheme");

            if (result.Succeeded)
            {
                // Handle the success for edu, redirect or process as needed
                var clientRedirectUri = result.Properties?.Items["redirect_uri"];
                if (!string.IsNullOrEmpty(clientRedirectUri))
                {
                    context.Response.Redirect(clientRedirectUri);
                    return;
                }
            }
        }
    }

    // If no match is found or authentication fails, proceed to the next middleware
    await next();
});

app.Use(async (context, next) =>
{
     Console.WriteLine("Middleware to log all incoming headers before authentication:");
    Console.WriteLine("Received Headers:");
    foreach (var header in context.Request.Headers)
    {
        Console.WriteLine($"{header.Key}: {header.Value}");
    }
    await next();
});

// Step 5: Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("CorsPolicy"); // Enable CORS for specified origins

app.UseHttpsRedirection();
app.UseAuthentication(); // Enable authentication middleware
app.UseAuthorization();  // Enable authorization middleware

app.MapControllers(); // Map controllers


app.Run();
