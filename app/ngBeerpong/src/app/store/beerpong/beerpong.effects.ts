import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { ConfigurationService } from "../../services/configuration.service";
import { EMPTY, Observable, catchError, exhaustMap, map, of, startWith, switchMap } from "rxjs";
import { BeerpongState } from "./game.state";
import { Store } from "@ngrx/store";
import Match from "../../api/match.interface";
import { MatchRequest } from "../../api/match-request";

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

    createGameSuccess$ = createEffect(() => this.actions$.pipe(
        ofType('[Admin-space Component] Create Game Success'),
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

    loadLastGame$ = createEffect(() => this.actions$.pipe(
        ofType('[Home Component] Load Last Game'),
        switchMap(() => this.configService.GetLastGame("")
            .pipe(
                map(game => {
                    return ({type: '[Home Component] Load Last Game Succes', game})}),
                catchError((error, source) => {
                    console.log(error, 'error load game')
                    return of({type: '[Home Component] Load Last Game Failure'})
                })
            ))
        )
    )


    updateMatch$ = createEffect(() => this.actions$.pipe(
        ofType('[GamePlan Component] Update Match'),
        exhaustMap((req: MatchRequest) => this.configService.UpdateMatch(req.match)
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

    updateMatchesRoundOfSixteen = createEffect(() => this.actions$.pipe(
        ofType('[Admin-space Component] Update Matches Round Of Sixteen'),
        switchMap((gameId: any) => this.configService.UpdateMatchesRoundOfSixteen(gameId.gameId)
            .pipe(
                map(() => {
                    return ({type: '[Admin-space Component] Update Matches Round Of Sixteen Success'})
                }),
                catchError(() => {
                    console.log('error updating round of sixteen')
                    return of({type: '[Admin-space Component] Update Matches Round Of Sixteen Failure'})
                })
            ))
    ))

    updateMatchesRoundOfSixteenSuccess = createEffect(() => this.actions$.pipe(
        ofType('[Admin-space Component] Update Matches Round of Sixteen Success'),
        map(() => ({type: "[App Component] Load Game"}))
    ))

    updateMatchesQuaterfinals = createEffect(() => this.actions$.pipe(
        ofType('[Admin-space Component] Update Matches Quater Finals'),
        switchMap((gameId: any) => this.configService.UpdateMatchesQuaterfinals(gameId.gameId)
            .pipe(
                map(() => {
                    return ({type: '[Admin-space Component] Update Matches Quater Finals Success'})
                }),
                catchError(() => {
                    console.log('error updating round of sixteen')
                    return of({type: '[Admin-space Component] Update Matches Quater Finals Failure'})
                })
            ))
    ))

    updateMatchesSemifinals = createEffect(() => this.actions$.pipe(
        ofType('[Admin-space Component] Update Matches Semi Finals'),
        switchMap((gameId: any) => this.configService.UpdateMatchesSemifinals(gameId.gameId)
            .pipe(
                map(() => {
                    return ({type: '[Admin-space Component] Update Matches Semi Finals Success'})
                }),
                catchError(() => {
                    console.log('error updating round of sixteen')
                    return of({type: '[Admin-space Component] Update Matches Semi Finals Failure'})
                })
            ))
    ))

    updateMatchesFinal = createEffect(() => this.actions$.pipe(
        ofType('[Admin-space Component] Update Matches Final'),
        switchMap((payload: any) => this.configService.UpdateMatchesFinal(payload.gameId, payload.gameMode)
            .pipe(
                map(() => {
                    return ({type: '[Admin-space Component] Update Matches Final Success'})
                }),
                catchError(() => {
                    console.log('error updating round of sixteen')
                    return of({type: '[Admin-space Component] Update Matches Final Failure'})
                })
            ))
    ))

    updateMatchesFinalSuccess = createEffect(() => this.actions$.pipe(
        ofType('[Admin-space Component] Update Matches Final Success'),
        map(() => ({type: "[App Component] Load Game"}))
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

    finishGameSuccess$ = createEffect(() => this.actions$.pipe(
        ofType('[Admin-space Component] Finish Game Success'),
        map(() => ({type: "[App Component] Load Game"}))
    ))

    constructor(
        private actions$: Actions,
        private configService: ConfigurationService,
        private beerpongstore: Store<BeerpongState>
    ) {}
}