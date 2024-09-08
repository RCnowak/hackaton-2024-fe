import { Injector } from "@angular/core";
import { BaseModel } from "../base/base-model";
import { Scene } from "../scene/scene";
import { Player } from "../player/player";
import { map, tap } from "rxjs";
import {
  BASE_SPEED,
  BLOCK_SIZE,
  COOLDOWN_ABBILITY,
  detectCollision,
  IMessage,
  IPoint,
  LevelEnum,
  SPAWNER_COUNT,
  TIME_TO_BORN_ENEMY
} from "@game/utils";

import { Spawner } from "../spawner/spawner";
import { Enemy } from "../enemy/enemy";
import { Level } from "../level/level";
import { v4 as uuidv4 } from "uuid";
import { KeyboardController } from "../player/keyboard-controller";
import { Arrow } from "../player/arrow";
import { Wall } from "../scene/models/wall";
import { AbbilityCode } from "@game/utils/abillityCodes";

export class Game extends BaseModel {
  _currentPlayer!: Player;
  private _scene!: Scene;
  private _enemiesWaiting: number = SPAWNER_COUNT;
  private _players: Map<string, Player> = new Map();
  private _activeSpawners: Map<string, Spawner> = new Map();
  private _arrows: Map<string, Arrow> = new Map();
  private _enemies: Map<string, Enemy> = new Map();
  private _sceneObjects: Map<string, BaseModel> = new Map();
  private _spawners: Map<string, Spawner> = new Map();
  private _gameOver: boolean = false;
  private _lastEnemyCreatedAt: number = Date.now();


  constructor(injector: Injector, id: string) {
    super(injector, id);
    this.init();
  }

  override init(): void {
    const update = (deltaTime: number): void => {
      const currentTime = Date.now();
      if (currentTime - this._lastEnemyCreatedAt > TIME_TO_BORN_ENEMY) {
        this._enemiesWaiting++;
      }
      this._players.forEach((player: Player) => player.update(deltaTime));
      this._enemies.forEach((enemy: Enemy) => this.detectCollisionEnemy(enemy, deltaTime));
      this._arrows.forEach((arrow: Arrow) => this.detectCollisionArrow(arrow, deltaTime));
      this._activeSpawners.forEach(this.createEnemy.bind(this));
      this._spawners.forEach((spawner: Spawner) => spawner.update());
    };

    const render = (): void => {
      if (!this._scene) return;
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this._scene.render();
      this._spawners.forEach((spawner: Spawner) => spawner.render());
      this._players.forEach((player: Player) => player.render());
      this._arrows.forEach((arrow: Arrow) => arrow.render());
      this._enemies.forEach((enemy: Enemy) => enemy.render());
    };

    this.delta$.pipe(
      map((deltaTime: number) => deltaTime),
      tap((deltaTime: number): void => {
          if (this._gameOver) return;
          update(deltaTime);
          render();
        }
      )).subscribe();

    this.socket.message$.pipe(
      tap((message: IMessage): void => {
        switch ( message.action ) {
          case "add_player":
            const gameClass = "mage";
            const player: Player = new Player(this.injector, message.payload.uid, message.payload.position, gameClass, message.payload.level);
            player.controller = new KeyboardController();
            this._currentPlayer = player;
            this._scene.player = player;
            this._players.set(message.payload.uid, player);
            this.activatedSpawners();
            break;
          case "player_attack":
            const arrow: Arrow = new Arrow(
              this.injector,
              message.payload.uid,
              message.payload.position,
              message.payload.direction,
              this._players.get(message.payload.playerId)!
            );
            this._arrows.set(message.payload.uid, arrow);
            break;
          case "player_death":
            this._gameOver = true;
            break;
          case "attack_enemy":
            if (message.payload.healthPoint <= 0) {
              this._enemies.delete(message.payload.id);
            }
            break;
          case "add_enemy":
            const enemy: Enemy = new Enemy(
              this.injector,
              message.payload.uid,
              message.payload.spawnerPosition,
              this._players.get(message.payload.playerId)!,
              message.payload.scenelevel
            );
            this._enemies.set(message.payload.uid, enemy);
            break;
          case "cancel_attack":
            this._arrows.delete(message.payload);
            break;
          case "kill_enemy":
            this._enemies.delete(message.payload);
            break;
          case "set_scene":
            const scene: Scene = new Scene(this.injector, message.payload);
            this._scene = scene;
            this._sceneObjects = scene.sceneObjects as any;
            break;
          case "death_spawner":
            this._currentPlayer.levelUp();
            this._spawners.forEach((spawner: Spawner) => spawner.levelUp());
            this._activeSpawners.delete(message.payload);
            break;
          case "apply_ability":
            const currentTime = Date.now();
            if (currentTime - this._currentPlayer.lastUseAbbilityAt < COOLDOWN_ABBILITY) return;

            if (message.payload.abillityCode === AbbilityCode.destroy) {
              this._enemies.clear();
              this._currentPlayer.lastUseAbbilityAt = currentTime;
            } else if (message.payload.abillityCode === AbbilityCode.heal) {
              this._currentPlayer.healthPoint = Math.min(this._currentPlayer.maxHealthPoint, this._currentPlayer.healthPoint + 30);
              this._currentPlayer.lastUseAbbilityAt = currentTime;
            } else if (message.payload.abillityCode === AbbilityCode.speed
            ) {
              this._currentPlayer.lastUseAbbilityAt = currentTime;
              this._currentPlayer._speed = this._currentPlayer._speed * 2;
              setTimeout(() => this._currentPlayer._speed = BASE_SPEED, 2_000);
            }
        }
      })
    ).subscribe();
  }

  private activatedSpawners(): void {
    for ( let mapX = 0; mapX < this._scene.level.length; mapX++ ) {
      for ( let mapY = 0; mapY < this._scene.level[mapX].length; mapY++ ) {
        if (this._scene.level[mapX][mapY] === LevelEnum.SPAWNER) {
          const position: IPoint = { x: mapX, y: mapY };
          const uid: string = `${ mapX }-${ mapY }`;
          const spawner: Spawner = new Spawner(this.injector, uid, position, this._currentPlayer);
          this._activeSpawners.set(uid, spawner);
          this._spawners.set(uid, spawner);
        }
      }
    }
  }

  private createEnemy(spawner: Spawner): void {
    if (this._enemiesWaiting && spawner.bornNewEnemy()) {
      this._enemiesWaiting--;
      this.socket.dispatchGameEvent({
        action: "add_enemy", payload: {
          uid: uuidv4(),
          spawnerPosition: spawner.position,
          playerId: this._currentPlayer.id,
          scenelevel: this._scene.level
        }
      });
    }
  }

  public createCurrentPlayer(level: LevelEnum[][]): void {
    const position: IPoint = Level.getEmptyPosition(level);
    const uid: string = uuidv4();
    this.socket.dispatchGameEvent({ action: "add_player", payload: { uid, position, level } });
  }

  private detectCollisionArrow(arrow: Arrow, deltaTime: number): void {
    let detectHit: BaseModel | undefined = Array.from(this._sceneObjects.values())
      .filter((object: BaseModel) => object instanceof Wall)
      .find((value: BaseModel): boolean => detectCollision({
        position: { x: arrow.position.x * BLOCK_SIZE, y: arrow.position.y * BLOCK_SIZE },
        size: arrow.size
      }, {
        position: { x: value.position.x * BLOCK_SIZE, y: value.position.y * BLOCK_SIZE },
        size: value.size
      }));

    this._activeSpawners
      .forEach((spawner: Spawner) => {
        if (detectCollision({
          position: { x: arrow.position.x * BLOCK_SIZE, y: arrow.position.y * BLOCK_SIZE },
          size: arrow.size
        }, {
          position: { x: spawner.position.x * BLOCK_SIZE, y: spawner.position.y * BLOCK_SIZE },
          size: spawner.size
        })) {
          detectHit = spawner;
          spawner.healthPoint -= this._currentPlayer.power;
          this.socket.dispatchGameEvent({ action: "attack_spawner", payload: spawner.id });
        }
      });

    this._enemies
      .forEach((enemy: Enemy) => {
        if (detectCollision({
          position: { x: arrow.position.x * BLOCK_SIZE, y: arrow.position.y * BLOCK_SIZE },
          size: arrow.size
        }, {
          position: {
            x: enemy.position.x * BLOCK_SIZE + 32,
            y: enemy.position.y * BLOCK_SIZE + 32
          },
          size: {
            width: enemy.size.width - 64,
            height: enemy.size.height - 64
          }
        })) {
          enemy.healthPoint -= arrow.player.power;
          if (enemy.healthPoint <= 0) {
            this.socket.dispatchGameEvent({
              action: "attack_enemy",
              payload: { id: enemy.id, healthPoint: enemy.healthPoint }
            });
          }
          detectHit = enemy;
        }
      });

    if (detectHit) {
      this.socket.dispatchGameEvent({ action: "cancel_attack", payload: arrow.id });
      return;
    }

    arrow.update(deltaTime);
  }

  private detectCollisionEnemy(enemy: Enemy, deltaTime: number) {
    if (detectCollision({
      position: {
        x: this._currentPlayer.position.x * BLOCK_SIZE + 32,
        y: this._currentPlayer.position.y * BLOCK_SIZE + 32
      },
      size: {
        width: this._currentPlayer.size.width - 64,
        height: this._currentPlayer.size.height - 64
      }
    }, {
      position: { x: enemy.position.x * BLOCK_SIZE + 32, y: enemy.position.y * BLOCK_SIZE + 32 },
      size: {
        width: enemy.size.width - 64,
        height: enemy.size.height - 64
      }
    })) {
      enemy.attack();
    }

    enemy.update(deltaTime);
  }
}
