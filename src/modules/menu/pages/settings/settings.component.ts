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
  message: string = '';
  error: string = '';

  username: string = '';

  async ngOnInit() {
    const account = await this.nakama.getAccount(this.session.session!);
    const user = account.user;
    console.log('accout',user);
    this.username = user?.username||'';
    this.fileName = user?.avatar_url||'';
  }
  onFileSelected(event:any) {

    const file:File = event.target.files[0];

    if (file) {

      this.fileName = file.name;

      const formData = new FormData();

      formData.append("thumbnail", file);

      this.http.post("/upload/", formData)
        .subscribe(data => this.save(data));
    }
  }
  save(data?:any) {
    if (data) {
      this.nakama.updateAccount(this.session.session!, {
        display_name : this.username,
        avatar_url: data.path,
        username: this.username
      }).then(() => {
        this.message = 'Настройки успешно сохранены';
      }).catch(response=>{
        if(response.status === 400) {
          this.error = 'произошла ошибка';
        }
      });
    } else {
      this.nakama.updateAccount(this.session.session!, {
        display_name : this.username,
        username: this.username
      }).then(() => {
        this.message = 'Настройки успешно сохранены';
      }).catch(response=>{
        if(response.status === 400) {
          this.error = 'произошла ошибка';
        }
      });
    }

  }
}
