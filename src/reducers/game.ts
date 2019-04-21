import {
    CREATE_GAME,
    CreateGameAction,
    GameActionTypes, JOIN_GAME, JoinGameAction,
    SET_USERS,
    SetUsersAction,
    UPDATE_GAME,
    UpdateGameAction
} from "@/actions/game";
import {GameState, UsersState} from "@/types/DTRedux";

const initialSate = {
    gameId: '',
    host: '',
    users: {},
    lobby: false,
    finished: false
};

export function GameReducer(state: GameState = initialSate, action: GameActionTypes): GameState {
    switch (action.type) {
        case CREATE_GAME:
            action = action as CreateGameAction
            return {
                gameId: action.gameId,
                host: action.host,
                users: {},
                lobby: false,
                finished: false
            }
        case JOIN_GAME:
            action = action as JoinGameAction
            return {
                gameId: action.gameId,
                host: action.host,
                users: {},
                lobby: true,
                finished: false
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