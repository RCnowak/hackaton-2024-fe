import { IPoint, SPAWNER_COUNT } from "../../utils";
import { SceneObject } from "../base/scene-object";

export class Spawner extends SceneObject {
  private _lastCreateMonsterAt: number = Date.now();

  constructor(id: string, position: IPoint) {
    super(id, position);
    this.position = position;
    this.sprite.src = `/images/spawner.png`;
  }

  public bornNewEnemy(): boolean {
    const currentTime: number = Date.now();
    if (currentTime - this._lastCreateMonsterAt < SPAWNER_COUNT * 500) return false;
    this._lastCreateMonsterAt = currentTime;
    return true;
  }
}
