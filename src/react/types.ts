export interface LoginParams {
    email?: string;
    password?: string;
    redirect?: boolean;
    redirectUrl?: string;
    otpCode?: string;
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