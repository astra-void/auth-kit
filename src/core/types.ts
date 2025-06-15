import { Adapter } from "../adapter";
import { HashingAlgorithm } from "../auth";

export interface AuthKitParams {
    adapter: Adapter;
    algorithm?: HashingAlgorithm;
}
