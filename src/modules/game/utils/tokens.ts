import { InjectionToken } from "@angular/core";
import {Observable} from "rxjs";
import { SocketService } from "../services/socket.service";

export const CANVAS = new InjectionToken<HTMLCanvasElement>('Canvas');
export const CONTEXT = new InjectionToken<CanvasRenderingContext2D>('Context');
export const DELTA_TIME = new InjectionToken<Observable<number>>('Delta time');
