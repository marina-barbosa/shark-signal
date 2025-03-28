import { Component, inject } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-chat-right-side',
  imports: [TitleCasePipe],
  templateUrl: './chat-right-side.component.html',
  styles: ``
})
export class ChatRightSideComponent {
  chatService = inject(ChatService);
}
