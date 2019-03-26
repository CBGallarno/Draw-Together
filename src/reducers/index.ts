import { combineReducers } from 'redux'
import AuthReducer from "./auth";
import GameReducer from "./game";

export const rootReducer = combineReducers({
  auth: AuthReducer,
  game: GameReducer
})

export type AppState = ReturnType<typeof rootReducer>