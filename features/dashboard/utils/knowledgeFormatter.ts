import type { SimilarSetupWithDetails } from "../types";

/**
 * Formats similar trade setups into a concise prompt context
 * Target: ~100-150 tokens per similar setup
 */
export function formatSimilarSetupsForPrompt(
	similarSetups: SimilarSetupWithDetails[]
): string {
	if (similarSetups.length === 0) {
		return "";
	}

	const formatted = similarSetups
		.map((setup, index) => {
			const direction = setup.direction || "N/A";
			const quality = setup.qualityScore || "N/A";
			const entryPrice = setup.entryPrice || "N/A";
			const riskReward = setup.riskRewardRatio || "N/A";
			const orderType = setup.orderType || "N/A";

			// Concise format: Direction, Quality, Entry, R:R
			return `${index + 1}. ${direction} setup (Quality: ${quality}) - Entry: ${entryPrice}, R:R ${riskReward}, Order: ${orderType}`;
		})
		.join("\n");

	// Return just the formatted setups - the prompt template will add the header
	return formatted;
}

