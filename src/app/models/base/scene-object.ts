import { IPoint, ISize, ISceneObject } from "../../utils";

export class SceneObject implements ISceneObject {
  public position: IPoint = { x: 0, y: 0 };
  public size: ISize = { width: 128, height: 128 };
  public sprite: HTMLImageElement = new Image();
  public id: string;
  public shiftFrame: IPoint = { x: 0, y: 0 };

  constructor(id: string, position: IPoint) {
    this.id = id;
    this.position = position;
  }

  public render(context?: CanvasRenderingContext2D): void {
    if (!context || !this.sprite.src) return;
    context.drawImage(
      this.sprite,
      this.shiftFrame.x * this.size.width,
      this.shiftFrame.y * this.size.height,
      this.size.width,
      this.size.height,
      this.position.x * this.size.width,
      this.position.y * this.size.height,
      this.size.width,
      this.size.height);
  }
}
