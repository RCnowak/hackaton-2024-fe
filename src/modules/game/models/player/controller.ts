import { IPoint } from '@game/utils';
import { distinctUntilChanged, map,  NEVER, Observable, share, Subject } from 'rxjs';

export enum Direction {
    Up = 1,
    Left = 2,
    Right = 3,
    Down = 4
}

export type VoiceCommand = {
    type: 'command' | 'nocommand' | 'error',
    text?: string;
}

export abstract class AbstractController {
    protected directions$: Observable<Set<Direction>> = NEVER;
    protected voiceCommandTrigger$: Observable<boolean> = NEVER;

    abstract action$: Observable<boolean>;
    abstract voiceCommand$: Observable<VoiceCommand>;
    abstract moveDirection$: Observable<IPoint>;
    // abstract viewDirection$: Observable<IPoint>;

    protected initMoveDirection() {
        const directions: Map<Direction, IPoint> = new Map([
            [ Direction.Up, { x: 0, y: -1 } ],
            [ Direction.Left, { x: -1, y: 0 } ],
            [ Direction.Down, { x: 0, y: 1 } ],
            [ Direction.Right, { x: 1, y: 0 } ]
        ]);
        return this.directions$
            .pipe(
                map((keys: Set<Direction>) => {
                    return Array.from(keys)
                        .map((key: Direction) => directions.get(key))
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
            )
    }

    protected initVoiceCommand(actions?: string[]) {
        const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const GrammarList = (window as any).SpeechGrammarList || (window as any).webkitSpeechGrammarList;
        const result = new Subject<VoiceCommand>();

        const recognition = new Recognition();
        if (GrammarList && actions) {
            const speechRecognitionList = new GrammarList();
            const grammar = '#JSGF V1.0; grammar actions; public <actions> = ' + actions.join(' | ') + ' ;'
            speechRecognitionList.addFromString(grammar, 1);
            recognition.grammars = speechRecognitionList;
        }
        recognition.continuous = false;
        recognition.lang = 'ru-RU';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        this.voiceCommandTrigger$
            .pipe(distinctUntilChanged())
            .subscribe((trigger) => {
                if (trigger) {
                    recognition.abort();
                    recognition.start();
                } else {
                    recognition.stop()
                }
            });

        recognition.onresult = function (event: any) {
            result.next({
                type: 'command',
                text: event.results[0][0].transcript
            });
        };

        recognition.onspeechend = function () {
            recognition.stop();
        };

        recognition.onnomatch = function () {
            result.next({type: 'nocommand'});
        };

        recognition.onerror = function () {
            result.next({type: 'error'});
        };

        return result;
    }
}
