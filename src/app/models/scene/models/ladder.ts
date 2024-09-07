import { IPoint, ISize, LevelEnum } from "../../../utils";
import { SceneObject } from "../../base/scene-object";

export class Ladder extends SceneObject {
  public override size: ISize = { width: 128, height: 128 };

  constructor(id: string, position: IPoint, value: LevelEnum) {
    super(id, position);
    this.position = position;
    this.sprite.src = `/images/wall.png`;
    this._shiftFrame.x = value;
  }
}
