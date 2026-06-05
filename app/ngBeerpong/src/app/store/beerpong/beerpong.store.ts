import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { ConfigurationService } from '../../services/configuration.service';
import { GameModes } from '../../api/game-modes.enum';
import { GameState } from '../../models/game-state.model';
import { Match } from '../../api/match.interface';
import { Team } from '../../api/team.interface';
import { TeamUpdate } from '../../api/team-update.interface';
import { NewTournament } from '../../api/game-request';

export type Status =
  | 'notset'
  | 'success match updated'
  | 'failed match updated'
  | 'success update round of 16'
  | 'failed update round of 16'
  | 'success update quater finals'
  | 'failed update quater finals'
  | 'success update semi finals'
  | 'failed update semi finals'
  | 'success update final'
  | 'failed update final'
  | 'success game finished'
  | 'failed game finished'
  | 'invalid match result'
  | undefined;

const emptyTournament = {
  user_sub: '',
  mode: GameModes.GROUP,
  amount_of_teams: 0,
  is_finished: false,
  game_time: 0,
  referee: [],
  groups: [],
  got_ko_stage: false,
  got_stage_in_between: false,
  number_of_qualified_teams: 0,
  include_third_place_match: false,
  start_time: '',
  matches: [],
};

const emptyGameState: GameState = { tournament: emptyTournament };

export interface BeerpongState {
  lastGame: GameState;
  currentGame: GameState;
  toastStatus: Status;
  isLoading: boolean;
  showRanking: boolean;
}

const initialState: BeerpongState = {
  lastGame: emptyGameState,
  currentGame: emptyGameState,
  toastStatus: 'notset',
  isLoading: false,
  showRanking: false,
};

export const BeerpongStore = signalStore(
  { providedIn: 'root' },
  withState<BeerpongState>(initialState),

  withComputed((store) => ({
    matches: computed(() => store.currentGame().tournament.matches ?? []),
    groups: computed(() => store.currentGame().tournament.groups),
    gameId: computed(() => store.currentGame().tournament.groups[0]?.tournament_id),
    tournamentMode: computed(() => store.currentGame().tournament.mode),
    isFinished: computed(() => store.currentGame().tournament.is_finished),
  })),

  withMethods((store, configService = inject(ConfigurationService)) => ({

    setToastStatus(toastStatus: Status): void {
      patchState(store, { toastStatus });
    },

    setShowRanking(showRanking: boolean): void {
      patchState(store, { showRanking });
    },

    async loadGame(): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const game = await firstValueFrom(configService.GetGame(''));
        patchState(store, {
          currentGame: game as unknown as GameState,
          toastStatus: 'notset',
          isLoading: false,
        });
      } catch {
        patchState(store, { ...initialState, isLoading: false });
      }
    },

    async loadLastGame(): Promise<void> {
      try {
        const game = await firstValueFrom(configService.GetLastGame(''));
        patchState(store, {
          lastGame: game,
          toastStatus: 'notset',
          isLoading: false,
          showRanking: false,
        });
      } catch {
        console.error('error load last game');
      }
    },

    async createGame(game: NewTournament): Promise<void> {
      try {
        await firstValueFrom(configService.CreateGame(game));
        const currentGame = await firstValueFrom(configService.GetGame(''));
        patchState(store, {
          currentGame: currentGame as unknown as GameState,
          toastStatus: 'notset',
          isLoading: false,
        });
      } catch (e) {
        console.error('error create game', e);
      }
    },

    async updateMatch(match: Match): Promise<void> {
      try {
        const updated = await firstValueFrom(configService.UpdateMatch(match));
        const matches = (store.currentGame().tournament.matches ?? []).map(m => {
          if (m.home_team === updated.home_team && m.away_team === updated.away_team) {
            return { ...m, points_home: updated.points_home, points_away: updated.points_away };
          }
          return m;
        });
        patchState(store, {
          currentGame: {
            ...store.currentGame(),
            tournament: { ...store.currentGame().tournament, matches },
          },
          toastStatus: 'success match updated',
        });
      } catch {
        patchState(store, { toastStatus: 'failed match updated' });
      }
    },

    async updateTeams(teams: TeamUpdate[]): Promise<void> {
      try {
        const updatedTeams = await firstValueFrom(configService.UpdateTeams(teams)) as unknown as Team[];
        const groups = store.currentGame().tournament.groups.map(g => ({ ...g }));
        const targetGroup = groups.find(g => g.group_name === updatedTeams[0]?.group_name);
        if (targetGroup) {
          const remaining = targetGroup.teams.filter(
            t => t.id !== updatedTeams[0]?.id && t.id !== updatedTeams[1]?.id
          );
          remaining.push(...updatedTeams);
          remaining.sort((a, b) => {
            if (a.points === b.points) {
              return (b.cup_difference ?? 0) - (a.cup_difference ?? 0);
            }
            return b.points - a.points;
          });
          targetGroup.teams = remaining;
        }
        groups.sort((a, b) => a.group_name.localeCompare(b.group_name));
        patchState(store, {
          currentGame: {
            ...store.currentGame(),
            tournament: { ...store.currentGame().tournament, groups },
          },
          toastStatus: 'notset',
        });
      } catch {
        console.error('error update teams');
      }
    },

    async updateRoundOfSixteen(gameId: number): Promise<void> {
      try {
        await firstValueFrom(configService.UpdateMatchesRoundOfSixteen(gameId));
        const game = await firstValueFrom(configService.GetGame(''));
        patchState(store, { currentGame: game as unknown as GameState, toastStatus: 'notset', isLoading: false });
      } catch {
        patchState(store, { toastStatus: 'failed update round of 16' });
      }
    },

    async updateQuaterFinals(gameId: number): Promise<void> {
      try {
        await firstValueFrom(configService.UpdateMatchesQuaterfinals(gameId));
        const game = await firstValueFrom(configService.GetGame(''));
        patchState(store, { currentGame: game as unknown as GameState, toastStatus: 'notset', isLoading: false });
      } catch {
        patchState(store, { toastStatus: 'failed update quater finals' });
      }
    },

    async updateSemiFinals(gameId: number): Promise<void> {
      try {
        await firstValueFrom(configService.UpdateMatchesSemifinals(gameId));
        const game = await firstValueFrom(configService.GetGame(''));
        patchState(store, { currentGame: game as unknown as GameState, toastStatus: 'notset', isLoading: false });
      } catch {
        patchState(store, { toastStatus: 'failed update semi finals' });
      }
    },

    async updateFinal(gameId: number): Promise<void> {
      try {
        await firstValueFrom(configService.UpdateMatchesFinal(gameId));
        const game = await firstValueFrom(configService.GetGame(''));
        patchState(store, { currentGame: game as unknown as GameState, toastStatus: 'notset', isLoading: false });
      } catch {
        patchState(store, { toastStatus: 'failed update final' });
      }
    },

    async finishGame(gameId: number): Promise<void> {
      try {
        await firstValueFrom(configService.FinishGame(gameId));
        const game = await firstValueFrom(configService.GetGame(''));
        patchState(store, {
          currentGame: game as unknown as GameState,
          toastStatus: 'success game finished',
          isLoading: false,
        });
      } catch {
        patchState(store, { toastStatus: 'failed game finished' });
      }
    },
  }))
);
