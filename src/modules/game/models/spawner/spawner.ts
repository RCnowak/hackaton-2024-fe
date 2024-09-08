import {
  BASE_HEALTH_POINT, BASE_POWER,
  BLOCK_SIZE,
  detectCollision, HEALTH_MULTIPLY,
  IPoint,
  ISceneObject,
  ISize, POWER_MULTIPLY,
  SPAWNER_BASE_HEALTH_POINT,
  SPAWNER_COUNT, SPAWNER_HEALTH_MULTIPLY,
} from "../../utils";
import { BaseModel } from "../base/base-model";
import { Player } from "../player/player";
import { Injector } from "@angular/core";

export class Spawner extends BaseModel implements ISceneObject {
  public override shiftFrame: IPoint = { x: 0, y: 0 };
  override size: ISize = { width: 128, height: 128 };
  public healthPoint: number = SPAWNER_BASE_HEALTH_POINT;

  private _maxHealthPoint: number = SPAWNER_BASE_HEALTH_POINT;
  private _lastCreateMonsterAt: number = Date.now();
  private _active: boolean = true;
  private _player: Player;
  private _currentLevel: number = 1;

  constructor(injector: Injector, id: string, position: IPoint, player: Player) {
    super(injector, id);
    this.position = position;
    this.sprite.src = `/images/spawner.png`;
    this._player = player;
  }

  public bornNewEnemy(): boolean {
    const currentTime: number = Date.now();
    if (currentTime - this._lastCreateMonsterAt < SPAWNER_COUNT * 500) return false;
    this._lastCreateMonsterAt = currentTime;
    return true;
  }

  public override update(): void {
    if (!this._active) return;
    if (this.healthPoint <= 0) {
      this._active = false;
      this.shiftFrame.y = this.size.height;
      this.socket.on({ action: "death_spawner", payload: this });
    }
  }

  public override render(): void {
    if (!this.context || !detectCollision(
      {
        position: {
          x: this._player.offset.x + (this.position.x * this.size.width),
          y: this._player.offset.y + (this.position.y * this.size.height),
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
      this.shiftFrame.x,
      this.shiftFrame.y,
      this.imageSize.width,
      this.imageSize.height,
      this._player.offset.x + (this.position.x * BLOCK_SIZE),
      this._player.offset.y + (this.position.y * BLOCK_SIZE),
      this.size.width,
      this.size.height);

    this.context.strokeRect(
      this._player.offset.x + (this.position.x * BLOCK_SIZE) + 32,
      this._player.offset.y + (this.position.y * BLOCK_SIZE),
      this.size.width / 2,
      8);

    this.context.save();
    this.context.fillStyle = "red";
    this.context.fillRect(
      this._player.offset.x + (this.position.x * BLOCK_SIZE) + 32,
      this._player.offset.y + (this.position.y * BLOCK_SIZE),
      this.healthPoint * this.size.width / this._maxHealthPoint / 2,
      8);
    this.context.restore();
  }

  public levelUp(): void {
    this._currentLevel++;
    const addedHealth: number = this._maxHealthPoint * SPAWNER_HEALTH_MULTIPLY;
    this.healthPoint += addedHealth - this._maxHealthPoint;
    this._maxHealthPoint = addedHealth;
  }
}
