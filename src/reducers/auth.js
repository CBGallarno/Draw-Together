import {LOGIN, LOGOUT, UPDATE_USERNAME} from "actions";

const initialSate = {
  signedIn: false,
  userId: undefined,
  userName: undefined,
  userEmail: undefined
};

const auth = (state = initialSate, action) => {
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
};

export default auth