import { Component, inject, Injector } from "@angular/core";
import { DestroyService } from "../../services/destroy.service";
import { SocketService } from "../../services/socket.service";
import { CANVAS, CONTEXT, DELTA_TIME, deltaTime, LevelEnum, SOCKET } from "../../utils";
import { Observable, takeUntil } from "rxjs";
import { DOCUMENT } from "@angular/common";
import { Game } from "../../models/game/game";
import { Level } from "../../models/level/level";
import { Scene } from "../../models/scene/scene";
import { v4 as uuidv4 } from "uuid";


@Component({
  selector: "app-root",
  templateUrl: "./game.component.html",
  styleUrls: [ "./game.component.scss" ],
  providers: [
    DestroyService,
    SocketService,
    {
      provide: DELTA_TIME,
      deps: [ DestroyService ],
      useFactory: (destroy$: Observable<number>) =>
        deltaTime().pipe(takeUntil(destroy$)),
    },
    {
      provide: CANVAS,
      deps: [ DOCUMENT ],
      useFactory: (document: Document): HTMLCanvasElement => {
        const canvas: HTMLCanvasElement | null = document.querySelector("#canvas");

        if (!canvas) {
          throw new Error("Canvas element not found or already requested");
        }

        new ResizeObserver(([ element ]) => {
          canvas.width = element.contentRect.width;
          canvas.height = element.contentRect.height;
        }).observe(canvas);

        return canvas;
      },
    },
    {
      provide: SOCKET,
      useClass: SocketService
    },
    {
      provide: CONTEXT,
      deps: [ CANVAS ],
      useFactory: (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
        const context: CanvasRenderingContext2D | null = canvas.getContext("2d");

        if (!context) {
          throw new Error(
            "2D rendering context not available or already requested",
          );
        }

        return context;
      },
    },
  ],
  standalone: true
})

export class GameComponent {
  game!: Game;
  socket: SocketService = inject(SOCKET);

  constructor(private readonly injector: Injector) {
  }

  public createGame(): void {
    const uid: string = uuidv4();
    this.game = new Game(this.injector, uid);
  }

  public createScene(): void {
    const level: LevelEnum[][] = Level.generate();
    const scene: Scene = new Scene(this.injector, level);
    this.socket.on({ action: "set_scene", payload: scene });
    this.game.createCurrentPlayer(level);
  }
}
