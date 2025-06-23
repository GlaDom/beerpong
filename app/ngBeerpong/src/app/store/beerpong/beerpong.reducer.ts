import { createReducer, on } from "@ngrx/store";
import { BeerpongState, Status } from "./game.state";
import { createGame, createGameSuccess, finishGame, finishGameFailure, finishGameSuccess, loadGame, loadGameFailure, loadGameSuccess, loadLastGameSuccess, setShowRanking, setToastStatus, updateMatch, updateMatchSuccess, updateMatchesFinalFailure, updateMatchesQuaterFinalsFailure, updateMatchesRoundOfSixteenFailure, updateMatchesSemiFinalsFailure, updateTeams, updateTeamsSuccess } from "./beerpong.actions";
import { group } from "console";
import { AppState } from "@auth0/auth0-angular";
import { GameState } from "../../models/game-state.model";

export const initialState: BeerpongState = {
    lastGame: {
        game: {
            user_sub: "",
            amount_of_teams: 0,
            is_finished: false,
            game_time: 0,
            referee: [],
            groups: [],
            got_ko_stage: false,
            got_stage_in_between: false,
            number_of_qualified_teams: 0,
            include_third_place_match: false,
            start_time: ""
        },
        groups: [],
        matches: []
    },
    currentGame: {
        game: {
            user_sub: "",
            amount_of_teams: 0,
            is_finished: false,
            game_time: 0,
            referee: [],
            groups: [],
            got_ko_stage: false,
            got_stage_in_between: false,
            number_of_qualified_teams: 0,
            include_third_place_match: false,
            start_time: ""
        },
        groups: [],
        matches: []
    },
    toastStatus: 'notset',
    isLoading: false,
    showRanking: false
}

export const beerpongReducer = createReducer(initialState,
    on(createGame, state => {
        return state
    }),
    on(createGameSuccess, (state, {game}): BeerpongState => {
        return {
            ...state,
            currentGame: game
        }
    }),
    on(loadGame, state => {
        return state
    }),
    on(loadGameSuccess, (state, {game}): BeerpongState => {
        let newToastState: Status = 'notset'
        return {
            ...state,
            currentGame: game,
            toastStatus: newToastState,
            isLoading: false,
            showRanking: false
        }
    }),
    on(loadGameFailure, (state) => {
        let initalGameState: BeerpongState = {
            lastGame: {
                game: {
                    user_sub: "",
                    amount_of_teams: 0,
                    is_finished: false,
                    game_time: 0,
                    referee: [],
                    groups: [],
                    got_ko_stage: false,
                    got_stage_in_between: false,
                    number_of_qualified_teams: 0,
                    include_third_place_match: false,
                    start_time: ""
                },
                groups: [],
                matches: []
            },
            currentGame: {
                game: {
                    user_sub: "",
                    amount_of_teams: 0,
                    is_finished: false,
                    game_time: 0,
                    referee: [],
                    groups: [],
                    got_ko_stage: false,
                    got_stage_in_between: false,
                    number_of_qualified_teams: 0,
                    include_third_place_match: false,
                    start_time: ""
                },
                groups: [],
                matches: []
            },
            toastStatus: 'notset',
            isLoading: false,
            showRanking: false,
        }
        state = initalGameState
        return {
            ...state,
            showRanking: false,
            toastStatus: initalGameState.toastStatus,
            isLoading: false
        }
    }),
        on(loadLastGameSuccess, (state, {game}): BeerpongState => {
        let newToastState: Status = 'notset'
        return {
            ...state,
            lastGame: game,
            toastStatus: newToastState,
            isLoading: false,
            showRanking: false
        }
    }),
    on(updateMatch, state => {
        return state
    }),
    on(updateMatchSuccess, (state, {match}) => {
        let matches = state.currentGame.matches.map(m => Object.assign({} , m))
        matches.map(m => {
            // console.log(m)
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
        let groups = state.currentGame.groups.map(m => Object.assign({}, m))
        //search for correct group
        let group = groups.filter(g => g.group_name==teams[0].group_name)
        //exclude old teams form group
        let oldTeams = group[0].teams.filter(t => t.id!=teams[0].id && t.id!=teams[1].id)
        //add new teams
        oldTeams.push(...teams)
        //sort teams by points and cup difference
        oldTeams.sort((a, b) => {
            if (a.points === b.points) {
                if(b.cup_difference && a.cup_difference){
                    return b.cup_difference - a.cup_difference;
                }
            }
            return b.points - a.points;
        });
        //assign new teams to group
        group[0].teams = oldTeams
        //add updated group to groups
        let oldGroups = groups.filter(g => g.group_name!=teams[0].group_name)
        oldGroups.push(group[0])
        oldGroups.sort((a, b) => {
            if (a.group_name < b.group_name) {
                return -1;
            }
            if (a.group_name > b.group_name) {
                return 1;
            }
            return 0;
        });
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
        let newToastState: Status = "success game finished"
        return {
            ...state,
            toastStatus: newToastState,
            isLoading: false
        }
    }),
    on(finishGameFailure, (state) => {
        let newToastState: Status = "failed game finished"
        return {
            ...state,
            toastStatus: newToastState
        }
    }),
    on(setShowRanking, (state, {showRanking}) => {
        return {
            ...state,
            showRanking: showRanking
        }
    }),
    on(setToastStatus, (state, {toastStatus}) => {
        return {
            ...state,
            toastStatus: toastStatus
        }
    })
);
