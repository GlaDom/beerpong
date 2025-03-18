import { User } from "@auth0/auth0-angular";
import { createAction, props } from "@ngrx/store";

//LOGIN_USER
export const setUser = createAction('[Login Component] Set User', props<{user: User}>())