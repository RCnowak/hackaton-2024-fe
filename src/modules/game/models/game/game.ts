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
  private _activeSpawners: Map<string, Spawner> = new Map();
  private _arrows: Map<string, Arrow> = new Map();
  private _enemies: Map<string, Enemy> = new Map();
  private _sceneObjects: Map<string, BaseModel> = new Map();
  private _spawners: Map<string, Spawner> = new Map();

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
      this._activeSpawners.forEach(this.createEnemy.bind(this));
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
          update(deltaTime);
          render();
        }
      )).subscribe();

    this.socket.message$.pipe(
      tap((message: IMessage): void => {
        switch ( message.action ) {
          case "add_player":
            const player: Player = new Player(this.injector, message.payload.uid, message.payload.position, message.payload.level);
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
          case "add_enemy":
            const enemy: Enemy = new Enemy(
              this.injector,
              message.payload.uid,
              message.payload.spawnerPosition,
              this._players.get(message.payload.playerId)!,
              message.payload.scenelevel
            )
            this._enemies.set(message.payload.id, enemy);
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
          case "attack_spawner":
            const spawner: Spawner = this._activeSpawners.get(message.payload)!;
            spawner.active = false;
            this._activeSpawners.delete(message.payload);
            break;
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
      this.socket.dispatchGameEvent({ action: "add_enemy", payload: {
        uid: uuidv4(),
        spawnerPosition: spawner.position,
        playerId: this._currentPlayer.id,
        scenelevel: this._scene.level
      } });
    }
  }

  public createCurrentPlayer(level: LevelEnum[][]): void {
    const position: IPoint = Level.getEmptyPosition(level);
    const uid: string = uuidv4();
    this.socket.dispatchGameEvent({ action: "add_player", payload: {uid, position, level} });
  }

  private detectCollisionArrow(arrow: Arrow, deltaTime: number): void {
    const detectHit: BaseModel | undefined = Array.from(this._sceneObjects.values())
      .filter((object: BaseModel) => object instanceof Wall)
      .find((value: BaseModel): boolean => detectCollision({
        position: { x: arrow.position.x * BLOCK_SIZE, y: arrow.position.y * BLOCK_SIZE },
        size: arrow.size
      }, {
        position: { x: value.position.x * BLOCK_SIZE, y: value.position.y * BLOCK_SIZE },
        size: value.size
      }));

    const attackSpawner: Spawner | undefined = Array.from(this._activeSpawners.values())
      .find((enemy: Spawner) => detectCollision({
        position: { x: arrow.position.x * BLOCK_SIZE, y: arrow.position.y * BLOCK_SIZE },
        size: arrow.size
      }, {
        position: { x: enemy.position.x * BLOCK_SIZE, y: enemy.position.y * BLOCK_SIZE },
        size: enemy.size
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
      this.socket.dispatchGameEvent({ action: "kill_enemy", payload: killEnemy.id });
    }

    if (attackSpawner) {
      this.socket.dispatchGameEvent({ action: "attack_spawner", payload: attackSpawner.id });
    }

    if (detectHit || killEnemy || attackSpawner) {
      this.socket.dispatchGameEvent({ action: "cancel_attack", payload: arrow.id });
      return;
    }

    arrow.update(deltaTime);
  }
}
