import {LOGIN, LOGOUT} from "actions";

const initialSate = {
  signedIn: false,
  userId: ""
};

const auth = (state = initialSate, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        signedIn: true,
        userId: action.userId
      };
    case LOGOUT:
      return initialSate;
    default:
      return state
  }
};

export default auth