import { createFeature, createFeatureSelector } from "@ngrx/store";
import { BeerpongState } from "./game.state";

export const selectBeerpongState = createFeatureSelector<BeerpongState>('beerpongState');

export const selectGame = (state: BeerpongState) => state;