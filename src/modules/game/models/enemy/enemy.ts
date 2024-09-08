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
  LevelEnum,
  MONSTER_BASE_HEALTH_POINT,
  MONSTER_BASE_POWER,
  MONSTER_BASE_SPEED,
  TIME_TO_UPDATE_PATH,
  MONSTER_COOLDOWN_ATTACK, MONSTER_ANIMATION_ATTACK, MONSTER_HEALTH_MULTIPLY, MONSTER_POWER_MULTIPLY
} from "../../utils";
import { Player } from "../player/player";
import { BaseModel } from "../base/base-model";
import { Injector } from "@angular/core";

const enemies = [
  "small spider.png",
  "big spider.png",
  "fire ant.png",
  "brown werewolf.png",
  "skeleton.png",
  "goblin bow.png",

  // "brown werewolf in various.png",
  // "goblin elite.png",
  // "goblin peak.png",
  // "orc sword shield.png",
  // "orc with an ax.png",
  // "white werewolf.png",
  // "white werewolf in various.png",
  // "wyvern.png"
];

export class Enemy extends BaseModel implements ISceneObject {
  public healthPoint: number = MONSTER_BASE_HEALTH_POINT;
  public power: number = MONSTER_BASE_POWER;
  private _cooldownAttack: number = MONSTER_COOLDOWN_ATTACK;

  private readonly _level: LevelEnum[][] = [];
  private readonly _target!: Player;
  private _speed: number = MONSTER_BASE_SPEED;
  private _attack: boolean = false;
  private _path: IPoint[];
  private _lastUpdatedDirectionAt: number = 0;
  private _lastUpdatedAnimationAt: number = Date.now();
  private _lastAttackAt: number = Date.now();


  constructor(injector: Injector, id: string, position: IPoint, target: Player, level: LevelEnum[][]) {
    super(injector, id);
    this.position = { ...position };
    this._target = target;
    this.sprite.src = `/images/enemies/${ enemies[target.currentLevel] }`;
    this._level = level;
    this._path = createPath(this, this._target, this._level);
    this.healthPoint = MONSTER_BASE_HEALTH_POINT * this._target.currentLevel * MONSTER_HEALTH_MULTIPLY;
    this.power = MONSTER_BASE_POWER * this._target.currentLevel * MONSTER_POWER_MULTIPLY;
  }

  public override render(): void {
    if (!this.context || !detectCollision(
      {
        position: {
          x: this._target.offset.x + (this.position.x * this.size.width),
          y: this._target.offset.y + (this.position.y * this.size.height),
        },
        size: {
          width: this.size.width,
          height: this.size.height
        }
      }, { position: { x: 0, y: 0, }, size: { width: this.canvas.width, height: this.canvas.height } }
    )) {
      return;
    }

    this.context.drawImage(
      this.sprite,
      this.shiftX(),
      this.shiftFrame.y * this.imageSize.height,
      this.imageSize.width,
      this.imageSize.height,
      this._target.offset.x + (this.position.x * this.size.width),
      this._target.offset.y + (this.position.y * this.size.height),
      this.size.width,
      this.size.height);
  }

  public override update(deltaTime: number): void {
    const currentTime = Date.now();
    const updatedPosition: IPoint = this.updatePosition(deltaTime);
    if (currentTime - this._lastUpdatedDirectionAt > TIME_TO_UPDATE_PATH) {
      this._path = createPath(this, this._target, this._level);
      this._lastUpdatedDirectionAt = Date.now();
    }

    if (this._attack && (currentTime - this._lastAttackAt < MONSTER_ANIMATION_ATTACK)) {
      this._attack = false;
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
    this.shiftFrame.y = getDirection(this.direction);
    this.shiftFrame.x++;
    this._lastUpdatedAnimationAt = Date.now();
  }

  private shiftX(): number {
    const shiftX: number = this.shiftFrame.x % 8;
    if (this._attack) {
      return this.imageSize.width * (shiftX + 24);
    } else {
      return this.imageSize.width * (shiftX + 4);
    }
  }

  public attack(): void {
    const currentTime: number = Date.now();
    if (this._attack || (currentTime - this._lastAttackAt < this._cooldownAttack)) return;
    this._target.healthPoint -= this.power;
    this._lastAttackAt = currentTime;
    this._attack = true;
  }
}
