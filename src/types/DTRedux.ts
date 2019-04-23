import {Dispatch} from "redux";

export interface AuthState {
    signedIn: boolean
    isAnonymous: boolean
    userId: string
    userName: string
    userEmail: string
}

export interface UserState {
    displayName: string
    team: string
    score: number
}

export interface UsersState {
    [uid: string]: UserState
}

export interface GameState {
    gameId: string
    host: string
    users: UsersState
    joinCode?: string
    currentRound?: string
    lobby: boolean
    finished: boolean
}

export interface RoundState {
    drawer: string
    round: number
    word: string
}

export interface Props {
    dispatch: Dispatch
}