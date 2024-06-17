import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { ConfigurationService } from "../services/configuration.service";
import { EMPTY, Observable, catchError, exhaustMap, map, of, startWith, switchMap } from "rxjs";

@Injectable()
export class BeerpongEffects {

    createGame$ = createEffect(() => this.actions$.pipe(
        ofType('[Admin-space Component] Create Game'),
        switchMap((game: any) => this.configService.CreateGame(game.game)
            .pipe(
                map((game) => {
                    return ({type: '[Admin-space Component] Create Game Success', game})
                }),
                catchError((error) => {
                    console.log(error, "error create game")
                    return EMPTY
                })
            ))
    ))

    loadGame$ = createEffect(() => this.actions$.pipe(
        ofType('[App Component] Load Game'),
        switchMap(() => this.configService.GetGame("")
            .pipe(
                map(game => {
                    return ({type: '[App Component] Load Game Succes', game})}),
                catchError((error, source) => {
                    console.log(error, 'error load game')
                    return of({type: '[App Component] Load Game Failure'})
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

    finishGame$ = createEffect(() => this.actions$.pipe(
        ofType('[Admin-space Component] Finish Game'),
        exhaustMap((gameId: any) => this.configService.FinishGame(gameId.gameId)
            .pipe(
                map(() => {
                    return ({type: '[Admin-space Component] Finish Game Success'})
                }),
                catchError(() => {
                    console.log('error finish game')
                    return EMPTY
                })
            ))
    ))

    constructor(
        private actions$: Actions,
        private configService: ConfigurationService,
    ) {}
}