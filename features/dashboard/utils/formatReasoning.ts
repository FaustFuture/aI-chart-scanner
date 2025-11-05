/**
 * Formats reasoning text for better readability
 * Handles numbered lists and improves spacing
 */
export function formatReasoning(reasoning: string): string {
	if (!reasoning) return "";

	// Split by numbered points like (1), (2), etc.
	// This regex matches patterns like "(1)", "(2)", etc.
	const numberedPattern = /\((\d+)\)/g;

	// Check if the text contains numbered points
	if (numberedPattern.test(reasoning)) {
		// Replace numbered points with line breaks for better readability
		// Format: "text (1) point (2) point" -> "text\n(1) point\n(2) point"
		// But keep the intro text on the same line as the first point
		let formatted = reasoning
			// Replace " (1)" or ", (1)" with newline before the number
			.replace(/(\s|,\s*)\((\d+)\)/g, "\n($2)")
			// Clean up any double spaces or extra whitespace
			.replace(/\s{2,}/g, " ")
			.trim();

		// Clean up extra newlines
		formatted = formatted.replace(/\n{3,}/g, "\n\n"); // Max 2 newlines

		return formatted;
	}

	// If no numbered points, return as is
	return reasoning;
}

