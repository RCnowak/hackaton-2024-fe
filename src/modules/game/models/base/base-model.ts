import { Observable } from "rxjs";
import { Injector } from "@angular/core";
import { CANVAS, CONTEXT, DELTA_TIME, IPoint, ISize, SOCKET } from "../../utils";
import { SocketService } from "../../services/socket.service";

export abstract class BaseModel {
  public id!: string;
  public sprite: HTMLImageElement = new Image();
  public position: IPoint = { x: 0, y: 0 };
  public direction: IPoint = { x: 0, y: 0 };
  public size: ISize = { width: 0, height: 0 };

  protected delta$!: Observable<number>;
  protected context!: CanvasRenderingContext2D;
  protected injector: Injector;
  protected canvas: HTMLCanvasElement;
  protected socket: SocketService;
  protected _shiftFrame: IPoint = { x: 0, y: 0 };

  protected constructor(injector: Injector, id: string) {
    this.injector = injector;
    this.delta$ = injector.get(DELTA_TIME);
    this.context = injector.get(CONTEXT);
    this.canvas = injector.get(CANVAS);
    this.socket = injector.get(SOCKET);
    this.id = id;
  }

  protected init(): void {
  }

  protected update(deltaTime: number): void {
  }

  protected render(): void {
  }
}
