import { NextRequest, NextResponse } from "next/server";
import { generateJWT } from "../lib";
import { getGlobalConfig } from "../../core";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    const config = await getGlobalConfig();
    if (!config) return NextResponse.redirect(`${req.nextUrl.origin}/api/auth/error?reason=missing_token`);
    if (!token) return NextResponse.redirect(`${req.nextUrl.origin}/api/auth/error?reason=missing_token`);

    const user = await config.adapter.getUserByMagicLinkToken?.(token as string);
    await config?.adapter.deleteMagicLinkToken?.(token);
    if (!user) return NextResponse.redirect(`${req.nextUrl.origin}/api/auth/error?reason=invalid_user`);

    return await generateJWT(user, true);
  } catch {
    return NextResponse.redirect(`${req.nextUrl.origin}/api/auth/error?reason=invalid_token`);
  }
}