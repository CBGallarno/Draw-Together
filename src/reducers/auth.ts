import {LOGIN, LOGOUT, UPDATE_USERNAME, AuthActions} from "@/actions";
import {AuthState} from "@/types/Redux";

const initialSate = {
  signedIn: false,
  userId: '',
  userName: '',
  userEmail: ''
};

export function AuthReducer(state : AuthState = initialSate, action: AuthActions): AuthState {
  switch (action.type) {
    case UPDATE_USERNAME:
      return Object.assign({}, state, {userName: action.userName})
    case LOGIN:
      return {
        signedIn: true,
        userId: action.userId,
        userName: action.userName,
        userEmail: action.userEmail
      };
    case LOGOUT:
      return initialSate;
    default:
      return state
  }
}

export default AuthReducer