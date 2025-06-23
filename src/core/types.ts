import { Adapter } from "../adapter";
import { HashingAlgorithm } from "../auth";

export interface AuthKitParams {
    adapter: Adapter;
    algorithm?: HashingAlgorithm;
    passkey?: {
        rpId: string;
        rpName: string;
        store: 'memory' | 'redis'; 
    };
}
