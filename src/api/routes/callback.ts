import { NextRequest, NextResponse } from "next/server";
import { generateJWT } from "../lib";
import { getGlobalConfig } from "../../core";
import { verifyJWT } from "../../jwt";

export async function GET(req: NextRequest) {
    try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) return NextResponse.redirect(`${req.nextUrl.origin}/api/auth/error?reason=missing_token`);

    const email = await verifyJWT({ token, secret: process.env.AUTHKIT_SECRET }).then(res => res?.email);
    const user = await getGlobalConfig()!.adapter.getUserByEmail?.(email as string);
    if (!user) return NextResponse.redirect(`${req.nextUrl.origin}/api/auth/error?reason=invalid_user`);

    return await generateJWT(user, true);
  } catch {
    return NextResponse.redirect(`${req.nextUrl.origin}/api/auth/error?reason=invalid_token`);
  }
}