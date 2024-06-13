//Actions needed

import { createAction, props } from "@ngrx/store";
import { BeerpongGame } from "./game.state";
import Match from "../api/match.interface";

//LOAD_GAME
export const loadGame = createAction('[App Component] Load Game')
export const loadGameSuccess = createAction('[App Component] Load Game Succes', props<{game: BeerpongGame}>())
//UPDATE_GAME (FINISH_GAME)
export const updateGame = createAction('[TODO] Update Game')
//UPDATE_MATCH
export const updateMatch = createAction('[GamePlan Component] Update Match', props<{match: Match}>())
export const updateMatchSuccess = createAction('[GamePlan Component] Update Match Success', props<{match: Match}>())