import { getHandler } from "../api";
import { AuthKitParams } from "./types";

export function AuthKit(config: AuthKitParams) {
    return getHandler(config);
}