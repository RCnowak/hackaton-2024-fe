import { Component, inject, Injector } from "@angular/core";
import { DestroyService } from "./services/destroy.service";
import { SocketService } from "./services/socket.service";
import { CANVAS, CONTEXT, COOLDOWN_ABBILITY, DELTA_TIME, deltaTime, LevelEnum } from "./utils";
import { Observable, takeUntil } from "rxjs";
import { DOCUMENT, NgClass } from "@angular/common";
import { Game } from "./models/game/game";
import { Level } from "./models/level/level";
import { v4 as uuidv4 } from "uuid";
import { AbbilityCode } from "./utils/abillityCodes";


@Component({
  templateUrl: "./game.component.html",
  styleUrls: [ "./game.component.scss" ],
  providers: [
    DestroyService,
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
  imports: [
    NgClass
  ],
  standalone: true
})

export class GameComponent {
  game!: Game;
  socket: SocketService = inject(SocketService);

  constructor(private readonly injector: Injector) {
  }

  ngOnInit() {
    this.createGame();
    if (this.socket.isHost) {
      this.createScene();
    }
  }

  public createGame(): void {
    const uid: string = uuidv4();
    this.game = new Game(this.injector, uid);
  }

  public createScene(): void {
    const level: LevelEnum[][] = Level.generate();
    this.socket.dispatchGameEvent({ action: "set_scene", payload: level });
    this.game.createCurrentPlayer(level);
  }

  atack(event: MouseEvent) {
    event.stopPropagation();
    this.socket.dispatchGameEvent({ action: "apply_ability", payload: {userId: this.game._currentPlayer.id, abillityCode: AbbilityCode.speed} });
  }

  heal(event: MouseEvent) {
    event.stopPropagation();
    this.socket.dispatchGameEvent({
      action: "apply_ability",
      payload: { userId: this.game._currentPlayer.id, abillityCode: AbbilityCode.heal }
    });
  }

  destroy(event: MouseEvent) {
    event.stopPropagation();
    this.socket.dispatchGameEvent({
      action: "apply_ability",
      payload: { userId: this.game._currentPlayer.id, abillityCode: AbbilityCode.destroy }
    });
  }

  public disableButton(): boolean {
    return Date.now() - this.game._currentPlayer.lastUseAbbilityAt < COOLDOWN_ABBILITY;
  }

  protected readonly Date = Date;
  protected readonly COOLDOWN_ABBILITY = COOLDOWN_ABBILITY;
}
