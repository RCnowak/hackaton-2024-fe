import { BLOCK_SIZE, detectCollision, IPoint, ISceneObject, ISize, SPAWNER_COUNT } from "../../utils";
import { BaseModel } from "../base/base-model";
import { Player } from "../player/player";
import { Injector } from "@angular/core";

export class Spawner extends BaseModel implements ISceneObject {
  public override shiftFrame: IPoint = { x: 0, y: 0 };
  private _lastCreateMonsterAt: number = Date.now();
  override size: ISize = { width: 128, height: 128 };
  private _active = true;
  private player: Player;

  set active(value: boolean) {
    if (!value) {
      this._active = value;
      this.shiftFrame.y = this.size.height;
    }
  }

  constructor(injector: Injector,id: string, position: IPoint, player: Player) {
    super(injector,id);
    this.position = position;
    this.sprite.src = `/images/spawner.png`;
    this.player = player
  }

  public bornNewEnemy(): boolean {
    const currentTime: number = Date.now();
    if (currentTime - this._lastCreateMonsterAt < SPAWNER_COUNT * 500) return false;
    this._lastCreateMonsterAt = currentTime;
    return true;
  }

  public override render(): void {
    if (!this.context || !detectCollision(
      {
        position: {
          x: this.player.offset.x + (this.position.x * this.size.width),
          y: this.player.offset.y + (this.position.y * this.size.height),
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
      this.player.offset.x + (this.position.x * BLOCK_SIZE),
      this.player.offset.y + (this.position.y * BLOCK_SIZE),
      this.size.width,
      this.size.height);
  }
}
