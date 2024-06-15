import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { ConfigurationService } from "../services/configuration.service";
import { EMPTY, catchError, exhaustMap, map } from "rxjs";
import { BeerpongGame, Status } from "./game.state";

@Injectable()
export class BeerpongEffects {

    loadGame$ = createEffect(() => this.actions$.pipe(
        ofType('[App Component] Load Game'),
        exhaustMap(() => this.configService.GetGame("")
            .pipe(
                map(game => {
                    return ({type: '[App Component] Load Game Succes', game})}),
                catchError(() => {
                    console.log('error load game')
                    return EMPTY
                })
            ))
        )
    )

    updateMatch$ = createEffect(() => this.actions$.pipe(
        ofType('[GamePlan Component] Update Match'),
        exhaustMap((match: any) => this.configService.UpdateMatch(match.match)
            .pipe(
                map(match => {
                    return ({type: '[GamePlan Component] Update Match Success', match})
                }),
                catchError(() => {
                    console.log('error update match')
                    return EMPTY
                })
            ))
    ))

    updateTeams$ = createEffect(() => this.actions$.pipe(
        ofType('[Admin-space Component] Update Teams'),
        exhaustMap((teams: any) => this.configService.UpdateTeams(teams.teams)
            .pipe(
                map(teams => {
                    return ({type: '[Admin-space Component] Update Teams Success', teams})
                }),
                catchError(() => {
                    console.log('error update teams')
                    return EMPTY
                })
            ))
    ))

    constructor(
        private actions$: Actions,
        private configService: ConfigurationService,
    ) {}
}