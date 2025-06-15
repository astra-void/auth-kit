import { NextRequest, NextResponse } from "next/server";
import { loginRoute, logoutRoute, registerRoute, sessionRoute } from "./routes";
import { AuthKitParams } from "../core/types";

export function getHandler(params: AuthKitParams) {
    return async function handler(req: NextRequest) {
        const { pathname } = new URL(req.url);
        const segments = pathname.replace(/\/$/, '').split('/');
        const action = segments.at(-1);

        if (req.method === 'POST') {
            switch (action) {
                case 'login':
                    return loginRoute(req, params);
                case 'logout':
                    return logoutRoute(req);
                case 'register':
                    return registerRoute(req, params);
            }
        } else if (req.method === 'GET') {
            switch (action) {
                case 'session':
                    return sessionRoute(req, params);
            }
        }

        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
}