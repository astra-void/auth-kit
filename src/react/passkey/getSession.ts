import { useEffect, useState } from "react";
import { AdapterUser } from "../../adapter";
import axios from "axios";
import { User } from "../hooks";

export function getSession(): { user: User | AdapterUser | null; loading: boolean } {
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
            } catch {
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