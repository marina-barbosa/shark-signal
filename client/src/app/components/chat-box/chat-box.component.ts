import { AfterViewChecked, Component, ElementRef, inject, ViewChild, viewChild } from '@angular/core';
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
export class ChatBoxComponent implements AfterViewChecked {

  @ViewChild('chatBox', { read: ElementRef }) public chatBox?: ElementRef

  chatService = inject(ChatService)
  authService = inject(AuthService)
  private pageNumber = 2

  loadMoreMessages() {
    this.pageNumber++;
    this.chatService.loadMessages(this.pageNumber);
    this.scrollToTop();
  }

  ngAfterViewChecked(): void {
    if(this.chatService.autoScrollEnabled() && this.chatBox) {
      this.scrollToBottom();
    }
  }

  scrollToBottom(){
    this.chatService.autoScrollEnabled.set(true);
    this.chatBox!.nativeElement.scrollTo({
      top:this.chatBox!.nativeElement.scrollHeight,
      behavior: 'smooth'
    })
  }

  scrollToTop(){
    this.chatService.autoScrollEnabled.set(false);
    this.chatBox!.nativeElement.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}
