import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { User } from '@auth0/auth0-angular';

export interface UserState {
  userDetails: User;
  bearerToken: string;
  isLoggedIn: boolean;
}

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState<UserState>({
    userDetails: {},
    bearerToken: '',
    isLoggedIn: false,
  }),
  withMethods((store) => ({
    setUser(userState: User): void {
      patchState(store, { userDetails: userState, isLoggedIn: true });
    },
    setToken(token: string): void {
      patchState(store, { bearerToken: token });
    },
    resetUser(): void {
      patchState(store, { userDetails: {}, bearerToken: '', isLoggedIn: false });
    },
  }))
);
