using System;
using System.Security.Claims;

namespace api.Extensions;

public static class ClaimsPrincipleExtensions
{
    public static string GetUserName(this ClaimsPrincipal user) 
    {
        return user.FindFirstValue(ClaimTypes.Name) ?? throw new
        Exception("Nao é possivel obter o usuario");
    }

    public static Guid GetUserId(this ClaimsPrincipal user) 
    {
        return Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new
        Exception("Nao é possivel obter o id do usuario"));
    }
}
