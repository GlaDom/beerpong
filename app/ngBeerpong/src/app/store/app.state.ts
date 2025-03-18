import { initialState } from "./beerpong/beerpong.reducer";
import { BeerpongState } from "./beerpong/game.state";
import { UserState } from "./user/user.state";

export const initalAppState: AppState = {
    user: {
        userDetails: {},
        bearerToken: '',
        isLoggedIn: false
    },
    beerpongState: initialState
}

export interface AppState {
    user: UserState;
    beerpongState: BeerpongState;
}