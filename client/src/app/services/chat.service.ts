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
  autoScrollEnabled = signal<boolean>(true);

  startConnection(token: string, senderId?: string) {
    if(this.hubConnection?.state === HubConnectionState.Connected) return;

    if(this.hubConnection)
    {
      this.hubConnection.off('ReceiveNewMessage');
      this.hubConnection.off('ReceiveNewMessageList');
      this.hubConnection.off('OnlineUsers');
      this.hubConnection.off('NotifyTypingToUser');
      this.hubConnection.off('Notify');
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}?senderId=${senderId || ''}`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.log('Connection or login error: ' + err));

    this.hubConnection!.on('Notify', (user:User)=>{
      Notification.requestPermission().then(result => {
        if(result === 'granted'){
          new Notification('Ative now 🦈', {
            body: `${user.fullName} is online now`,
            icon: user.profileImage,
          })
        }
      })
    })

    this.hubConnection.on('OnlineUsers', (user: User[]) => {
      console.log(user);
      this.onlineUsers.update(() =>
        user.filter(
          user =>
            user.userName !== this.authService.currentLoggedUser?.userName
        )
      );
    });

    this.hubConnection!.on('NotifyTypingToUser', (senderUserName) => {
      this.onlineUsers.update(users => {
        return users.map(user => {
          if (user.userName === senderUserName) {
            user.isTyping = true;
          }
          return user;
        })
      });
      setTimeout(()=>{
        this.onlineUsers.update(users => {
          return users.map(user => {
            if(user.userName === senderUserName){
              user.isTyping = false;
            }
            return user;
          })
        })
      }, 2000)
    });

    

    this.hubConnection!.on('ReceiveMessageList', (message) => {
      this.isLoading.update(() => true);
      this.chatMessages.update((messages) => [...message, messages]);
      this.isLoading.update(() => false);
      console.log('Mensagens no estado:', this.chatMessages());
    });

    this.hubConnection!.on('ReceiveNewMessage', (message:Message) => {
      let audio = new Audio('assets/sound-radar-notification.mp3');
      audio.play();
      document.title = '(1) New Message';
      this.chatMessages.update(messages=>[...messages, message]);
    })
  }

  disconnectConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch(error => console.log(error));
    }
  }

  sendMessage(message:string){
    this.chatMessages.update((messages)=>[
      ...messages,
      {
        content: message,
        senderId:this.authService.currentLoggedUser!.id,
        receiverId: this.currentOpenedChat()!.id,
        createdDate: new Date().toString(),
        isRead: false,
        id: 0
      }
    ]);
    this.hubConnection?.invoke('SendMessage', {
      receiverId: this.currentOpenedChat()?.id,
      content:message
    }).then(id=>{
      console.log('message send to', id);
    }).catch(error => console.log(error));
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
    this.isLoading.update(() => true);
    this.hubConnection?.invoke('LoadMessages', this.currentOpenedChat()?.id, pageNumber)
    .then().catch().finally(() => this.isLoading.update(() => false));
  }

  notifyTyping() {
    this.hubConnection!.invoke('NotifyTyping', this.currentOpenedChat()?.userName)
    .then(x=>console.log('notify for', x))
    .catch(error => console.log(error));
  }
}
