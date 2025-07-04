import { NextRequest, NextResponse } from "next/server";
import * as routes from "./routes";
import { AuthKitParams } from "../core/types";

export function getHandler(params: AuthKitParams) {
    return async function handler(req: NextRequest) {
        const { pathname } = new URL(req.url);
      
        const basePath = "/api/auth";
        
        const cleanPath = pathname
            .replace(new RegExp(`^${basePath}`), "")
            .replace(/^\/+|\/+$/g, "");

        if (req.method === 'POST') {
            switch (cleanPath) {
                case 'login':
                    return routes.loginRoute(req, params);
                case 'logout':
                    return routes.logoutRoute(req);
                case 'register':
                    return routes.registerRoute(req, params);
                case 'login/passkey/options':
                    return routes.loginOptionsRoute(req, params);
                case 'register/passkey/options':
                    return routes.registerOptionsRoute(req, params);
                default:
                    return NextResponse.json({ error: 'Endpoint not found', method: "POST", path: cleanPath }, { status: 404 });
                }
        } else if (req.method === 'GET') {
            switch (cleanPath) {
                case 'callback':
                    return routes.callbackRoute(req);
                case 'session':
                    return routes.sessionRoute(req, params);
                default:
                    return NextResponse.json({ error: 'Endpoint not found', method: "POST", path: cleanPath }, { status: 404 });
            }
        }

        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
}