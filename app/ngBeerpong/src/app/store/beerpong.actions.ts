//Actions needed

import { createAction, props } from "@ngrx/store";
import { BeerpongGame } from "./game.state";
import Match from "../api/match.interface";
import Team from "../api/team.interface";
import TeamUpdate from "../api/team-update.interface";
import Game from "../api/game.interface";
import { GameRequest } from "../api/game-request";


//CREATE_GAME
export const createGame = createAction('[Admin-space Component] Create Game', props<{game: GameRequest}>())
export const createGameSuccess = createAction('[Admin-space Component] Create Game Success', props<{game: BeerpongGame}>())
//LOAD_GAME
export const loadGame = createAction('[App Component] Load Game')
export const loadGameSuccess = createAction('[App Component] Load Game Succes', props<{game: BeerpongGame}>())
export const loadGameFailure = createAction('[App Component] Load Game Failure')
//UPDATE_GAME (FINISH_GAME)
export const updateGame = createAction('[TODO] Update Game')
//UPDATE_MATCH
export const updateMatch = createAction('[GamePlan Component] Update Match', props<{match: Match}>())
export const updateMatchSuccess = createAction('[GamePlan Component] Update Match Success', props<{match: Match}>())
//UPDATE_TEAMS
export const updateTeams = createAction('[Admin-space Component] Update Teams', props<{teams: TeamUpdate[]}>())
export const updateTeamsSuccess = createAction('[Admin-space Component] Update Teams Success', props<{teams: Team[]}>())
//FINISH_GAME
export const finishGame = createAction('[Admin-space Component] Finish Game', props<{gameId: number}>())
export const finishGameSuccess = createAction('[Admin-space Component] Finish Game Success')