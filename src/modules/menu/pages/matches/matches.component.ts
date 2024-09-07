import { Component, inject } from '@angular/core';
import { NAKAMA } from '@api/nakama';
import { SessionService } from '@auth/services/session.service';
import {SocketService} from "@game/services/socket.service";

@Component({
    templateUrl: './matches.component.html',
    styleUrl: './matches.component.scss'
})
export default class MatchesPageComponent {
    private nakama = inject(NAKAMA);
    public matches = [];
    private session = inject(SessionService);
    private socket = inject(SocketService);
    async getMatches(){
      return this.nakama.listMatches(this.session.session!);
    }
    async createMatch() {
      const socket = this.nakama.createSocket();
      var appearOnline = true;
      await socket.connect(this.session.session!, appearOnline);
      //const match = socket.createMatch('testMatch');
      //console.log('matches',match);
      var matchName = "NoImpostersAllowed";
      var match = await socket.createMatch(matchName);
      console.log(match);
      return match;
    }
    // ngOnInit() {
    //   console.log('init');
    //   //console.log(this.createMatch());
    //   const result = this.getMatches();
    //     console.log('matches',result);
    //     // result.matches.forEach(function(match){
    //     //   console.log("%o: %o/10 players", match.id, match.size);
    //     // });
    // }
  // @ts-ignore
  async printd(result) {
    console.log('matches',result.matches);
    // result.forEach(match => {
    //   console.log("%o: %o/10 players", match.id, match.size);
    // });
    this.matches = result.matches;
    result.matches.forEach(function(match:any){
      console.log("%o: %o/10 players", match.match_id, match.size);
      console.log(match);
    });
  }
  ngOnInit() {
    // @ts-ignore
    this.socket.create()
      .then(socket => this.createMatch())
      .then(socket => this.getMatches())
      .then(this.printd);

    //this.createMatch();
  }
  // ngOnInit() {
  //   this.socket.create()
  //     .then(socket => socket.)
  //     .then(console.log);
  // }

}
