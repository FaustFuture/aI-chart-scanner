import { generateEmbedding } from "@/lib/services/embeddings";
import { findSimilarSetupsWithDetails } from "./knowledge";
import { formatSimilarSetupsForPrompt } from "../utils/knowledgeFormatter";
import { RAG_CONFIG } from "../config/ragConfig";

/**
 * Retrieves relevant knowledge (similar trade setups) for RAG
 * @param analysis - The current chart analysis text
 * @param companyId - Optional company ID to filter results
 * @returns Promise<string> - Formatted knowledge context for prompt (empty string if none found)
 */
export async function getRelevantKnowledge(
	analysis: string,
	companyId?: string
): Promise<string> {
	try {
		// 1. Generate embedding from current analysis
		const embedding = await generateEmbedding(analysis);

		// 2. Query similar setups with quality filter
		const similarSetups = await findSimilarSetupsWithDetails(
			embedding,
			companyId,
			RAG_CONFIG.MAX_SIMILAR_SETUPS,
			RAG_CONFIG.MIN_QUALITY_SCORE,
			RAG_CONFIG.MIN_SIMILARITY_THRESHOLD
		);

		// 3. If no similar setups found, return empty string
		if (similarSetups.length === 0) {
			return "";
		}

		// 4. Format for prompt
		const formattedKnowledge = formatSimilarSetupsForPrompt(similarSetups);

		return formattedKnowledge;
	} catch (error) {
		// Log error but don't throw - graceful degradation
		console.error("Error retrieving relevant knowledge:", error);
		return "";
	}
}

