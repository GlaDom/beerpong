import { IEnvironment } from "./ienvironment";

export const environment: IEnvironment = {
    production: false,
    auth: {
        domain: 'dev-nduro5lf8x5ddjgj.eu.auth0.com',
        clientId: 'f5We2HLhj4JInznJZHZYY6eXDz6I3AEz',
        audience: 'https://dev-nduro5lf8x5ddjgj.eu.auth0.com/api/v2/',
        redirectUri: 'http://localhost:4200/callback'
    },
    api: {
        url: 'http://localhost:8080'
    }
};