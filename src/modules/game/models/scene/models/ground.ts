import { IPoint } from "@game/utils";
import { SceneObject } from "../../base/scene-object";

export class Ground extends SceneObject {
  constructor(id: string, position: IPoint) {
    super(id, position);
    this.position = position;
    this.sprite.src = `/images/ground.png`;
  }
}
