export function getAnalysisSummary(analysis: string, maxLength: number = 150): string {
	if (!analysis) return "";

	// Strip markdown syntax for summary
	let plainText = analysis
		// Remove headers
		.replace(/^#{1,6}\s+/gm, "")
		// Remove bold/italic
		.replace(/\*\*([^*]+)\*\*/g, "$1")
		.replace(/\*([^*]+)\*/g, "$1")
		.replace(/__([^_]+)__/g, "$1")
		.replace(/_([^_]+)_/g, "$1")
		// Remove code blocks
		.replace(/```[\s\S]*?```/g, "")
		.replace(/`([^`]+)`/g, "$1")
		// Remove links
		.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
		// Remove list markers
		.replace(/^[\s]*[-*+]\s+/gm, "")
		.replace(/^[\s]*\d+\.\s+/gm, "")
		// Clean up extra whitespace
		.replace(/\n{3,}/g, "\n\n")
		.trim();

	// Try to get first sentence
	const firstSentenceMatch = plainText.match(/^[^.!?]+[.!?]/);
	if (firstSentenceMatch && firstSentenceMatch[0].length <= maxLength) {
		return firstSentenceMatch[0];
	}

	// If first sentence is too long, truncate at word boundary
	if (plainText.length <= maxLength) {
		return plainText;
	}

	// Truncate and add ellipsis
	const truncated = plainText.substring(0, maxLength);
	const lastSpace = truncated.lastIndexOf(" ");

	if (lastSpace > 0) {
		return truncated.substring(0, lastSpace) + "...";
	}

	return truncated + "...";
}

