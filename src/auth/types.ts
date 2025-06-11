import { JWTPayload } from "jose";

export interface AuthProvider {
  name: string;
  authorize: (input: any) => Promise<{ userId: string; [key: string]: any } | null>;
  register?: (input: any) => Promise<{ userId: string; [key: string]: any } | null>;
  logout?: (userId: string) => Promise<void>;
  getUser?: (token: string) => Promise<any>;
}

export interface LoginParams {
  provider: string;
  payload: JWTPayload;
}