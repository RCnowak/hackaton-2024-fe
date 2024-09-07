import { BaseModel } from "../base/base-model";
import { Injector } from "@angular/core";
import {
  ANIMATION_FRAME_RATE,
  BLOCK_SIZE,
  calculateOffset,
  checkHorizontalDirection,
  checkVerticalDirection,
  getDirection,
  getRoundedDirection,
  IPoint,
  ISceneObject,
  ISize,
  LevelEnum
} from "../../utils";
import { KeyboardController } from "./keyboard-controller";
import { tap } from "rxjs";
import { Arrow } from "./arrow";
import { v4 as uuidv4 } from "uuid";

export class Player extends BaseModel implements ISceneObject {
  public override size: ISize = { width: 128, height: 128 };

  private readonly _level: LevelEnum[][] = [];
  private _imageSize: ISize = { width: 128, height: 128 };
  private _mousePosition: IPoint = { x: 0, y: 0 };
  private _offset: IPoint = { x: 0, y: 0 };
  private _controller!: KeyboardController;
  private _faceDirection: IPoint = { x: 0, y: 0 };
  private _attack: boolean = false;
  private _lastAttackAt: number = Date.now();
  private _lastUpdatedAnimationAt: number = Date.now();
  private _currentFrame: number = 0;

  // Настройки персонажа
  private _speed: number = 2;
  private _cooldownAttack: number = 300;
  public override _shiftFrame: IPoint = { x: 0, y: 0 };
  private text: IPoint = { x: 0, y: 0 };

  get offset(): IPoint {
    return this._offset;
  }

  set controller(value: KeyboardController) {
    this._controller = value;
    this._controller.mousemove$.pipe(
      tap((mouseDirection: IPoint) => {
        const position = {
          x: this.position.x + this.size.width / BLOCK_SIZE / 2,
          y: this.position.y + this.size.height / BLOCK_SIZE / 2
        };

        const centerObject = {
          x: this._offset.x + (this.position.x * BLOCK_SIZE + this.size.width / BLOCK_SIZE / 2),
          y: this._offset.y + (this.position.y * BLOCK_SIZE + this.size.height / BLOCK_SIZE / 2)
        };

        const direction = {
          x: (mouseDirection.x - centerObject.x) /
            Math.hypot(mouseDirection.x - centerObject.x,
              mouseDirection.y + centerObject.y + this.size.width * 2),
          y: (mouseDirection.y - centerObject.y) /
            Math.hypot(mouseDirection.x - centerObject.x,
              mouseDirection.y + centerObject.y + this.size.height * 2)
        };

        const degrees = Math.atan2(direction.x, direction.y) * (180 / Math.PI);

        this._faceDirection = getRoundedDirection(degrees);
        this._mousePosition = mouseDirection;
      })
    ).subscribe();
    this._controller.mouseClick$.pipe(
      tap((attack: boolean) => this._attack = attack)
    ).subscribe();
    this._controller.keyboardClick$().pipe(
      tap((direction: IPoint) => this.direction = direction)
    ).subscribe();
  }

  constructor(injector: Injector, id: string, position: IPoint, level: LevelEnum[][]) {
    super(injector, id);
    this.position = position;
    this._level = level;
    this.sprite.src = `/assets/images/archer.png`;
  }

  public override update(deltaTime: number): void {
    const updatedPosition: IPoint = this.updatePosition(deltaTime);
    this.position = updatedPosition;
    this._offset = calculateOffset(updatedPosition, this._offset, {
      width: this.canvas.width / 2,
      height: this.canvas.height / 2
    });
    this.socket.on({ action: "update_position", payload: this });
    this.attack();
    this.animation();
  }

  public override render(): void {
    this.context.drawImage(
      this.sprite,
      this.shiftX(),
      this._shiftFrame.y * this._imageSize.height,
      this._imageSize.width,
      this._imageSize.height,
      this.offset.x + (this.position.x * BLOCK_SIZE),
      this.offset.y + (this.position.y * BLOCK_SIZE),
      this.size.width,
      this.size.height);

    this.context.strokeRect(
      this.offset.x + (this.position.x * BLOCK_SIZE),
      this.offset.y + (this.position.y * BLOCK_SIZE),
      this.size.width,
      this.size.height);

    this.context.fillText(`${ JSON.stringify(this.text) }, ${ JSON.stringify(this.text) }`,
      this.offset.x + (this.position.x * BLOCK_SIZE),
      this.offset.y + (this.position.y * BLOCK_SIZE),
    );

  }

  private shiftX(): number {
    const shiftX: number = this._shiftFrame.x % 8;
    if (this._attack) {
      return this._imageSize.width * (shiftX + 24);
    } else if (this.direction.x === 0 && this.direction.y === 0) {
      return this._imageSize.width * (shiftX % 4);
    } else {
      return this._imageSize.width * (shiftX + 4);
    }
  }

  private updatePosition(deltaTime: number): IPoint {
    const newPosition: IPoint = {
      x: this.position.x + this.direction.x * this._speed * deltaTime,
      y: this.position.y + this.direction.y * this._speed * deltaTime
    };

    this.text = newPosition;
    const blockedDirections: { x: boolean; y: boolean } = {
      x: checkHorizontalDirection(newPosition, this, this._level),
      y: checkVerticalDirection(newPosition, this, this._level)
    };

    return {
      x: blockedDirections.x ? this.position.x : newPosition.x,
      y: blockedDirections.y ? this.position.y : newPosition.y
    };
  }

  private attack(): void {
    const currentTime: number = Date.now();
    if (!this._attack || (currentTime - this._lastAttackAt < this._cooldownAttack)) {
      return;
    }
    const uid: string = uuidv4();

    const centerObject: IPoint = {
      x: this._offset.x + (this.position.x * BLOCK_SIZE + this.size.width / 2),
      y: this._offset.y + (this.position.y * BLOCK_SIZE + this.size.height / 2)
    };

    const distanceX: number = this._mousePosition.x - centerObject.x;
    const distanceY: number = this._mousePosition.y - centerObject.y;
    const distance: number = Math.hypot(distanceX, distanceY);
    const widthHeight: number = this.size.width * 2 + this.size.height * 2;

    let direction: IPoint = {
      x: distanceX / (distance + widthHeight),
      y: distanceY / (distance + widthHeight)
    };

    const angle: number = Math.atan2(direction.y, direction.x);
    direction = { x: Math.cos(angle), y: Math.sin(angle) };

    const position: IPoint = {
      x: this.position.x + this.size.width / BLOCK_SIZE / 2,
      y: this.position.y + this.size.height / BLOCK_SIZE / 2
    };

    const arrow: Arrow = new Arrow(this.injector, uid, position, direction, this);
    this.socket.on({ action: "player_attack", payload: arrow });
    this._lastAttackAt = currentTime;
  }

  private animation() {
    if (Date.now() - this._lastUpdatedAnimationAt < ANIMATION_FRAME_RATE) return;
    this._shiftFrame.y = getDirection(this._faceDirection);
    this._shiftFrame.x++;
    this._currentFrame++;
    this._lastUpdatedAnimationAt = Date.now();
  }
}
