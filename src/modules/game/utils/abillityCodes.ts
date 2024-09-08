export enum AbbilityCode {
    attack = 1,
    heal = 2,
    destroy = 3
}

export const abillityMap = new Map([
    [AbbilityCode.attack, 'атака'],
    [AbbilityCode.heal, 'исцеление'],
    [AbbilityCode.destroy, 'апокалипсис'],
])