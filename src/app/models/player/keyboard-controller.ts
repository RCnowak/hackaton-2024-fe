import { fromEvent, map, merge, Observable, scan, share } from "rxjs";
import { IPoint } from "../../utils";

export class KeyboardController {
  private readonly keypress$: Observable<KeyboardEvent> = fromEvent<KeyboardEvent>(document, "keydown");
  private readonly keyup$: Observable<KeyboardEvent> = fromEvent<KeyboardEvent>(document, "keyup");
  private readonly mousedown$: Observable<MouseEvent> = fromEvent<MouseEvent>(document, "mousedown");
  private readonly mouseup$: Observable<MouseEvent> = fromEvent<MouseEvent>(document, "mouseup");
  private readonly keys$: Observable<KeyboardEvent> = merge(this.keypress$, this.keyup$).pipe(share());
  public readonly mousemove$: Observable<IPoint> = fromEvent<MouseEvent>(document, "mousemove").pipe(
    map((event: MouseEvent): IPoint => ({ x: event.clientX, y: event.clientY })),
    share()
  );
  public readonly mouseClick$: Observable<boolean> = merge(this.mousedown$, this.mouseup$)
    .pipe(
      map((event: MouseEvent): boolean => event.type === "mousedown"),
      share());

  keyboardClick$(): Observable<IPoint> {
    const keyMap: Map<string, IPoint> = new Map([
      [ "w", { x: 0, y: -1 } ],
      [ "a", { x: -1, y: 0 } ],
      [ "s", { x: 0, y: 1 } ],
      [ "d", { x: 1, y: 0 } ],
      [ "ц", { x: 0, y: -1 } ],
      [ "ф", { x: -1, y: 0 } ],
      [ "ы", { x: 0, y: 1 } ],
      [ "в", { x: 1, y: 0 } ],
    ]);

    return this.keys$.pipe(
      scan((activeKeys: Set<string>, event: KeyboardEvent) => {
        const key = event.key.toString().toLowerCase();
        if (event.type === "keydown") {
          activeKeys.add(key);
        } else if (event.type === "keyup") {
          activeKeys.delete(key);
        }

        return activeKeys;
      }, new Set<string>()),
      map((keys: Set<string>) => {
        return Array.from(keys)
          .map((key: string) => keyMap.get(key))
          .reduce((acc: IPoint, curr: IPoint | undefined) => {
              if (curr) {
                acc.x += curr.x;
                acc.y += curr.y;
              }
              return acc;
            },
            { ...{ x: 0, y: 0 } },
          );
      }),
      share(),
    );
  }
}
