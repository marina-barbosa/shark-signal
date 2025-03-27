using System;
using System.Collections.Concurrent;
using api.Data;
using api.DTOs;
using api.Extensions;
using api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace api.Hubs;

[Authorize]
public class ChatHub(UserManager<AppUser> userManager, AppDbContext context) : Hub
{
    public static readonly ConcurrentDictionary<string, OnlineUserDto> onlineUsers = new();

    public override async Task OnConnectedAsync()
    {
        var httpContext = Context.GetHttpContext();
        var receiverId = httpContext?.Request.Query["senderId"].ToString();
        var userName = Context.User!.Identity!.Name!;
        var currentUser = await userManager.FindByNameAsync(userName);
        var connectionId = Context.ConnectionId;

        if(onlineUsers.ContainsKey(userName))
        {
            onlineUsers[userName].ConnectionId = connectionId;
        }
        else
        {
            var user = new OnlineUserDto{
                ConnectionId = connectionId,
                UserName = userName,
                ProfilePicture = currentUser!.ProfileImage,
                FullName = currentUser.FullName
            };
            onlineUsers.TryAdd(userName, user);

            await Clients.AllExcept(connectionId).SendAsync("Notify", currentUser);
        }

        if(!string.IsNullOrEmpty(receiverId))
        {
            await LoadMessages(receiverId);
        }

        await Clients.All.SendAsync("OnlineUsers", await GetAllUsers());
            
    }

    public async Task LoadMessages(string receiverId, int pageNumber = 1)
    {
        int pageSize = 10;
        var username = Context.User!.Identity!.Name;
        var currentUser = await userManager.FindByNameAsync(username!);

        if (currentUser is null)
        {
            return;
        }

        List<MessageResponseDto> messages = await context.Messages
        .Where
        (
            x => x.ReceiverId == currentUser!.Id && x.SenderId == receiverId 
            || x.SenderId == currentUser!.Id && x.ReceiverId ==receiverId
        )
        .OrderByDescending(x=>x.CreatedDate)
        .Skip((pageNumber-1)*pageSize)
        .Take(pageSize)
        .OrderBy(x=>x.CreatedDate)
        .Select(x=> new MessageResponseDto
        {
            Id = x.Id,
            Content = x.Content,
            CreatedDate = x.CreatedDate,
            ReceiverId = x.ReceiverId,
            SenderId = x.SenderId
        })
        .ToListAsync();

        foreach (var message in messages)
        {
            var msg = await context.Messages.FirstOrDefaultAsync(x=>x.Id == message.Id);

            if(msg is not null && msg.ReceiverId == currentUser.Id)
            {
                msg.IsRead = true;
                await context.SaveChangesAsync();
            }
        }

        await Clients.User(currentUser.Id)
        .SendAsync("ReceiveMessageList", messages);
    }
    
    public async Task SendMessage(MessageRequestDto message)
    {
        var sender = Context.User!.Identity!.Name!;
        var receiverId = message.ReceiverId;

        var newMsg = new Message
        {
            Sender = await userManager.FindByNameAsync(sender),
            Receiver = await userManager.FindByIdAsync(receiverId!),
            IsRead = false,
            Content = message.Content,
            CreatedDate = DateTime.UtcNow
        };

        context.Messages.Add(newMsg);
        await context.SaveChangesAsync();

        await Clients.User(receiverId!).SendAsync("ReceiveNewMessage", newMsg);
    }

    public async Task NotifyTyping(string receiverUserName)
    {
        var senderUserName = Context.User!.Identity!.Name;

        if (senderUserName is null)
        {
            return;
        }
        var connectionId = onlineUsers.Values.FirstOrDefault(x => x.UserName == receiverUserName)?.ConnectionId;

        if (connectionId is not null)
        {
            await Clients.Client(connectionId).SendAsync("NotifyTypingToUser", senderUserName);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userName = Context.User!.Identity!.Name;
        onlineUsers.TryRemove(userName!, out _);
        await Clients.All.SendAsync("OnlineUsers", await GetAllUsers());
    }
    
    private async Task<IEnumerable<OnlineUserDto>> GetAllUsers()
    {
        var username = Context.User!.GetUserName();

        var onlineUsersSet = new HashSet<string>(onlineUsers.Keys);

        var users = await userManager.Users.Select(u => new OnlineUserDto{
            Id = u.Id,
            UserName = u.UserName,
            FullName = u.FullName,
            ProfilePicture = u.ProfileImage,
            IsOnline = onlineUsersSet.Contains(u.UserName!),
            UnreadMessageCount = context.Messages.Count(x=> x.ReceiverId == username && x.SenderId == u.Id && !x.IsRead)
        }).OrderByDescending(u => u.IsOnline).ToListAsync();

        return users;
    }
}
