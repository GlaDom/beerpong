import { createReducer, on } from "@ngrx/store"
import { UserState } from "./user.state"
import { resetUser, setToken, setUser } from "./user.actions"

export const initialUserState: UserState = {
    userDetails: {},
    bearerToken: '',
    isLoggedIn: false,
}

export const userReducer = createReducer(initialUserState,
    on(setUser, (state, {userState}) => {
        return {
            ...state,
            userDetails: userState,
            isLoggedIn: true
        }
    }),
    on(resetUser, (state) => {
        return {
            ...state,
            userDetails: {},
            bearerToken: '',
            isLoggedIn: false
        }
    }),
    on(setToken, (state, {token }) => {
        return {
            ...state,
            bearerToken: token
        }
    })
)