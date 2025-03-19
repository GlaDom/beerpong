import { createReducer, on } from "@ngrx/store"
import { UserState } from "./user.state"
import { setUser } from "./user.actions"

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
            bearerToken: 'test',
            isLoggedIn: true
        }
    }),
)