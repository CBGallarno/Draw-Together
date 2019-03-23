export const CREATE_GAME = 'CREATE_GAME'
export const UPDATE_GAME = 'UPDATE_GAME'

export const createGame = (gameId, host) => {
  return {
    type: CREATE_GAME,
    gameId,
    host
  }
}

export const updateGame = (gameData) => {
  return {
    type: UPDATE_GAME,
    gameData
  }
}