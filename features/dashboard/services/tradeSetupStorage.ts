import type { SaveTradeSetupData, TradeSetupResponse } from "../types";
import { createServiceClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/services/embeddings";

/**
 * Combines analysis and trade setup into a single text for embedding generation
 */
function createEmbeddingText(
	analysis: string,
	tradeSetup: TradeSetupResponse
): string {
	const setupSummary = `Trade Setup: Direction: ${tradeSetup.direction}, Entry: ${tradeSetup.entryPrice}, Stop Loss: ${tradeSetup.stopLoss.level}, TP1: ${tradeSetup.tp1}, TP2: ${tradeSetup.tp2}, Quality Score: ${tradeSetup.qualityScore}`;

	return `Analysis: ${analysis}\n\n${setupSummary}`;
}

/**
 * Saves a trade setup and its analysis to the database, then generates and stores an embedding
 * @param data - The trade setup data to save
 * @returns Promise<string> - The ID of the saved trade setup
 * @throws Error if saving fails
 */
export async function saveTradeSetup(
	data: SaveTradeSetupData
): Promise<string> {
	if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
		throw new Error("Supabase configuration is missing");
	}

	const supabase = await createServiceClient();

	try {
		// Save to trade_setups table
		const { data: tradeSetupData, error: tradeSetupError } = await supabase
			.from("trade_setups")
			.insert({
				company_id: data.companyId,
				user_id: data.userId,
				user_name: data.userName || null,
				analysis: data.analysis,
				trade_setup: data.tradeSetup as unknown as Record<string, unknown>,
				quality_score: data.tradeSetup.qualityScore,
				direction: data.tradeSetup.direction,
			})
			.select("id")
			.single();

		if (tradeSetupError || !tradeSetupData) {
			throw new Error(
				`Failed to save trade setup: ${tradeSetupError?.message || "Unknown error"}`
			);
		}

		const tradeSetupId = tradeSetupData.id;

		// Generate embedding from combined text
		const embeddingText = createEmbeddingText(data.analysis, data.tradeSetup);
		let embedding: number[] | null = null;

		try {
			embedding = await generateEmbedding(embeddingText);
		} catch (embeddingError) {
			console.error("Failed to generate embedding:", embeddingError);
			// Continue without embedding - we'll still save the knowledge entry
		}

		// Save to knowledge table with embedding
		const metadata = {
			direction: data.tradeSetup.direction,
			quality_score: data.tradeSetup.qualityScore,
			entry_price: data.tradeSetup.entryPrice,
		};

		const { error: knowledgeError } = await supabase.from("knowledge").insert({
			trade_setup_id: tradeSetupId,
			company_id: data.companyId,
			content: embeddingText,
			embedding: embedding,
			metadata: metadata,
		});

		if (knowledgeError) {
			console.error("Failed to save knowledge entry:", knowledgeError);
			// Don't throw - trade setup is already saved, this is just for RAG
		}

		return tradeSetupId;
	} catch (error) {
		console.error("Error saving trade setup:", error);
		throw error;
	}
}

