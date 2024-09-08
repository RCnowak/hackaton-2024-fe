// Не трогать
export const BLOCK_SIZE: number = 128;
export const MIN_WIDTH: number = 4;
export const MIN_HEIGHT: number = 4;
export const LEVEL_ELEMENT_COUNT: number = 32;
export const SPAWNER_COUNT: number = 6;
export const ANIMATION_FRAME_RATE: number = 1000 / 24;
export const TIME_TO_UPDATE_PATH: number = 500;
export const COUNT_STONE: number = 50;
export const LEVEL_SIZE: number = LEVEL_ELEMENT_COUNT * BLOCK_SIZE;

// Настройки персонажа
export const BASE_HEALTH_POINT: number = 100;
export const BASE_POWER: number = 10;
export const BASE_SPEED: number = 2;
export const COOLDOWN_ATTACK: number = 300;
export const COOLDOWN_ABBILITY: number = 3000;
export const POWER_MULTIPLY: number = 1.5;
export const HEALTH_MULTIPLY: number = 2;

// Настройки монстрова
export const MONSTER_BASE_HEALTH_POINT: number = 10;
export const MONSTER_BASE_POWER: number = 1;
export const MONSTER_BASE_SPEED: number = 1.5;
export const MONSTER_ANIMATION_ATTACK: number = ANIMATION_FRAME_RATE / 4;
export const MONSTER_COOLDOWN_ATTACK: number = 1000;
export const TIME_TO_BORN_ENEMY: number = 500;
export const MONSTER_HEALTH_MULTIPLY: number = 1.2;
export const MONSTER_POWER_MULTIPLY: number = 2.5;

// Настройки спавнеров
export const SPAWNER_BASE_HEALTH_POINT: number = 105;
export const SPAWNER_HEALTH_MULTIPLY: number = 2.5;

