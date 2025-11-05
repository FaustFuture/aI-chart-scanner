/**
 * RAG (Retrieval Augmented Generation) Configuration
 * Controls token usage and knowledge retrieval parameters
 */
export const RAG_CONFIG = {
	/** Maximum number of similar setups to retrieve */
	MAX_SIMILAR_SETUPS: 3,
	/** Minimum quality score for setups to be included (1-10 scale) */
	MIN_QUALITY_SCORE: 7,
	/** Minimum similarity threshold for vector search (0-1 scale) */
	MIN_SIMILARITY_THRESHOLD: 0.75,
	/** Maximum tokens to use for knowledge context */
	MAX_KNOWLEDGE_TOKENS: 800,
} as const;

