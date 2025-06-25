import { useEffect, useState } from "react";
import { AdapterUser } from "../../adapters";
import { SessionStatus, User, UseSessionResult } from "./types";
import axios from "axios";

export function useSession(): UseSessionResult {
    const [user, setUser] = useState<User | AdapterUser | null>(null);
    const [status, setStatus] = useState<SessionStatus>("loading");

    useEffect(() => {
        let isMounted = true;

        const getSession = async () => {
            try {
                const data = (await axios.get('/api/auth/session')).data

                if (isMounted) {
                    if (data.user) {
                        setUser(data.user);
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

        getSession();

        return () => {
            isMounted = false;
        }
    }, []);

    return { data: { user, status } };
}