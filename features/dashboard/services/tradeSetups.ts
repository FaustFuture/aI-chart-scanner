import type { TradeSetupRow } from "../types";

export async function fetchUserTradeSetups(
	companyId: string
): Promise<TradeSetupRow[]> {
	try {
		const response = await fetch(`/api/trade-setups?companyId=${companyId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = (await response.json()) as TradeSetupRow[];
		return data;
	} catch (error) {
		console.error("Failed to fetch trade setups:", error);
		return [];
	}
}

