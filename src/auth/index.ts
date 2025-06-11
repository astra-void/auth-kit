import { encryptJWT } from "../jwt";
import { AuthProvider, LoginParams } from "./types";

export * from "./types";

const JWT_SECRET = process.env.JWT_SECRET!;

const providers: Record<string, AuthProvider> = {};

export function registerProvider(name: string, provider: AuthProvider) {
  providers[name] = provider;
}

function getProvider(name: string): AuthProvider {
  const provider = providers[name];
  if (!provider) throw new Error(`Provider ${name} not found`);
  return provider;
}

export async function signIn(params: LoginParams) {
  const { provider, payload } = params;
  const authResult = await getProvider(provider).authorize(payload);
  
  if (!authResult || !authResult.userId) {
    throw new Error("Authencation failed");
  }

  const token = await encryptJWT({ payload, secret: JWT_SECRET });

  return authResult;
}