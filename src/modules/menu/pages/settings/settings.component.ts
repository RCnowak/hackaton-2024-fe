import {Component, inject} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SocketService} from "@game/services/socket.service";
import {NAKAMA} from "@api/nakama";
import {Match} from "@heroiclabs/nakama-js";
import {SessionService} from "@auth/services/session.service";
import {FormsModule} from "@angular/forms";


@Component({
  selector: 'file-upload',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  imports: [
    FormsModule
  ],
  standalone: true
})
export default class SettingsPageComponent {
  fileName = '';
  private socket = inject(SocketService);
  private nakama = inject(NAKAMA);
  private session = inject(SessionService);
  private http = inject(HttpClient);
  

  username: string = '';

  onFileSelected(event:any) {
    // this.socket.socket!.

    const file:File = event.target.files[0];

    if (file) {

      this.fileName = 'Выбран: '+file.name;

      const formData = new FormData();
      
      formData.append("thumbnail", file);
      
      this.http.post("/api/thumbnail-upload", formData)
        .subscribe(data => this.save());
    }
  }
  save() {
    this.nakama.updateAccount(this.session.session!, {
      display_name : this.username,
      avatar_url: this.fileName,
      username: this.username
    });
  }
}
