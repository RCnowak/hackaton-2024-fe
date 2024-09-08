import { BLOCK_SIZE, IPoint, ISceneObject, ISize } from "../../utils";
import { BaseModel } from "../base/base-model";
import { Injector } from "@angular/core";
import { Player } from "./player";

export class Arrow extends BaseModel implements ISceneObject {
  public override size: ISize = { width: 8, height: 8 };

  private _direction!: IPoint;
  private _player!: Player;
  private _speed: number = 8;
  private _maxDistance: number = 1.5;
  private _currentDistance: number = 0;

  constructor(injector: Injector, id: string, position: IPoint, direction: IPoint, player: Player) {
    super(injector, id);
    this.position = { ...position };
    this._direction = direction;
    this._player = player;
  }

  public override render(): void {
    this.context.fillRect(
      this._player.offset.x + (this.position.x * BLOCK_SIZE),
      this._player.offset.y + (this.position.y * BLOCK_SIZE),
      this.size.width,
      this.size.height);
  }

  public override update(deltaTime: number): void {
    if (this._currentDistance > this._maxDistance) return;
    this.position.x = this.position.x + this._direction.x * this._speed * deltaTime;
    this.position.y = this.position.y + this._direction.y * this._speed * deltaTime;
    this._currentDistance += deltaTime;
    if (this._currentDistance > this._maxDistance) {
      this.socket.dispatchGameEvent({ action: "cancel_attack", payload: this.id });
    }
  }
}
