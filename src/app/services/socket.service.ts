import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { IMessage } from "../utils";


@Injectable()
export class SocketService {
  private message$$: BehaviorSubject<IMessage> = new BehaviorSubject<IMessage>({
    action: "init",
    payload: null
  });

  public message$: Observable<IMessage> = this.message$$.asObservable();

  public on(message: IMessage): void {
    this.message$$.next(message);
  }
}
