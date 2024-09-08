import { IPoint, ISize, LevelEnum } from "@game/utils";
import { SceneObject } from "../../base/scene-object";

const shiftWall: LevelEnum[] = [
  LevelEnum.WALL_NORTH_WEST,
  LevelEnum.WALL_NORTH_EAST,
  LevelEnum.WALL_EAST,
  LevelEnum.WALL_NORTH,
  LevelEnum.WALL_WEST,
  LevelEnum.WALL_SOUTH_WEST,
  LevelEnum.WALL_SOUTH,
  LevelEnum.WALL_SOUTH_EAST,
];

export class Wall extends SceneObject {
  public override size: ISize = { width: 128, height: 128 };

  constructor(id: string, position: IPoint, direction: LevelEnum) {
    super(id, position);
    this.position = position;
    this.sprite.src = `/images/wall.png`;
    this.shiftFrame.x = shiftWall.indexOf(direction);
  }
}
