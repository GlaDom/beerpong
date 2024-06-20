import { createReducer, on } from "@ngrx/store";
import { BeerpongState, Status } from "./game.state";
import { createGame, createGameSuccess, finishGame, finishGameSuccess, loadGame, loadGameFailure, loadGameSuccess, updateMatch, updateMatchSuccess, updateMatchesFinalFailure, updateMatchesQuaterFinalsFailure, updateMatchesRoundOfSixteenFailure, updateMatchesSemiFinalsFailure, updateTeams, updateTeamsSuccess } from "./beerpong.actions";
import { group } from "console";

export const initialState: BeerpongState = {
    groups: [],
    matches: [],
    toastStatus: 'notset'
}

export const beerpongReducer = createReducer(initialState,
    on(createGame, state => {
        return state
    }),
    on(createGameSuccess, (state, {game}) => {
        return {
            ...state,
            matches: game.matches,
            groups: game.groups
        }
    }),
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
    on(loadGameFailure, (state) => {
        let initalGameState: BeerpongState = {
            matches: [],
            groups: [],
            toastStatus: 'notset'
        }
        state = initalGameState
        console.log('reducer called')
        return state
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
        let newToastState: Status = 'success match updated'
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
    }),
    on(updateMatchesRoundOfSixteenFailure, (state) => {
        let newToastState: Status = 'failed update round of 16'
        return {
            ...state,
            toastStatus: newToastState
        }
    }),
    on(updateMatchesQuaterFinalsFailure, (state) => {
        let newToastState: Status = 'failed update quater finals'
        return {
            ...state,
            toastStatus: newToastState
        }
    }),
    on(updateMatchesSemiFinalsFailure, (state) => {
        let newToastState: Status = 'failed update semi finals'
        return {
            ...state,
            toastStatus: newToastState
        }
    }),
    on(updateMatchesFinalFailure, (state) => {
        let newToastState: Status = 'failed update final'
        return {
            ...state,
            toastStatus: newToastState
        }
    }),
    on(finishGame, (state) => {
        return state
    }),
    on(finishGameSuccess, (state) => {
        let initalGameState: BeerpongState = {
            matches: [],
            groups: [],
            toastStatus: 'notset'
        }
        state = initalGameState
        return state
    })
);
