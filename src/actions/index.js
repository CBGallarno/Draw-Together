export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const UPDATE_USERNAME = 'UPDATE_USERNAME'

export const login = (userId, userName, userEmail) => ({
  type: LOGIN,
  userId,
  userName,
  userEmail
});

export const updateUserName = (userName) => ({
  type: UPDATE_USERNAME,
  userName
})

export const logout = () => ({
  type: LOGOUT
});