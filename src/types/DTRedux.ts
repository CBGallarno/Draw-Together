import {Dispatch} from "redux";

export interface AuthState {
    signedIn: boolean
    userId: string
    userName: string
    userEmail: string
}

export interface UserState {
    displayName: string
    team: string
}

export interface UsersState {
    [uid: string]: UserState
}

export interface GameState {
    gameId: string
    host: string
    users: UsersState
    joinCode?: string
}

export interface Props {
    dispatch: Dispatch
}