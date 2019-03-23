import {CREATE_GAME, UPDATE_GAME} from "actions/game";

const initialSate = {};

const game = (state = initialSate, action) => {
  switch (action.type) {
    case CREATE_GAME:
      return {
        gameId: action.gameId,
        host: action.host
      }
    case UPDATE_GAME:
      // Should parse/validate received data instead of just writing directly
      return Object.assign({}, state, action.gameData)
    default:
      return state
  }
};

export default game