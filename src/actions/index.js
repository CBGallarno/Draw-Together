export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';

export const login = (userId, userName, userEmail) => ({
  type: LOGIN,
  userId,
  userName,
  userEmail
});

export const logout = () => ({
  type: LOGOUT
});