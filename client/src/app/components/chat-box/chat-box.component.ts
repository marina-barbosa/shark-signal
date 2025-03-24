import { Component, inject } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-chat-box',
  imports: [MatProgressSpinnerModule, DatePipe, MatIconModule],
  templateUrl: './chat-box.component.html',
  styleUrl: './chat-box.component.css'
})
export class ChatBoxComponent {
 chatService = inject(ChatService)
 authService = inject(AuthService)
}
