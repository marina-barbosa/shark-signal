using System;
using api.Common;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace api.Endpoints;

public static class AccountEndpoint
{
    public static RouteGroupBuilder MapAccountEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/account").WithTags("Account");

        group.MapPost("/register", async (
            UserManager<AppUser> userManager, 
            IHttpContextAccessor httpContextAccessor,
            [FromForm] string fullName, 
            [FromForm] string email, 
            [FromForm] string password, 
            [FromForm] string userName,
            [FromForm] IFormFile? profileImage) =>
        {
            var userFromDb = await userManager.FindByEmailAsync(email);

            if (userFromDb is not null)
            {
                return Results.BadRequest(Response<string>.Failure("O usuario ja esta cadastrado"));
            }

            if (profileImage is null)
            {
                return Results.BadRequest(Response<string>.Failure("A imagem de perfil é obrigatoria"));
            }

            var picture = await FileUpload.Upload(profileImage);

            // picture = $"{context.Request.Scheme}://{context.Request.Host}/uploads/{picture}";

            var httpContext = httpContextAccessor.HttpContext;
            
            if (httpContext == null)
            {
                return Results.BadRequest(Response<string>.Failure("Erro ao processar a requisição"));
            }

            var baseUrl = $"{httpContext.Request.Scheme}://{httpContext.Request.Host}";
            picture = $"{baseUrl}/uploads/{picture}";
            
            var user = new AppUser
            {
                Email = email,
                FullName = fullName,
                UserName = userName,
                ProfileImage = picture
            };

            var result = await userManager.CreateAsync(user, password);

            if (!result.Succeeded)
            {
                return Results.BadRequest(Response<string>.Failure(result.Errors.Select(x => x.Description).FirstOrDefault()!));
            }

            return Results.Ok(Response<string>.Success("","Usuario criado com sucesso"));
        }).DisableAntiforgery();

        return group;
    }
}