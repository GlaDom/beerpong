import { createReducer, on } from "@ngrx/store";
import { BeerpongGame, Status } from "./game.state";
import { loadGame, loadGameSuccess, updateMatch, updateMatchSuccess, updateTeams, updateTeamsSuccess } from "./beerpong.actions";

export const initialState: BeerpongGame = {
    groups: [],
    matches: [],
    toastStatus: 'notset'
}

export const beerpongReducer = createReducer(initialState,
    on(loadGame, state => {
        return state
    }),
    on(loadGameSuccess, (state, {game}) => {
        let newToastState: Status = 'notset'
        return {
            groups: game.groups,
            matches: game.matches,
            toastStatus: newToastState,
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
        let newToastState: Status = 'success'
        return {
            ...state,
            matches: matches,
            toastStatus: newToastState
        }
    }),
    on(updateTeams, (state) => {
        return state
    }),
    on(updateTeamsSuccess, (state, {teams}) => {
        console.log(teams)
        let groups = state.groups.map(m => Object.assign({}, m))
        //search for correct group
        let group = groups.filter(g => g.group_name==teams[0].group_name)
        //exclude old teams form group
        console.log(teams[0], group[0])
        let oldTeams = group[0].teams.filter(t => t.id!=teams[0].id && t.id!=teams[1].id)
        //add new teams
        oldTeams.push(...teams)
        //assign new teams to group
        group[0].teams = oldTeams
        //add updated group to groups
        let oldGroups = groups.filter(g => g.group_name!=teams[0].group_name)
        oldGroups.push(group[0])
        //reset toastState because otherwise there would be two successfull toasts on admin-space component
        let newToastState: Status = 'notset'
        return {
            ...state,
            groups: oldGroups,
            toastStatus: newToastState
        }
    })
);
