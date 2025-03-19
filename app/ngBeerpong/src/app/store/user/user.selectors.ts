import { createFeatureSelector } from "@ngrx/store";
import { UserState } from "./user.state";

export const selectUserState = createFeatureSelector<UserState>('userState');