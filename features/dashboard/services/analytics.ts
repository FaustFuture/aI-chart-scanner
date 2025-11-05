import type { AnalyticsData } from "../types/analytics";

export async function fetchAnalytics(
	companyId: string
): Promise<AnalyticsData> {
	try {
		const response = await fetch(`/api/analytics?companyId=${companyId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = (await response.json()) as AnalyticsData;
		return data;
	} catch (error) {
		console.error("Failed to fetch analytics:", error);
		return {
			topUsers: [],
			topPair: null,
			averageConfidence: null,
			topSetups: [],
		};
	}
}

