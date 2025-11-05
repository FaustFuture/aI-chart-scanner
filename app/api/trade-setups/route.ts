import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { createServiceClient } from "@/lib/supabase/server";
import type { TradeSetupRow } from "@/features/dashboard/types";

export async function GET(
	request: NextRequest
): Promise<NextResponse<TradeSetupRow[]>> {
	try {
		const requestHeaders = await headers();
		const { userId } = await whopsdk.verifyUserToken(requestHeaders);

		if (!userId) {
			return NextResponse.json([], { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const companyId = searchParams.get("companyId");

		if (!companyId) {
			return NextResponse.json([], { status: 400 });
		}

		const supabase = await createServiceClient();

		// Fetch trade setups for this user and company
		const { data: tradeSetups, error } = await supabase
			.from("trade_setups")
			.select("*")
			.eq("company_id", companyId)
			.eq("user_id", userId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Failed to fetch trade setups:", error);
			return NextResponse.json([], { status: 500 });
		}

		return NextResponse.json(tradeSetups || []);
	} catch (error) {
		console.error("Error fetching trade setups:", error);
		return NextResponse.json([], { status: 500 });
	}
}

