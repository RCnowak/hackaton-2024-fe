import { Injector } from "@angular/core";
import { BaseModel } from "../base/base-model";
import { Ground } from "./models/ground";
import { Stones } from "./models/stones";
import { Ladder } from "./models/ladder";
import { Wall } from "./models/wall";
import { SceneObject } from "../base/scene-object";
import { v4 as uuidv4 } from "uuid";
import { map, take, tap, timer } from "rxjs";
import { LEVEL_SIZE, IPoint, LevelEnum } from "@game/utils";
import { Player } from "../player/player";

export class Scene extends BaseModel {
  private readonly _level: LevelEnum[][];
  private _sceneObjects: Map<string, SceneObject> = new Map();
  private sceneImage!: HTMLImageElement;
  private _player!: Player;

  set player(value: Player) {
    this._player = value;
  }

  constructor(injector: Injector, level: LevelEnum[][],) {
    super(injector, "scene");
    this._level = level;
    this.init();
    this.loadSceneImage();
  }

  get level(): LevelEnum[][] {
    return this._level;
  }

  get sceneObjects(): Map<string, SceneObject> {
    return this._sceneObjects;
  }

  public override init(): void {
    this._sceneObjects = new Map();

    let stoneID: number = 6;

    for ( let mapX: number = 0; mapX < this.level.length; mapX++ ) {
      for ( let mapY: number = 0; mapY < this.level[mapX].length; mapY++ ) {
        const uid: string = uuidv4();
        const position: IPoint = { x: mapX, y: mapY };
        const value: LevelEnum = this.level[mapX][mapY];
        switch ( value ) {
          case LevelEnum.GROUND:
            this._sceneObjects.set(uid, new Ground(uid, position));
            break;
          case LevelEnum.STONES:
            this._sceneObjects.set(uid, new Stones(uid, position, stoneID % 6));
            stoneID++;
            break;
          case LevelEnum.LADDER:
          case LevelEnum.LADDER_LEFT:
          case LevelEnum.LADDER_RIGHT:
            this._sceneObjects.set(uid, new Ladder(uid, position, value));
            break;
          case LevelEnum.WALL_NORTH:
          case LevelEnum.WALL_SOUTH:
          case LevelEnum.WALL_EAST:
          case LevelEnum.WALL_WEST:
          case LevelEnum.WALL_NORTH_EAST:
          case LevelEnum.WALL_NORTH_WEST:
          case LevelEnum.WALL_SOUTH_EAST:
          case LevelEnum.WALL_SOUTH_WEST:
            this._sceneObjects.set(uid, new Wall(uid, position, value));
            break;
        }
      }
    }
  }

  public override render(): void {
    if (!this.sceneImage) return;
    this.context.save();
    this.context.fillStyle = "#72751b";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(this.sceneImage,
      this._player ? this._player.offset.x : 0,
      this._player ? this._player.offset.y : 0,
      LEVEL_SIZE, LEVEL_SIZE);
    this.context.restore();
  }

  private loadSceneImage(): void {
    timer(0).pipe(
      take(1),
      map(() => {
        const image_map: HTMLImageElement = new Image();
        const canvas: HTMLCanvasElement = document.createElement("canvas");
        canvas.width = LEVEL_SIZE;
        canvas.height = LEVEL_SIZE;
        const context: CanvasRenderingContext2D | null = canvas.getContext("2d");

        if (context) {
          this._sceneObjects.forEach((cell: SceneObject) => cell.render(context));
          image_map.src = canvas.toDataURL("image/png");
        }

        return image_map;
      }),
      tap((image: HTMLImageElement) => this.sceneImage = image)
    ).subscribe();
  }
}
