import {CREATE_GAME, UPDATE_GAME, SET_USERS} from "actions/game";

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
    case SET_USERS:
      return Object.assign({}, state, {users: users(state.users, action)})
    default:
      return state
  }
};

const users = (state = {}, action) => {
  switch (action.type) {
    case SET_USERS:
      if (action.userData) {
        return action.userData
      } else {
        return state
      }
    default:
      return state
  }
}

export default game