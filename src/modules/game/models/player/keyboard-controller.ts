import { filter, fromEvent, map, merge, Observable, scan, share } from "rxjs";
import { IPoint } from "../../utils";
import { AbstractController, Direction } from './controller';

const keyMap: Map<string, Direction> = new Map([
  [ "w", Direction.Up ],
  [ "a", Direction.Left ],
  [ "s", Direction.Down ],
  [ "d", Direction.Right ],
  [ "ц", Direction.Up ],
  [ "ф", Direction.Left ],
  [ "ы", Direction.Down ],
  [ "в", Direction.Right ],
]);

const isVoiceCommand = (key: string) => ['f', 'а'].includes(key.toLocaleLowerCase());

export class KeyboardController extends AbstractController {
  private readonly actionStart$ = fromEvent<MouseEvent>(document, "mousedown").pipe(map(() => true));
  private readonly actionEnd$ = fromEvent<MouseEvent>(document, "mouseup").pipe(map(() => false));
  private readonly keypress$: Observable<KeyboardEvent> = fromEvent<KeyboardEvent>(document, "keydown");
  private readonly keyup$: Observable<KeyboardEvent> = fromEvent<KeyboardEvent>(document, "keyup");
  private readonly keys$: Observable<KeyboardEvent> = merge(this.keypress$, this.keyup$).pipe(share());
  protected override directions$ = this.keys$.pipe(scan((activeKeys: Set<Direction>, event: KeyboardEvent) => {
    const key = event.key.toString().toLowerCase();
    const direction = keyMap.get(key);
    if (direction) {
      if (event.type === "keydown") {
        activeKeys.add(direction);
      } else if (event.type === "keyup") {
        activeKeys.delete(direction);
      }
    }

    return activeKeys;
  }, new Set<Direction>()),);
  protected override voiceCommandTrigger$ = merge(
    this.keypress$.pipe(filter(e => isVoiceCommand(e.key)), map(() => true)),
    this.keyup$.pipe(filter(e => isVoiceCommand(e.key)), map(() => false)),
  );

  override action$ = merge(this.actionStart$, this.actionEnd$).pipe(share())
  override voiceCommand$ = this.initVoiceCommand();
  override moveDirection$ = this.initMoveDirection();

  public readonly mousemove$: Observable<IPoint> = fromEvent<MouseEvent>(document, "mousemove").pipe(
    map((event: MouseEvent): IPoint => ({ x: event.clientX, y: event.clientY })),
    share()
  );
}
