import { useEffect, useState } from "react";
import { AdapterUser } from "../../adapter";
import { User } from "./types";
import axios from "axios";

export function useSession(): { user: User | AdapterUser | null; loading: boolean } {
    const [user, setUser] = useState<User | AdapterUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const getSession = async () => {
            try {
                await axios.get('/api/auth/session').then((res) => {
                    const data = res.data;
                    if (isMounted) {
                        setUser(data.user ?? null);
                    }
                });
            } catch (error) {
                if (isMounted) {
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        getSession();

        return () => {
            isMounted = false;
        }
    }, []);

    return { user, loading };
}