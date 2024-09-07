import { IPoint, LevelEnum } from "../../../utils";
import { SceneObject } from "../../base/scene-object";

export class Ladder extends SceneObject {
  constructor(id: string, position: IPoint, value: LevelEnum) {
    super(id, position);
    this.position = position;
    this.sprite.src = `/images/wall.png`;
    this.shiftFrame.x = value;
  }
}
