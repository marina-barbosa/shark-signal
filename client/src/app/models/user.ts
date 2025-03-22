export interface User {
    id: string;
    profilePicture: string;
    profileImage: string;
    photoUrl: string;
    fullName: string;
    userName: string;
    isOnline: boolean;
    connectionId: string;
    lastMessage: string;
    unreadMessageCount: number;
    isTyping: boolean;
}