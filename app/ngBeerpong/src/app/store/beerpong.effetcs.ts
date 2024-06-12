import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { ConfigurationService } from "../services/configuration.service";
import { EMPTY, catchError, exhaustMap, map } from "rxjs";
import { BeerpongGame } from "./game.state";

@Injectable()
export class BeerpongEffects {

    loadGame$ = createEffect(() => this.actions$.pipe(
        ofType('[App Component] Load Game'),
        exhaustMap(() => this.configService.GetGame("")
            .pipe(
                map(game => {
                    console.log(game)
                    return ({type: '[App Component] Load Game Succes', game})}),
                catchError(() => {
                    console.log('error')
                    return EMPTY
                })
            ))
        )
    )

    constructor(
        private actions$: Actions,
        private configService: ConfigurationService,
    ) {}
}