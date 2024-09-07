import { DirectionOffsetEnum } from "./enums";

export const directionMap: Record<string, DirectionOffsetEnum> = {
  "-1,-1": DirectionOffsetEnum.NORTH_WEST,
  "-1,0": DirectionOffsetEnum.NORTH,
  "-1,1": DirectionOffsetEnum.NORTH_EAST,
  "0,1": DirectionOffsetEnum.EAST,
  "1,1": DirectionOffsetEnum.SOUTH_EAST,
  "1,0": DirectionOffsetEnum.SOUTH,
  "1,-1": DirectionOffsetEnum.SOUTH_WEST,
  "0,-1": DirectionOffsetEnum.WEST,
};
