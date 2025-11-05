import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { createServiceClient } from "@/lib/supabase/server";
import type { AnalyticsData } from "@/features/dashboard/types/analytics";

/**
 * Extract trading pair from analysis text
 * Looks for common patterns like EURUSD, GBPUSD, BTC, ETH, etc.
 */
function extractTradingPair(analysis: string): string | null {
	if (!analysis) return null;

	// Common forex pairs
	const forexPairs = [
		"EURUSD",
		"GBPUSD",
		"USDJPY",
		"AUDUSD",
		"USDCAD",
		"USDCHF",
		"NZDUSD",
		"EURGBP",
		"EURJPY",
		"GBPJPY",
		"AUDJPY",
		"EURAUD",
		"EURCAD",
		"EURNZD",
		"GBPAUD",
		"GBPCAD",
		"GBPCHF",
		"GBPNZD",
		"AUDCAD",
		"AUDCHF",
		"AUDNZD",
		"CADCHF",
		"CADJPY",
		"CHFJPY",
		"NZDJPY",
		"NZDUSD",
	];

	// Common crypto pairs
	const cryptoPairs = [
		"BTC",
		"ETH",
		"BNB",
		"SOL",
		"XRP",
		"ADA",
		"DOGE",
		"TRX",
		"DOT",
		"LINK",
		"MATIC",
		"AVAX",
		"UNI",
		"LTC",
		"ATOM",
		"ETC",
		"XLM",
		"ALGO",
		"VET",
		"FIL",
	];

	// Check for forex pairs
	for (const pair of forexPairs) {
		const regex = new RegExp(`\\b${pair}\\b`, "i");
		if (regex.test(analysis)) {
			return pair;
		}
	}

	// Check for crypto pairs
	for (const pair of cryptoPairs) {
		const regex = new RegExp(`\\b${pair}\\b`, "i");
		if (regex.test(analysis)) {
			return pair;
		}
	}

	// Try to find pattern like "EUR/USD" or "BTC/USD"
	const slashPairRegex = /([A-Z]{3,6})\/([A-Z]{3,6})/gi;
	const match = slashPairRegex.exec(analysis);
	if (match) {
		return `${match[1]}/${match[2]}`;
	}

	// Try to find pattern like "EUR USD" or "BTC USD"
	const spacePairRegex = /\b([A-Z]{3,6})\s+([A-Z]{3,6})\b/gi;
	const spaceMatch = spacePairRegex.exec(analysis);
	if (spaceMatch) {
		return `${spaceMatch[1]}/${spaceMatch[2]}`;
	}

	return null;
}

export async function GET(
	request: NextRequest
): Promise<NextResponse<AnalyticsData>> {
	try {
		const requestHeaders = await headers();
		const { userId } = await whopsdk.verifyUserToken(requestHeaders);

		if (!userId) {
			return NextResponse.json(
				{
					topUsers: [],
					topPair: null,
					averageConfidence: null,
					topSetups: [],
				},
				{ status: 401 }
			);
		}

		const { searchParams } = new URL(request.url);
		const companyId = searchParams.get("companyId");

		if (!companyId) {
			return NextResponse.json(
				{
					topUsers: [],
					topPair: null,
					averageConfidence: null,
					topSetups: [],
				},
				{ status: 400 }
			);
		}

		const supabase = await createServiceClient();

		// Fetch all trade setups for this company
		const { data: tradeSetups, error } = await supabase
			.from("trade_setups")
			.select("*")
			.eq("company_id", companyId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Failed to fetch trade setups:", error);
			return NextResponse.json(
				{
					topUsers: [],
					topPair: null,
					averageConfidence: null,
					topSetups: [],
				},
				{ status: 500 }
			);
		}

		if (!tradeSetups || tradeSetups.length === 0) {
			return NextResponse.json({
				topUsers: [],
				topPair: null,
				averageConfidence: null,
				topSetups: [],
			});
		}

		// 1. Top users (most setups)
		const userCounts = new Map<string, { count: number; name: string | null }>();
		for (const setup of tradeSetups) {
			const userId = setup.user_id;
			const current = userCounts.get(userId) || { count: 0, name: setup.user_name };
			userCounts.set(userId, {
				count: current.count + 1,
				name: setup.user_name || current.name,
			});
		}

		const topUsers = Array.from(userCounts.entries())
			.map(([user_id, data]) => ({
				user_id,
				user_name: data.name,
				total_setups: data.count,
			}))
			.sort((a, b) => b.total_setups - a.total_setups)
			.slice(0, 10);

		// 2. Most analyzed pair
		const pairCounts = new Map<string, number>();
		for (const setup of tradeSetups) {
			const pair = extractTradingPair(setup.analysis);
			if (pair) {
				pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1);
			}
		}

		const topPair =
			pairCounts.size > 0
				? Array.from(pairCounts.entries())
					.map(([pair, count]) => ({ pair, count }))
					.sort((a, b) => b.count - a.count)[0]
				: null;

		// 3. Average confidence (quality score)
		const validScores = tradeSetups
			.map((s) => s.quality_score)
			.filter((score): score is number => score !== null && score !== undefined);
		const averageConfidence =
			validScores.length > 0
				? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
				: null;

		// 4. Top 5 most confident setups
		const topSetups = tradeSetups
			.filter((s) => s.quality_score !== null && s.quality_score !== undefined)
			.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
			.slice(0, 5)
			.map((setup) => {
				const tradeSetup = setup.trade_setup as Record<string, unknown>;
				return {
					id: setup.id,
					user_name: setup.user_name,
					direction: setup.direction,
					entryPrice:
						typeof tradeSetup.entryPrice === "string"
							? tradeSetup.entryPrice
							: "N/A",
					qualityScore: setup.quality_score,
					riskRewardRatio:
						typeof tradeSetup.riskRewardRatio === "string"
							? tradeSetup.riskRewardRatio
							: "N/A",
					created_at: setup.created_at,
				};
			});

		return NextResponse.json({
			topUsers,
			topPair,
			averageConfidence,
			topSetups,
		});
	} catch (error) {
		console.error("Error fetching analytics:", error);
		return NextResponse.json(
			{
				topUsers: [],
				topPair: null,
				averageConfidence: null,
				topSetups: [],
			},
			{ status: 500 }
		);
	}
}

