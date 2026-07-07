import { IEnvironment } from "./ienvironment";

export const environment: IEnvironment = {
    production: true,
    auth: {
        domain: 'dev-nduro5lf8x5ddjgj.eu.auth0.com',
        clientId: 'VdAWn9Kh3BSCS0VgQH8JOI700ol0hCoH',
        audience: 'https://dev-nduro5lf8x5ddjgj.eu.auth0.com/api/v2/',
        redirectUri: 'https://skbeerpong.com'
    },
    api: {
        url: 'https://skbeerpong.com/api/v1'
    }
};