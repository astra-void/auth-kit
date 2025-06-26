export interface LoginParams {
    email: string;
    password: string;
    provider: string;
    redirect?: boolean;
    redirectUrl?: string;
}

export interface LogoutParams {
    redirect?: boolean;
    redirectUrl?: string;
}

export interface RegisterParams {
    email: string;
    password: string;
    redirect?: boolean;
    redirectUrl?: string;
}