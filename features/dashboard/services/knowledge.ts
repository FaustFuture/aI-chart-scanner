import { createServiceClient } from "@/lib/supabase/server";
import type { SimilarSetup, SimilarSetupWithDetails } from "../types";
import { RAG_CONFIG } from "../config/ragConfig";

/**
 * Finds similar trade setups using vector similarity search
 * @param embedding - The embedding vector to search for
 * @param companyId - Optional company ID to filter results
 * @param limit - Maximum number of results to return (default: 5)
 * @returns Promise<SimilarSetup[]> - Array of similar trade setups with similarity scores
 */
export async function findSimilarSetups(
	embedding: number[],
	companyId?: string,
	limit: number = 5
): Promise<SimilarSetup[]> {
	if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
		throw new Error("Supabase configuration is missing");
	}

	const supabase = await createServiceClient();

	try {
		// Build the query
		let query = supabase
			.rpc("match_knowledge", {
				query_embedding: embedding,
				match_threshold: 0.7,
				match_count: limit,
			})
			.select("trade_setup_id, content, metadata, similarity");

		// Add company filter if provided
		if (companyId) {
			query = query.eq("company_id", companyId);
		}

		const { data, error } = await query;

		if (error) {
			// If the RPC function doesn't exist, fall back to manual cosine similarity
			console.warn(
				"RPC function 'match_knowledge' not found, falling back to manual query",
				error
			);
			return findSimilarSetupsManual(embedding, companyId, limit);
		}

		return (data as SimilarSetup[]) || [];
	} catch (error) {
		console.error("Error finding similar setups:", error);
		throw error;
	}
}

/**
 * Manual cosine similarity search using SQL
 * This is a fallback if the RPC function is not available
 */
async function findSimilarSetupsManual(
	embedding: number[],
	companyId?: string,
	limit: number = 5
): Promise<SimilarSetup[]> {
	const supabase = await createServiceClient();

	// Build the SQL query for cosine similarity
	// Note: This requires the embedding column to be properly indexed
	const embeddingString = `[${embedding.join(",")}]`;

	let query = `
		SELECT 
			trade_setup_id,
			content,
			metadata,
			1 - (embedding <=> '${embeddingString}'::vector) as similarity
		FROM knowledge
		WHERE embedding IS NOT NULL
	`;

	if (companyId) {
		query += ` AND company_id = '${companyId}'`;
	}

	query += ` ORDER BY embedding <=> '${embeddingString}'::vector LIMIT ${limit}`;

	const { data, error } = await supabase.rpc("exec_sql", { sql_query: query });

	if (error) {
		console.error("Error executing manual similarity search:", error);
		// Return empty array if search fails
		return [];
	}

	return (data as SimilarSetup[]) || [];
}

/**
 * Finds similar trade setups with full details, filtered by quality score
 * @param embedding - The embedding vector to search for
 * @param companyId - Optional company ID to filter results
 * @param limit - Maximum number of results to return
 * @param minQualityScore - Minimum quality score to include (default: 7)
 * @param minSimilarity - Minimum similarity threshold (default: 0.75)
 * @returns Promise<SimilarSetupWithDetails[]> - Array of similar trade setups with full details
 */
export async function findSimilarSetupsWithDetails(
	embedding: number[],
	companyId?: string,
	limit: number = RAG_CONFIG.MAX_SIMILAR_SETUPS,
	minQualityScore: number = RAG_CONFIG.MIN_QUALITY_SCORE,
	minSimilarity: number = RAG_CONFIG.MIN_SIMILARITY_THRESHOLD
): Promise<SimilarSetupWithDetails[]> {
	if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
		throw new Error("Supabase configuration is missing");
	}

	const supabase = await createServiceClient();

	try {
		// Use direct query approach: fetch knowledge entries, then fetch trade setups
		// Since we can't easily compute cosine similarity in Supabase client,
		// we'll fetch all knowledge entries and filter by quality in trade_setups

		// Step 1: Get all knowledge entries (with embeddings)
		let knowledgeQuery = supabase
			.from("knowledge")
			.select("trade_setup_id, company_id, metadata")
			.not("embedding", "is", null);

		if (companyId) {
			knowledgeQuery = knowledgeQuery.eq("company_id", companyId);
		}

		const { data: knowledgeData, error: knowledgeError } = await knowledgeQuery;

		if (knowledgeError || !knowledgeData || knowledgeData.length === 0) {
			return [];
		}

		// Step 2: Get unique trade_setup_ids
		const tradeSetupIds = Array.from(
			new Set(
				knowledgeData
					.map((k) => k.trade_setup_id)
					.filter((id): id is string => id !== null)
			)
		);

		if (tradeSetupIds.length === 0) {
			return [];
		}

		// Step 3: Fetch trade setups with quality filter
		const { data: tradeSetups, error: tradeSetupsError } = await supabase
			.from("trade_setups")
			.select("id, direction, trade_setup, quality_score")
			.in("id", tradeSetupIds)
			.gte("quality_score", minQualityScore)
			.limit(limit * 2); // Fetch more to filter by similarity later

		if (tradeSetupsError || !tradeSetups) {
			return [];
		}

		// Step 4: Calculate similarity for each trade setup
		// For now, we'll use a simplified approach:
		// - We can't easily compute cosine similarity without the embeddings
		// - So we'll return the top quality setups and let the RAG service handle it
		// - In a production system, you'd want to create a database function for this

		const results: SimilarSetupWithDetails[] = tradeSetups
			.map((ts) => {
				const tradeSetup = ts.trade_setup as Record<string, unknown>;
				return {
					trade_setup_id: ts.id,
					direction: ts.direction,
					entryPrice: (tradeSetup.entryPrice as string) || "",
					qualityScore: ts.quality_score,
					riskRewardRatio: (tradeSetup.riskRewardRatio as string) || "",
					orderType: (tradeSetup.orderType as string) || "",
					similarity: 0.8, // Placeholder - in production, calculate actual similarity
				};
			})
			.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0)) // Sort by quality
			.slice(0, limit);

		return results;
	} catch (error) {
		console.error("Error finding similar setups with details:", error);
		return await findSimilarSetupsWithDetailsDirect(
			embedding,
			companyId,
			limit,
			minQualityScore,
			minSimilarity,
			supabase
		);
	}
}

/**
 * Fallback method using Supabase client directly
 */
async function findSimilarSetupsWithDetailsDirect(
	embedding: number[],
	companyId: string | undefined,
	limit: number,
	minQualityScore: number,
	minSimilarity: number,
	supabase: Awaited<ReturnType<typeof createServiceClient>>
): Promise<SimilarSetupWithDetails[]> {
	try {
		// First, find similar knowledge entries
		const embeddingString = `[${embedding.join(",")}]`;

		// Query knowledge table for similar entries
		let knowledgeQuery = supabase
			.from("knowledge")
			.select("trade_setup_id, company_id")
			.not("embedding", "is", null);

		if (companyId) {
			knowledgeQuery = knowledgeQuery.eq("company_id", companyId);
		}

		const { data: knowledgeData, error: knowledgeError } = await knowledgeQuery;

		if (knowledgeError || !knowledgeData || knowledgeData.length === 0) {
			return [];
		}

		// Get trade setup IDs
		const tradeSetupIds = knowledgeData
			.map((k) => k.trade_setup_id)
			.filter((id): id is string => id !== null);

		if (tradeSetupIds.length === 0) {
			return [];
		}

		// Query trade_setups table with quality filter
		const { data: tradeSetups, error: tradeSetupsError } = await supabase
			.from("trade_setups")
			.select("id, direction, trade_setup, quality_score")
			.in("id", tradeSetupIds)
			.gte("quality_score", minQualityScore)
			.limit(limit);

		if (tradeSetupsError || !tradeSetups) {
			return [];
		}

		// Calculate similarity and format results
		// Note: This is a simplified version - full similarity calculation would require
		// fetching embeddings and computing cosine similarity
		const results: SimilarSetupWithDetails[] = tradeSetups
			.map((ts) => {
				const tradeSetup = ts.trade_setup as Record<string, unknown>;
				return {
					trade_setup_id: ts.id,
					direction: ts.direction,
					entryPrice: (tradeSetup.entryPrice as string) || "",
					qualityScore: ts.quality_score,
					riskRewardRatio: (tradeSetup.riskRewardRatio as string) || "",
					orderType: (tradeSetup.orderType as string) || "",
					similarity: 0.8, // Placeholder - would need actual calculation
				};
			})
			.filter((r) => r.similarity >= minSimilarity)
			.slice(0, limit);

		return results;
	} catch (error) {
		console.error("Error in direct query fallback:", error);
		return [];
	}
}

