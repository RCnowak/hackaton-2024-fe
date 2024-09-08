import { Observable } from "rxjs";
import { Injector } from "@angular/core";
import { CANVAS, CONTEXT, DELTA_TIME, IPoint, ISize } from "@game/utils";
import { SocketService } from "../../services/socket.service";

export abstract class BaseModel {
  public id!: string;
  public sprite: HTMLImageElement = new Image();
  public position: IPoint = { x: 0, y: 0 };
  public direction: IPoint = { x: 0, y: 0 };
  public imageSize: ISize = { width: 128, height: 128 };
  public size: ISize = { width: 128, height: 128 };


  protected delta$!: Observable<number>;
  protected context!: CanvasRenderingContext2D;
  protected injector: Injector;
  protected canvas: HTMLCanvasElement;
  protected socket: SocketService;
  protected shiftFrame: IPoint = { x: 0, y: 0 };

  protected constructor(injector: Injector, id: string) {
    this.injector = injector;
    this.delta$ = injector.get(DELTA_TIME);
    this.context = injector.get(CONTEXT);
    this.canvas = injector.get(CANVAS);
    this.socket = injector.get(SocketService);
    this.id = id;
  }

  protected init(): void {
  }

  protected update(deltaTime: number): void {
  }

  public render(): void {
    if (!this.context || !this.sprite.src) return;
    this.context.drawImage(
      this.sprite,
      this.shiftFrame.x * this.size.width,
      this.shiftFrame.y * this.size.height,
      this.size.width,
      this.size.height,
      this.position.x * this.size.width,
      this.position.y * this.size.height,
      this.size.width,
      this.size.height);
  }
}
