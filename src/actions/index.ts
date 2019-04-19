export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const UPDATE_USERNAME = 'UPDATE_USERNAME'

export interface LoginAction {
    type: typeof LOGIN
    userId: string
    userName: string
    userEmail: string
    isAnonymous: boolean
}

export interface UpdateUserNameAction {
    type: typeof UPDATE_USERNAME
    userName: string
}

export interface LogoutAction {
    type: typeof LOGOUT
}

export type AuthActions = LoginAction | LogoutAction | UpdateUserNameAction

export const login = (userId: string, userName: string, userEmail: string, isAnonymous: boolean): LoginAction => ({
    type: LOGIN,
    userId,
    userName,
    userEmail,
    isAnonymous
});

export const updateUserName = (userName: string): UpdateUserNameAction => ({
    type: UPDATE_USERNAME,
    userName
})

export const logout = (): LogoutAction => ({
    type: LOGOUT
});