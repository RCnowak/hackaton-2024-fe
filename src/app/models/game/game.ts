import { Injector } from "@angular/core";
import { BaseModel } from "../base/base-model";
import { Scene } from "../scene/scene";
import { Player } from "../player/player";
import { interval, map, tap } from "rxjs";
import {
  BLOCK_SIZE,
  detectCollision,
  IMessage,
  IPoint,
  LevelEnum,
  SPAWNER_COUNT,
  TIME_TO_BORN_ENEMY
} from "../../utils";
import { SceneObject } from "../base/scene-object";
import { Spawner } from "../spawner/spawner";
import { Enemy } from "../enemy/enemy";
import { Level } from "../level/level";
import { v4 as uuidv4 } from "uuid";
import { KeyboardController } from "../player/keyboard-controller";
import { Arrow } from "../player/arrow";
import { Wall } from "../scene/models/wall";

export class Game extends BaseModel {
  private _scene!: Scene;
  private _currentPlayer!: Player;
  private _enemiesWaiting: number = SPAWNER_COUNT;

  private _players: Map<string, Player> = new Map();
  private _spawners: Map<string, Spawner> = new Map();
  private _arrows: Map<string, Arrow> = new Map();
  private _enemies: Map<string, Enemy> = new Map();
  private _sceneObjects: Map<string, SceneObject> = new Map();

  constructor(injector: Injector, id: string) {
    super(injector, id);
    this.init();
  }

  override init(): void {
    interval(TIME_TO_BORN_ENEMY)
      .pipe(tap(() => {
        this._enemiesWaiting++;
      }))
      .subscribe();

    const update = (deltaTime: number): void => {
      this._players.forEach((player: Player) => player.update(deltaTime));
      this._enemies.forEach((enemy: Enemy) => enemy.update(deltaTime));
      this._arrows.forEach((arrow: Arrow) => this.detectCollisionArrow(arrow, deltaTime));
      this._spawners.forEach(this.createEnemy.bind(this));
    };
    const render = (): void => {
      if (!this._scene) return;
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this._scene.render();
      this._players.forEach((player: Player) => player.render());
      this._arrows.forEach((arrow: Arrow) => arrow.render());
      this._enemies.forEach((enemy: Enemy) => enemy.render());
    };

    this.delta$.pipe(
      map((deltaTime: number) => deltaTime / 1000),
      tap((deltaTime: number): void => {
          update(deltaTime);
          render();
        }
      )).subscribe();

    this.socket.message$.pipe(
      tap((message: IMessage): void => {
        switch ( message.action ) {
          case "add_player":
            this._players.set(message.payload.id, message.payload);
            break;
          case "player_attack":
            this._arrows.set(message.payload.id, message.payload);
            break;
          case "add_enemy":
            this._enemies.set(message.payload.id, message.payload);
            break;
          case "cancel_attack":
            this._arrows.delete(message.payload.id);
            break;
          case "kill_enemy":
            this._enemies.delete(message.payload.id);
            break;
          case "set_scene":
            this._scene = message.payload;
            this._sceneObjects = message.payload.sceneObjects;
            message.payload._sceneObjects.values()
              .filter((object: SceneObject): boolean => object instanceof Spawner)
              .forEach((spawner: Spawner): void => {
                this._spawners.set(spawner.id, spawner);
              });
            break;
          case "update_position":
            // Обновлять второго игрока
            break;
        }
      })
    ).subscribe();
  }

  private createEnemy(spawner: Spawner): void {
    if (this._enemiesWaiting && spawner.bornNewEnemy()) {
      const uid: string = uuidv4();
      const enemy: Enemy = new Enemy(this.injector, uid, spawner.position, this._currentPlayer, this._scene.level);
      this._enemiesWaiting--;
      this.socket.on({ action: "add_enemy", payload: enemy });
    }
  }

  public createCurrentPlayer(level: LevelEnum[][]): void {
    const position: IPoint = Level.getEmptyPosition(level);
    const uid: string = uuidv4();
    const player: Player = new Player(this.injector, uid, position, level);
    player.controller = new KeyboardController();
    this._currentPlayer = player;
    this._scene.player = player;
    this.socket.on({ action: "add_player", payload: player });
  }

  private detectCollisionArrow(arrow: Arrow, deltaTime: number): void {
    const detectWall: SceneObject | undefined = Array.from(this._sceneObjects.values())
      .filter((value: SceneObject): boolean => value instanceof Wall)
      .find((wall: SceneObject) => detectCollision({
        position: { x: arrow.position.x * BLOCK_SIZE, y: arrow.position.y * BLOCK_SIZE },
        size: arrow.size
      }, {
        position: { x: wall.position.x * BLOCK_SIZE, y: wall.position.y * BLOCK_SIZE },
        size: wall.size
      }));

    const killEnemy: Enemy | undefined = Array.from(this._enemies.values())
      .find((enemy: Enemy) => detectCollision({
        position: { x: arrow.position.x * BLOCK_SIZE, y: arrow.position.y * BLOCK_SIZE },
        size: arrow.size
      }, {
        position: { x: enemy.position.x * BLOCK_SIZE, y: enemy.position.y * BLOCK_SIZE },
        size: enemy.size
      }));

    if (killEnemy) {
      this.socket.on({ action: "kill_enemy", payload: killEnemy });
    }

    if (detectWall || killEnemy) {
      this.socket.on({ action: "cancel_attack", payload: arrow });
      return;
    }

    arrow.update(deltaTime);
  }
}
