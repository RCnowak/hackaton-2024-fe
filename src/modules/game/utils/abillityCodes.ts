export enum AbbilityCode {
    speed = 1,
    heal = 2,
    destroy = 3
}

export const abillityMap = new Map([
    [AbbilityCode.speed, 'скорость'],
    [AbbilityCode.heal, 'исцеление'],
    [AbbilityCode.destroy, 'апокалипсис'],
]);