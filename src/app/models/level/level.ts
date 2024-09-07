import {
  IPoint,
  ISize,
  detectCollision,
  LevelEnum,
  ISceneObject,
  LEVEL_ELEMENT_COUNT,
  SPAWNER_COUNT
} from "../../utils";

export class Level {
  public static generate(): LevelEnum[][] {
    const rooms: { position: IPoint; size: ISize }[] = [];
    const map: LevelEnum[][] = [];
    let currentRoom = 0;

    for ( let mapX = 0; mapX < LEVEL_ELEMENT_COUNT; mapX++ ) {
      const row = [];
      for ( let mapY = 0; mapY < LEVEL_ELEMENT_COUNT; mapY++ ) {
        if (mapX === 0 && mapY === 0) {
          row.push(LevelEnum.WALL_NORTH_WEST);
        } else if (mapX === LEVEL_ELEMENT_COUNT - 1 && mapY === 0) {
          row.push(LevelEnum.WALL_NORTH_EAST);
        } else if (mapY === 0) {
          row.push(LevelEnum.WALL_NORTH);
        } else if (mapY === LEVEL_ELEMENT_COUNT - 1) {
          row.push(LevelEnum.WALL_SOUTH);
        } else if (mapX === LEVEL_ELEMENT_COUNT - 1) {
          row.push(LevelEnum.WALL_WEST);
        } else if (mapX === 0) {
          row.push(LevelEnum.WALL_EAST);
        } else {
          row.push(LevelEnum.EMPTY);
        }

      }
      map.push(row);
    }
    while (currentRoom < SPAWNER_COUNT) {
      const room = this.createRoom(rooms);
      for ( let mapX = room.position.x; mapX < room.position.x + room.size.width; mapX++ ) {
        for ( let mapY = room.position.y; mapY < room.position.y + room.size.height; mapY++ ) {
          const position: IPoint = { x: mapX, y: mapY };
          const { x: centerX, y: centerY } = this.centerRoom(room);
          if (mapY === 0) {
            this.setMapObject(map, position, LevelEnum.WALL_NORTH);
          } else if (position.x === room.position.x && position.y === room.position.y) {
            this.setMapObject(map, position, LevelEnum.WALL_NORTH_WEST);
          } else if (position.x === room.position.x + room.size.width - 1 && position.y === room.position.y) {
            this.setMapObject(map, position, LevelEnum.WALL_NORTH_EAST);
          } else if (position.x === room.position.x && position.y === room.position.y + room.size.height - 1) {
            this.setMapObject(map, position, LevelEnum.WALL_SOUTH_WEST);
          } else if (position.x === room.position.x + room.size.width - 1 && position.y === room.position.y + room.size.height - 1) {
            this.setMapObject(map, position, LevelEnum.WALL_SOUTH_EAST);
          } else if (position.y === room.position.y) {
            this.setMapObject(map, position, LevelEnum.WALL_NORTH);
          } else if (position.x === room.position.x) {
            this.setMapObject(map, position, LevelEnum.WALL_EAST);
          } else if (position.x === room.position.x + room.size.width - 1) {
            this.setMapObject(map, position, LevelEnum.WALL_WEST);
          } else if (position.y === room.position.y + room.size.height - 1 && position.x === centerX - 1) {
            this.setMapObject(map, position, LevelEnum.LADDER_LEFT);
          } else if (position.y === room.position.y + room.size.height - 1 && position.x === centerX) {
            this.setMapObject(map, position, LevelEnum.LADDER);
          } else if (position.y === room.position.y + room.size.height - 1 && position.x === centerX + 1) {
            this.setMapObject(map, position, LevelEnum.LADDER_RIGHT);
          } else if (position.y === room.position.y + room.size.height - 1) {
            this.setMapObject(map, position, LevelEnum.WALL_SOUTH);
          } else if (position.x === centerX && position.y === centerY) {
            this.setMapObject(map, position, LevelEnum.SPAWNER);
          } else {
            this.setMapObject(map, position, LevelEnum.GROUND);
          }
        }
      }
      rooms.push(room);
      currentRoom++;
    }

    for ( let i = 0; i < 265; i++ ) {
      const stone = this.getEmptyPosition(map);
      this.setMapObject(map, stone, LevelEnum.STONES);
    }
    return map;
  }

  private static createRoom(rooms: ISceneObject[]): ISceneObject {
    const MIN_WIDTH: number = Math.floor(LEVEL_ELEMENT_COUNT / SPAWNER_COUNT);
    const MIN_HEIGHT: number = Math.floor(LEVEL_ELEMENT_COUNT / SPAWNER_COUNT);

    let x: number = 0;
    let y: number = 0;
    let height: number = 0;
    let width: number = 0;
    let area: number = 0;
    do {
      x = Math.ceil(Math.random() * LEVEL_ELEMENT_COUNT);
      y = Math.ceil(Math.random() * LEVEL_ELEMENT_COUNT);
      width = Math.ceil(Math.random() * LEVEL_ELEMENT_COUNT) + MIN_WIDTH;
      height = Math.ceil(Math.random() * LEVEL_ELEMENT_COUNT) + MIN_HEIGHT;
      area = height * width;

      console.log(area);
    } while (
      area > 100 || this.onEdge(x, y, width, height) ||
      rooms.some((r) => detectCollision(
        { position: { x, y }, size: { width, height } },
        {
          position: { x: r.position.x - 1, y: r.position.y - 1 },
          size: { width: r.size.width + 2, height: r.size.height + 2 }
        }
      )));
    return { position: { x, y }, size: { height, width } };
  }

  public static getEmptyPosition(map: LevelEnum[][]): IPoint {
    let x = 0;
    let y = 0;
    do {
      x = Math.ceil(Math.random() * LEVEL_ELEMENT_COUNT);
      y = Math.ceil(Math.random() * LEVEL_ELEMENT_COUNT);
    } while (this.onEdge(x, y, 1, 1) || !(map[x][y] === LevelEnum.EMPTY || map[x][y] === LevelEnum.GROUND));
    return { x, y };
  }

  private static centerRoom(room: ISceneObject): IPoint {
    const { position, size } = room;

    return {
      x: Math.floor(position.x + size.width / 2),
      y: Math.floor(position.y + size.height / 2)
    };
  }

  private static setMapObject(map: LevelEnum[][], position: IPoint, value: LevelEnum, conditionPoint: LevelEnum | null = null): void {
    const { x, y } = position;

    if (conditionPoint !== null && map[x][y] !== conditionPoint) {
      return;
    }

    map[x][y] = value;
  }

  private static onEdge(x: number, y: number, width: number, height: number): boolean {
    return x < 2 || x > LEVEL_ELEMENT_COUNT - 3 || x + width > LEVEL_ELEMENT_COUNT - 3 ||
      y < 2 || y > LEVEL_ELEMENT_COUNT - 3 || y + height > LEVEL_ELEMENT_COUNT - 3;
  }
}
