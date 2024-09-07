export type PlayerStatus = 'ready' | 'notready';
export type Player = {
    username: string;
    id: string;
    status: PlayerStatus;
}
export type PlayerStatusChange = {
    user_id: string;
    status: PlayerStatus;
}