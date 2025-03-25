import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { VideoChatService } from './services/video-chat.service';
import { AuthService } from './services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { VideoChatComponent } from './video-chat/video-chat.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatSlideToggleModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'client';

  private signalRService = inject(VideoChatService)
  private authService = inject(AuthService)
  private dialog = inject(MatDialog)

  ngOnInit(): void {
    if(!this.authService.getAccessToken) return;
    this.signalRService.startConnection();
    this.startOfferReceive();
  }

  startOfferReceive(){
    this.signalRService.offerReceived.subscribe(async(data)=>{
      if(data){
        let audio = new Audio('assets/sound-ringtone.mp3');
        this.dialog.open(VideoChatComponent, {
          width: '400px',
          height: '600px',
          disableClose: false,
        });
        this.signalRService.remoteUserId = data.senderId;
        this.signalRService.incomingCall = true;
      }
    })
  }
}
