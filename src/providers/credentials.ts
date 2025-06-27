import { Body, Provider } from "./types";
import { AdapterUser } from "../adapters";
import { getGlobalConfig } from "../core";
import { verifyPassword } from "../auth";

export function CredentialsProvider(
    override?: Partial<Provider>
): Provider {
    const defaultAuthorize = async (body: Body): Promise<AdapterUser | null> => {
        const config = getGlobalConfig();
        if (!config) throw new Error("Config not found");

        const { email, password } = body;
        if (!email || !password) return null;

        const user = await config.adapter.getUserByEmail?.(email);
        if (!user || !user.hashedPassword) return null;

        const algorithm = config.algorithm ?? "argon2";
        const isValid = await verifyPassword(password, user.hashedPassword, algorithm);

        return isValid ? user : null;
    };

    return {
        name: "credentials",
        type: "credentials",
        authorize: defaultAuthorize,
        ...override,
    };
}