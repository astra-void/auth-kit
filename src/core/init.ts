import { getHandler } from "../api";
import { setGlobalConfig } from "./config";
import { AuthKitParams } from "./types";

export function AuthKit(config: AuthKitParams) {
    setGlobalConfig(config);

    return getHandler(config);
}