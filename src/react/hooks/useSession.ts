import { useEffect, useState } from "react";
import { AdapterUser } from "../../adapters";
import { SessionStatus, User, UseSessionResult } from "./types";
import { getSession } from "../getSession";

export function useSession(): UseSessionResult {
    const [user, setUser] = useState<User | AdapterUser | null>(null);
    const [status, setStatus] = useState<SessionStatus>("loading");

    useEffect(() => {
        let isMounted = true;

        const getSessionFunction = async () => {
            try {
                const user = await getSession();
                
                if (isMounted) {
                    if (user) {
                        setUser(user);
                        setStatus("authenticated");
                    } else {
                        setUser(null);
                        setStatus("unauthenticated");
                    }
                }
            } catch {
                if (isMounted) {
                    setUser(null);
                    setStatus("unauthenticated")
                }
            }
        };

        getSessionFunction();

        return () => {
            isMounted = false;
        }
    }, []);

    return { data: { user, status } };
}