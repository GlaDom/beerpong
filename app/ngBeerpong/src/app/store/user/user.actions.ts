import { User } from "@auth0/auth0-angular";
import { createAction, props } from "@ngrx/store";

//LOGIN_USER
export const setUser = createAction('[Login Component] Set User', props<{userState: User}>())
export const setToken = createAction('[Login Component] Set Token', props<{token: string}>())

//LOGOUT_USER
export const resetUser = createAction('[Header Component] Reset User')