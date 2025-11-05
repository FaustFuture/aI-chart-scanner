import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a vector embedding for the given text using OpenAI's text-embedding-3-small model
 * @param text - The text to generate an embedding for
 * @returns Promise<number[]> - Array of 1536 numbers representing the embedding vector
 * @throws Error if embedding generation fails
 */
export async function generateEmbedding(text: string): Promise<number[]> {
	if (!process.env.OPENAI_API_KEY) {
		throw new Error("OPENAI_API_KEY is not configured");
	}

	if (!text || text.trim().length === 0) {
		throw new Error("Text cannot be empty");
	}

	try {
		const response = await openai.embeddings.create({
			model: "text-embedding-3-small",
			input: text,
		});

		const embedding = response.data[0]?.embedding;
		if (!embedding) {
			throw new Error("No embedding returned from OpenAI");
		}

		return embedding;
	} catch (error) {
		console.error("Error generating embedding:", error);
		throw new Error(
			`Failed to generate embedding: ${error instanceof Error ? error.message : "Unknown error"}`
		);
	}
}

