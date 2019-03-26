export const CREATE_GAME = 'CREATE_GAME'
export const UPDATE_GAME = 'UPDATE_GAME'
export const SET_USERS = 'SET_USERS'

export interface CreateGameAction {
  type: typeof CREATE_GAME
  gameId: string
  host: string
}

export interface UpdateGameAction {
  type: typeof UPDATE_GAME
  gameData: any
}

export interface SetUsersAction {
  type: typeof SET_USERS
  userData: any
}

export type GameActionTypes = CreateGameAction | UpdateGameAction | SetUsersAction

export const createGame = (gameId: string, host: string) : CreateGameAction => {
  return {
    type: CREATE_GAME,
    gameId,
    host
  }
}

export const updateGame = (gameData: any) : UpdateGameAction => {
  return {
    type: UPDATE_GAME,
    gameData
  }
}

export const setUsers = (userData: any) : SetUsersAction=> {
  return {
    type: SET_USERS,
    userData
  }
}