import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { User } from '../models/user';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Message } from '../models/message';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private authService = inject(AuthService);
  private hubUrl = 'http://localhost:5000/hubs/chat';
  onlineUsers = signal<User[]>([]);
  currentOpenedChat = signal<User | null>(null);
  chatMessages = signal<Message[]>([]);
  isLoading = signal<boolean>(true);
  private hubConnection?: HubConnection;

  startConnection(token: string, senderId?: string) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}?senderId=${senderId || ''}`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.log('Error while starting connection: ' + err));

    this.hubConnection.on('OnlineUsers', (user: User[]) => {
      console.log(user);
      this.onlineUsers.update(() =>
        user.filter(
          user =>
            user.userName !== this.authService.currentLoggedUser?.userName
        )
      );
    });

    this.hubConnection!.on('ReceiveMessageList', (message) => {
      this.chatMessages.update((messages) => [...message, messages]);
      this.isLoading.update(() => false);
      console.log('Mensagens no estado:', this.chatMessages());
    });
  }

  disconnectConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch(error => console.log(error));
    }
  }

  status(userName: string) {
    const currentChatUser = this.currentOpenedChat();
    if(!currentChatUser) return 'Offline';
    const onlineUser = this.onlineUsers().find(user => user.userName === userName);
    return onlineUser?.isTyping ? 'Typing...' : this.isUserOnline();
  }

  isUserOnline() {
    let onlineUser = this.onlineUsers().find(
      user => user.userName === this.currentOpenedChat()?.userName
    );
    return onlineUser?.isOnline ? 'Online' : this.currentOpenedChat()!.userName;
  }

  loadMessages(pageNumber: number) {
    this.hubConnection?.invoke('LoadMessages', this.currentOpenedChat()?.id, pageNumber)
    .then().catch().finally(() => this.isLoading.update(() => false));
  }
}
