import { BaseModel } from "../base/base-model";
import { Injector } from "@angular/core";
import {
  ANIMATION_FRAME_RATE,
  BASE_HEALTH_POINT,
  BASE_POWER, BASE_SPEED,
  BLOCK_SIZE,
  calculateOffset,
  checkHorizontalDirection,
  checkVerticalDirection,
  COOLDOWN_ATTACK,
  getDirection,
  getRoundedDirection,
  HEALTH_MULTIPLY,
  IPoint,
  ISceneObject,
  ISize,
  LevelEnum, POWER_MULTIPLY
} from "@game/utils";
import { KeyboardController } from "./keyboard-controller";
import { tap } from "rxjs";
import { v4 as uuidv4 } from "uuid";

export class Player extends BaseModel implements ISceneObject {
  public override size: ISize = { width: 128, height: 128 };
  public level: LevelEnum[][] = [];

  private _mousePosition: IPoint = { x: 0, y: 0 };
  private _offset: IPoint = { x: 0, y: 0 };
  private _controller!: KeyboardController;
  private _faceDirection: IPoint = { x: 0, y: 0 };
  private _attack: boolean = false;
  private _lastAttackAt: number = Date.now();
  private _lastUpdatedAnimationAt: number = Date.now();
  private _currentFrame: number = 0;
  public healthPoint = BASE_HEALTH_POINT;
  public power = BASE_POWER;
  // Настройки персонажа
  public _speed: number = BASE_SPEED;
  private _cooldownAttack: number = COOLDOWN_ATTACK;
  public maxHealthPoint = BASE_HEALTH_POINT;
  public override shiftFrame: IPoint = { x: 0, y: 0 };
  public currentLevel: number = 1;
  public lastUseAbbilityAt: number = Date.now();

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
    this._controller.action$.pipe(
      tap((attack: boolean) => this._attack = attack)
    ).subscribe();
    this._controller.moveDirection$.pipe(
      tap((direction: IPoint) => this.direction = direction)
    ).subscribe();
    this._controller.voiceCommand$
      .subscribe(command => {
        this.socket.dispatchGameEvent({
          action: "apply_ability",
          payload: { userId: this.id, abillityCode: command.type }
        });
      });
  }

  constructor(injector: Injector, id: string, position: IPoint, gameClass: "mage" | "archer", level: LevelEnum[][]) {
    super(injector, id);
    this.position = position;
    this.level = level;
    this.sprite.src = `/images/${ gameClass }.png`;
  }

  public override update(deltaTime: number): void {
    if (this.healthPoint <= 0) {
      this.socket.dispatchGameEvent({ action: "player_death", payload: this.id });
      return;
    }
    const updatedPosition: IPoint = this.updatePosition(deltaTime);
    this.position = updatedPosition;
    this._offset = calculateOffset(updatedPosition, this._offset, {
      width: this.canvas.width / 2,
      height: this.canvas.height / 2
    });
    this.socket.dispatchGameEvent({
      action: "update_position", payload: {
        id: this.id,
        position: this.position,
        offset: this._offset
      }
    });
    this.attack();
    this.animation();
  }

  public override render(): void {
    this.context.drawImage(
      this.sprite,
      this.shiftX(),
      this.shiftFrame.y * this.imageSize.height,
      this.imageSize.width,
      this.imageSize.height,
      this.offset.x + (this.position.x * BLOCK_SIZE),
      this.offset.y + (this.position.y * BLOCK_SIZE),
      this.size.width,
      this.size.height);

    this.context.strokeRect(
      this.offset.x + (this.position.x * BLOCK_SIZE) + 48,
      this.offset.y + (this.position.y * BLOCK_SIZE) + 32,
      32,
      8);

    this.context.save();
    this.context.fillStyle = "red";
    this.context.fillRect(
      this.offset.x + (this.position.x * BLOCK_SIZE) + 48,
      this.offset.y + (this.position.y * BLOCK_SIZE) + 32,
      this.healthPoint * 32 / this.maxHealthPoint,
      8);
    this.context.restore();
  }

  private shiftX(): number {
    const shiftX: number = this.shiftFrame.x % 8;
    if (this._attack) {
      return this.imageSize.width * (shiftX + 24);
    } else if (this.direction.x === 0 && this.direction.y === 0) {
      return this.imageSize.width * (shiftX % 4);
    } else {
      return this.imageSize.width * (shiftX + 4);
    }
  }

  private updatePosition(deltaTime: number): IPoint {
    const newPosition: IPoint = {
      x: this.position.x + this.direction.x * this._speed * deltaTime,
      y: this.position.y + this.direction.y * this._speed * deltaTime
    };

    const blockedDirections: { x: boolean; y: boolean } = {
      x: checkHorizontalDirection(newPosition, this, this.level),
      y: checkVerticalDirection(newPosition, this, this.level)
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

    this.socket.dispatchGameEvent({
      action: "player_attack",
      payload: { uid: uuidv4(), position, direction, playerId: this.id }
    });
    this._lastAttackAt = currentTime;
  }

  private animation() {
    if (Date.now() - this._lastUpdatedAnimationAt < ANIMATION_FRAME_RATE) return;
    this.shiftFrame.y = getDirection(this._faceDirection);
    this.shiftFrame.x++;
    this._currentFrame++;
    this._lastUpdatedAnimationAt = Date.now();
  }

  public levelUp(): void {
    this.currentLevel++;
    this.power *= POWER_MULTIPLY;
    const addedHealth: number = this.maxHealthPoint * HEALTH_MULTIPLY;
    this.healthPoint += addedHealth - this.maxHealthPoint;
    this.maxHealthPoint = addedHealth;
  }
}
