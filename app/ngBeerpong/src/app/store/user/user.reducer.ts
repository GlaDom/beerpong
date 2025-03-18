import { createReducer, on } from "@ngrx/store"
import { UserState } from "./user.state"
import { setUser } from "./user.actions"

export const initialUserState: UserState = {
    userDetails: {},
    bearerToken: '',
    isLoggedIn: false,
}

export const userReducer = createReducer(initialUserState,
    on(setUser, (state, {user}) => {
        return {
            ...state,
            userDetails: user,
            bearerToken: 'test',
            isLoggedIn: true
        }
    }),
)