import {CREATE_GAME, UPDATE_GAME, SET_USERS} from "@/actions/game";
import {GameState, UsersState} from "@/types/Redux";
import {CreateGameAction, GameActionTypes, SetUsersAction, UpdateGameAction} from "@/actions/game";

const initialSate = {
  gameId: '',
  host: '',
  users: {}
};

export function GameReducer(state: GameState = initialSate, action: GameActionTypes) : GameState {
  switch (action.type) {
    case CREATE_GAME:
      action = action as CreateGameAction
      return {
        gameId: action.gameId,
        host: action.host,
        users: {}
      }
    case UPDATE_GAME:
      action = action as UpdateGameAction
      // Should parse/validate received data instead of just writing directly
      return Object.assign({}, state, action.gameData)
    case SET_USERS:
      action = action as SetUsersAction
      return Object.assign({}, state, {users: UsersReducer(state.users, action)})
    default:
      return state
  }
}

function UsersReducer(state: UsersState = {}, action: SetUsersAction): UsersState {
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

export default GameReducer