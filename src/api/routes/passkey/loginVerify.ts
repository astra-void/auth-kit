import { NextRequest, NextResponse } from "next/server";
import { AuthKitParams } from "../../../core/types";

export async function POST(req: NextRequest, config: AuthKitParams) {
    try {
        return;
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}