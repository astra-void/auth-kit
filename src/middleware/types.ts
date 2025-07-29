export interface MiddlewareParams {
    alwaysSetToken?: boolean;
    loginPath?: string;
    logoutPath?: string;
    registerPath?: string;
    protectedRoutes?: string[];
}