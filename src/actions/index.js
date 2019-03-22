export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';

export const login = (userId) => ({
  type: LOGIN,
  userId
});

export const logout = () => ({
  type: LOGOUT
});