import { createReducer, on } from "@ngrx/store";
import { BeerpongGame } from "./game.state";
import { loadGame, loadGameSuccess, updateMatch } from "./beerpong.actions";

export const initialState: BeerpongGame = {
    groups: [],
    matches: []
}

export const beerpongReducer = createReducer(initialState,
    on(loadGame, state => {
        return state
    }),
    on(loadGameSuccess, (state, {game}) => {
        return {
            groups: game.groups,
            matches: game.matches
        }
    }),
    on(updateMatch, state => {
        console.log(state)
        return state
    })
);
