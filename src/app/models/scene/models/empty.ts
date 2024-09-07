import { IPoint } from "../../../utils";
import { SceneObject } from "../../base/scene-object";

export class Empty extends SceneObject {
  constructor(id: string, position: IPoint) {
    super(id, position);
    this.position = position;
    this.sprite.src = `/assets/images/empty.png`;
  }
}
