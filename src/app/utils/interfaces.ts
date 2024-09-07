import { IPoint, ISize } from "./types";

export interface ISceneObject {
  position: IPoint;
  size: ISize;
}
export interface INode extends ISceneObject {
  parent: INode | null;
}
