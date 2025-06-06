import { createFeature, createFeatureSelector, createSelector } from "@ngrx/store";
import { BeerpongState } from "./game.state";

export const selectBeerpongState = createFeatureSelector<BeerpongState>('beerpongState');

export const selectCurrentGame = (state: BeerpongState) => state.currentGame;

// export const selectLastGame = (state: BeerpongState) => state.lastGame;
export const selectLastGame = createSelector(
  selectBeerpongState,
  (state: BeerpongState) => state.lastGame
);