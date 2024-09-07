import {
  ANIMATION_FRAME_RATE,
  BLOCK_SIZE,
  checkHorizontalDirection,
  checkVerticalDirection,
  createPath,
  detectCollision,
  getDirection,
  IPoint,
  ISceneObject,
  ISize,
  LevelEnum
} from "../../utils";
import { Player } from "../player/player";
import { BaseModel } from "../base/base-model";
import { Injector } from "@angular/core";

const enemies = [
  "big spider.png",
  "brown werewolf.png",
  "brown werewolf in various.png",
  "fire ant.png",
  "goblin bow.png",
  "goblin elite.png",
  "goblin peak.png",
  "orc sword shield.png",
  "orc with an ax.png",
  "skeleton.png",
  "small spider.png",
  "white werewolf.png",
  "white werewolf in various.png",
  // "wyvern.png"
];

export class Enemy extends BaseModel implements ISceneObject {
  public override size: ISize = { width: 128, height: 128 };

  private readonly _level: LevelEnum[][] = [];
  private readonly _target!: Player;
  private _speed: number = 2;
  private _path: IPoint[];
  private _lastUpdatedDirectionAt: number = 0;
  private _lastUpdatedAnimationAt: number = Date.now();
  public _imageSize: ISize = { width: 128, height: 128 };
  public override _shiftFrame: IPoint = { x: 0, y: 0 };

  constructor(injector: Injector, id: string, position: IPoint, target: Player, level: LevelEnum[][]) {
    super(injector, id);
    this.position = { ...position };
    this._target = target;
    const model = Math.floor(Math.random() * enemies.length);

    this.sprite.src = `/images/enemies/${ enemies[model] }`;
    this._level = level;
    this._path = createPath(this, this._target, this._level);
  }

  public override render(): void {
    this.context.drawImage(
      this.sprite,
      this._imageSize.width * (this._shiftFrame.x % 12),
      this._shiftFrame.y * this._imageSize.height,
      this._imageSize.width,
      this._imageSize.height,
      this._target.offset.x + (this.position.x * BLOCK_SIZE),
      this._target.offset.y + (this.position.y * BLOCK_SIZE),
      this.size.width,
      this.size.height);
  }

  public override update(deltaTime: number): void {
    const updatedPosition: IPoint = this.updatePosition(deltaTime);
    if (Date.now() - this._lastUpdatedDirectionAt > 100) {
      this._path = createPath(this, this._target, this._level);
      this._lastUpdatedDirectionAt = Date.now();
    }
    this.position = updatedPosition;
    this.animation();
  }

  private updatePosition(deltaTime: number): IPoint {
    const _lastDirection: IPoint = this._path[0];

    let dx: number = Math.sign(this._target.position.x - this.position.x);
    let dy: number = Math.sign(this._target.position.y - this.position.y);

    let newPosition: IPoint = {
      x: this.position.x + Math.sign(dx) * this._speed * deltaTime,
      y: this.position.y + Math.sign(dy) * this._speed * deltaTime
    };

    if (_lastDirection) {
      if (detectCollision({
        size: this.size,
        position: { x: _lastDirection.x * BLOCK_SIZE, y: _lastDirection.y * BLOCK_SIZE }
      }, {
        size: { width: BLOCK_SIZE, height: BLOCK_SIZE },
        position: { x: this.position.x * BLOCK_SIZE, y: this.position.y * BLOCK_SIZE }
      })) {
        this._path.shift();
      }

      dx = Math.sign(_lastDirection.x - this.position.x);
      dy = Math.sign(_lastDirection.y - this.position.y);

      newPosition = {
        x: this.position.x + dx * this._speed * deltaTime,
        y: this.position.y + dy * this._speed * deltaTime
      };
    }
    const blockedDirections: { x: boolean; y: boolean } = {
      x: checkHorizontalDirection(newPosition, this, this._level),
      y: checkVerticalDirection(newPosition, this, this._level)
    };

    this.direction = { x: dx, y: dy };

    return {
      x: blockedDirections.x ? this.position.x : newPosition.x,
      y: blockedDirections.y ? this.position.y : newPosition.y
    };
  }

  private animation(): void {
    if (Date.now() - this._lastUpdatedAnimationAt < ANIMATION_FRAME_RATE) return;
    this._shiftFrame.y = getDirection(this.direction);
    this._shiftFrame.x++;
    this._lastUpdatedAnimationAt = Date.now();
  }
}
