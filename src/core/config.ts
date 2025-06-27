import { AuthKitParams } from "./types";

declare global {
  var __AUTH_KIT_CONFIG__: AuthKitParams | undefined;
}

export function setGlobalConfig(config: AuthKitParams) {
    if (typeof window !== "undefined") {
        throw new Error("Do not access server config on the client");
    }

    if (globalThis.__AUTH_KIT_CONFIG__) {
        console.warn("AuthKit config is already set. Overwriting.");
    }

    globalThis.__AUTH_KIT_CONFIG__ = config;
}

export function getGlobalConfig(): AuthKitParams | undefined {
    if (typeof window !== "undefined") {
        throw new Error("Do not access server config on the client");
    }

    const config = globalThis.__AUTH_KIT_CONFIG__;
    if (!config) {
        throw new Error("AuthKit config not found. Did you forget to call setGlobalConfig?");
    }

    return config;
}