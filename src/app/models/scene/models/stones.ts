import { IPoint } from "../../../utils";
import { SceneObject } from "../../base/scene-object";

export class Stones extends SceneObject {
  private readonly stoneId!: number;

  constructor(id: string, position: IPoint, stoneId: number) {
    super(id, position);
    this.position = position;
    this.stoneId = stoneId;
    this.sprite.src = `/images/stones.png`;
  }

  public override render(context?: CanvasRenderingContext2D): void {
    if (!context || !this.sprite.src) return;
    context.drawImage(
      this.sprite,
      this.size.width * this.stoneId,
      0,
      this.size.width,
      this.size.height,
      this.position.x * this.size.width,
      this.position.y * this.size.height,
      this.size.width,
      this.size.height,
    );
  }
}
