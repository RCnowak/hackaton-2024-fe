import { IPoint } from "../../../utils";
import { SceneObject } from "../../base/scene-object";

export class Stones extends SceneObject {
  constructor( id: string, position: IPoint, shiftFrame: number) {
    super(id, position);
    this.position = position;
    this.sprite.src = `/images/stones.png`;
    this.shiftFrame.x = shiftFrame
  }
}
