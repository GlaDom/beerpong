//Actions needed

import { createAction, props } from "@ngrx/store";
import { BeerpongState } from "./game.state";
import Match from "../../api/match.interface";
import Team from "../../api/team.interface";
import TeamUpdate from "../../api/team-update.interface";
import Game from "../../api/game.interface";
import { GameRequest } from "../../api/game-request";


//CREATE_GAME
export const createGame = createAction('[Admin-space Component] Create Game', props<{game: GameRequest}>())
export const createGameSuccess = createAction('[Admin-space Component] Create Game Success', props<{game: BeerpongState}>())
//LOAD_GAME
export const loadGame = createAction('[App Component] Load Game')
export const loadGameSuccess = createAction('[App Component] Load Game Succes', props<{game: BeerpongState}>())
export const loadGameFailure = createAction('[App Component] Load Game Failure')
//UPDATE_GAME (FINISH_GAME)
export const updateGame = createAction('[TODO] Update Game')
//UPDATE_MATCH
export const updateMatch = createAction('[GamePlan Component] Update Match', props<{match: Match}>())
export const updateMatchSuccess = createAction('[GamePlan Component] Update Match Success', props<{match: Match}>())

export const updateMatchesRoundOfSixteen = createAction('[Admin-space Component] Update Matches Round Of Sixteen', props<{gameId: number}>())
export const updateMatchesRoundOfSixteenSuccess = createAction('[Admin-space Component] Update Matches Round Of Sixteen Success')
export const updateMatchesRoundOfSixteenFailure = createAction('[Admin-space Component] Update Matches Round Of Sixteen Failure')

export const updateMatchesQuaterFinals = createAction('[Admin-space Component] Update Matches Quater Finals', props<{gameId: number}>())
export const updateMatchesQuaterFinalsSuccess = createAction('[Admin-space Component] Update Matches Quater Finals Success')
export const updateMatchesQuaterFinalsFailure = createAction('[Admin-space Component] Update Matches Quater Finals Failure')

export const updateMatchesSemiFinals = createAction('[Admin-space Component] Update Matches Semi Finals', props<{gameId: number}>())
export const updateMatchesSemiFinalsSuccess = createAction('[Admin-space Component] Update Matches Semi Finals Success')
export const updateMatchesSemiFinalsFailure = createAction('[Admin-space Component] Update Matches Semi Finals Failure')

export const updateMatchesFinal = createAction('[Admin-space Component] Update Matches Final', props<{gameId: number, gameMode: number}>())
export const updateMatchesFinalSuccess = createAction('[Admin-space Component] Update Matches Final Success')
export const updateMatchesFinalFailure = createAction('[Admin-space Component] Update Matches Final Failure')
//UPDATE_TEAMS
export const updateTeams = createAction('[Admin-space Component] Update Teams', props<{teams: TeamUpdate[]}>())
export const updateTeamsSuccess = createAction('[Admin-space Component] Update Teams Success', props<{teams: Team[]}>())
//FINISH_GAME
export const finishGame = createAction('[Admin-space Component] Finish Game', props<{gameId: number}>())
export const finishGameSuccess = createAction('[Admin-space Component] Finish Game Success')
export const finishGameFailure = createAction('[Admin-space Component] Finish Game Failure')

//SET_SHOWRANKING
export const setShowRanking = createAction('[Admin-space Component] Set Show Ranking', props<{showRanking: boolean}>())