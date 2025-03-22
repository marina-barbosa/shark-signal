using System;
using api.Common;
using api.DTOs;
using api.Extensions;
using api.Models;
using api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

            return Results.Ok(Response<string>.Success("", "Usuario criado com sucesso"));
        }).DisableAntiforgery();

        group.MapPost("/login", async (
            UserManager<AppUser> userManager,
            TokenService tokenService,
            LoginDto dto) =>
            {
                if (dto is null)
                {
                    return Results.BadRequest(Response<string>.Failure("Erro, login invalido"));
                }

                var user = await userManager.FindByEmailAsync(dto.Email);

                if (user is null)
                {
                    return Results.BadRequest(Response<string>.Failure("Usuario nao encontrado"));
                }

                var result = await userManager.CheckPasswordAsync(user, dto.Password);

                if (!result)
                {
                    return Results.BadRequest(Response<string>.Failure("Senha incorreta"));
                }

                var token = tokenService.GenerateToken(user.Id, user.UserName!);

                return Results.Ok(Response<string>.Success(token, "Login efetuado com sucesso"));
            });

        group.MapGet("/me", async(HttpContext context, UserManager<AppUser> userManager) => {
            var currentLoggedInUserId = context.User.GetUserId();

            var currentLoggedInUser = await userManager.Users.SingleOrDefaultAsync(x=>x.Id==currentLoggedInUserId.ToString());

            return Results.Ok(Response<AppUser>.Success(currentLoggedInUser!, "Usuario obtido com sucesso"));
        }).RequireAuthorization();

        return group;
    }
}