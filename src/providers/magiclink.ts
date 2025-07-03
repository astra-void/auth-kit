import { AdapterUser } from "../adapters";
import { Provider, Body } from "./types";

export function MagiclinkProvider(
    authorize: (body: Body) => Promise<AdapterUser | null>,
    callback?: (req: Request) => Promise<AdapterUser | null>,
    override?: Partial<Provider>,
): Provider {
    return {
        name: "magiclink",
        type: "magiclink",
        authorize,
        callback,
        ...override,
    }
}
