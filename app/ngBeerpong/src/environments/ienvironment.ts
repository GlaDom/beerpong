export interface IEnvironment {
    production: boolean;
    auth: Auth;
    api: ApiConfig;
}

export interface Auth {
    domain: string;
    clientId: string;
    audience: string;
    redirectUri: string;
}

export interface ApiConfig {
    url: string;
}