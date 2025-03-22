using System;

namespace api.DTOs;

public class OnlineUserDto
{
public string? Id { get; set; }
public string? ConnectionId { get; set; }
public string? UserName { get; set; }
public string? FullName { get; set; }
public string? ProfilePicture { get; set; }
public bool IsOnline { get; set; }
public int UnreadMessageCount { get; set; }

}
