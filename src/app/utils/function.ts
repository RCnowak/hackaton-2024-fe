import { animationFrameScheduler, Observable } from "rxjs";
import { INode, ISceneObject } from "./interfaces";
import { IPoint, ISize } from "./types";
import { BLOCK_SIZE, LEVEL_SIZE } from "./constants";
import { DirectionOffsetEnum, LevelEnum } from "./enums";
import { SceneObject } from "../models/base/scene-object";
import { directionMap } from "./records";
import { BaseModel } from "../models/base/base-model";

export function deltaTime(): Observable<number> {
  return new Observable<number>((observer) => {
    let previousTime = animationFrameScheduler.now();

    function tick() {
      const currentTime = animationFrameScheduler.now();
      const deltaTime = currentTime - previousTime;
      previousTime = currentTime;

      observer.next(deltaTime);
      animationFrameScheduler.schedule(tick);
    }

    animationFrameScheduler.schedule(tick);
  });
}

export const detectCollision = (m1: ISceneObject, m2: ISceneObject): boolean => {
  const {
    position: { x: x1, y: y1 },
    size: { width: width1, height: height1 },
  } = m1;
  const {
    position: { x: x2, y: y2 },
    size: { width: width2, height: height2 },
  } = m2;

  return (
    x1 + width1 > x2 &&
    x1 < x2 + width2 &&
    y1 + height1 > y2 &&
    y1 < y2 + height2
  );
};

export const createPath = (object: ISceneObject, target: ISceneObject, level: LevelEnum[][]): IPoint[] => {
  const queueNodes: INode[] = [ { position: object.position, size: object.size, parent: null } ];
  const visitedNodes: Set<string> = new Set();
  const _target: ISceneObject = {
    size: target.size, position: {
      x: target.position.x * BLOCK_SIZE,
      y: target.position.y * BLOCK_SIZE
    }
  };

  while (queueNodes.length) {
    const node: INode = queueNodes.shift()!;
    const nodeKey: string = `${ node.position.x },${ node.position.y }`;
    if (visitedNodes.has(nodeKey)) continue;
    visitedNodes.add(nodeKey);
    if (detectCollision({ size: _target.size, position: _target.position }, {
      size: node.size,
      position: { x: node.position.x * BLOCK_SIZE, y: node.position.y * BLOCK_SIZE }
    })) {
      return findPath(node);
    }
    queueNodes.push(...getNeighbors(node, level));
  }

  return [];
};

export const findPath = (node: INode): IPoint[] => {
  const path: IPoint[] = [];
  let current: INode | null = node;
  while (current?.parent !== null) {
    path.unshift({ x: current.position.x, y: current.position.y });
    current = current.parent;
  }
  return path;
};

export const getNeighbors = (parent: INode, level: LevelEnum[][]): INode[] => {
  const neighbors: INode[] = [];
  const _x: number = Math.round(parent.position.x);
  const _y: number = Math.round(parent.position.y);
  for ( const { x, y } of [
    { x: Math.round(_x), y: Math.round(_y - 1) },
    { x: Math.round(_x), y: Math.round(_y) + 1 },
    { x: Math.round(_x) - 1, y: Math.round(_y) },
    { x: Math.round(_x) + 1, y: Math.round(_y) },
    { x: Math.round(_x) - 1, y: Math.round(_y - 1) },
    { x: Math.round(_x) + 1, y: Math.round(_y - 1) },
    { x: Math.round(_x) + 1, y: Math.round(_y + 1) },
    { x: Math.round(_x) + 1, y: Math.round(_y - 1) },
  ] ) {
    if (level?.[x]?.[y] && !checkWall(level[x][y])) {
      neighbors.push({ position: { x, y }, size: parent.size, parent });
    }
  }
  return neighbors;
};

export const checkWall = (point: LevelEnum): boolean => {
  return (
    point === LevelEnum.LADDER_LEFT ||
    point === LevelEnum.LADDER_RIGHT ||
    point === LevelEnum.WALL_NORTH ||
    point === LevelEnum.WALL_WEST ||
    point === LevelEnum.WALL_EAST ||
    point === LevelEnum.WALL_SOUTH ||
    point === LevelEnum.WALL_NORTH_EAST ||
    point === LevelEnum.WALL_NORTH_WEST ||
    point === LevelEnum.WALL_SOUTH_EAST ||
    point === LevelEnum.WALL_SOUTH_WEST
  );
};

export const checkHorizontalDirection = (newPosition: IPoint, object: BaseModel, level: LevelEnum[][]): boolean => {
  if (object.direction.x === 0) return false;
  const points: IPoint[] = [
    {
      x: Math.floor(newPosition.x + object.size.width / BLOCK_SIZE / 2),
      y: Math.floor(object.position.y + object.size.height / BLOCK_SIZE / 2)
    },
  ];
  return points.some((point: IPoint): boolean => level?.[point.x]?.[point.y] ? checkWall(level?.[point.x]?.[point.y]) : true);

};

export const checkVerticalDirection = (newPosition: IPoint, object: BaseModel, level: LevelEnum[][]): boolean => {
  if (object.direction.y === 0) return false;
  const points: IPoint[] = [
    {
      x: Math.floor(object.position.x + object.size.width / BLOCK_SIZE / 2),
      y: Math.floor(newPosition.y + object.size.height / BLOCK_SIZE / 2)
    },
  ];
  return points.some((point: IPoint): boolean => level?.[point.x]?.[point.y] ? checkWall(level?.[point.x]?.[point.y]) : true);
};

export const calculateOffset = (updatedPosition: IPoint, offset: IPoint, canvasSize: ISize): IPoint => {
  const startPoint: IPoint = { x: updatedPosition.x * BLOCK_SIZE, y: updatedPosition.y * BLOCK_SIZE };
  const center: IPoint = { x: canvasSize.width / 2, y: canvasSize.height / 2 };

  if (center.x + startPoint.x < LEVEL_SIZE) {
    offset.x = Math.min(center.x - startPoint.x, updatedPosition.x);
  }
  if (center.y + startPoint.y < LEVEL_SIZE) {
    offset.y = Math.min(center.y - startPoint.y, updatedPosition.y);
  }

  return offset;
};


export function getDirection(direction: IPoint): DirectionOffsetEnum {
  const key = `${ direction.x },${ direction.y }`;
  return directionMap[key];
}


export const getRoundedDirection = (degrees: number): IPoint => {
  const directions: IPoint[] = [
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: 0, y: -1 },
    { x: 1, y: -1 }
  ];

  let angle: number = degrees % 360;
  if (angle < 0) {
    angle += 360;
  }

  const index: number = Math.round(angle / 45) % 8;
  return directions[index];
};
