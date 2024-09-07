import { IPoint, ISize } from "../../../utils";
import { SceneObject } from "../../base/scene-object";

export class Ladder extends SceneObject {
  public override size: ISize = { width: 128, height: 128 };

  constructor(id: string, position: IPoint) {

    super(id, position);
    this.position = position;
    this.sprite.src = `/assets/images/wall.png`;
    this._shiftFrame.x = 8;
  }


}
