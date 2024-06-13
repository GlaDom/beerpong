import { createReducer, on } from "@ngrx/store";
import { BeerpongGame } from "./game.state";
import { loadGame, loadGameSuccess, updateMatch, updateMatchSuccess } from "./beerpong.actions";

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
    }),
    on(updateMatchSuccess, (state, {match}) => {
        console.log(match)
        let matches = state.matches.map(m => Object.assign({} , m))
        matches.map(m => {
            if(m.home_team==match.home_team && m.away_team == match.away_team) {
                m.points_home = match.points_home
                m.points_away = match.points_away
            }
        })
        return {
            ...state,
            matches: matches
        }
    })
);
