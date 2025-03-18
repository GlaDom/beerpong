import { User } from '@auth0/auth0-angular';

export interface UserState {
    userDetails: User
    bearerToken: string
    isLoggedIn: boolean
}