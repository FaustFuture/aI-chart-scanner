<!-- 61037204-f83d-45fd-bb30-0e07ea4fb14d 433f7ee1-c31d-4677-ae09-f341982dfb9e -->
# RAG Knowledge Integration with Approximation Strategy

## Overview

Implement Retrieval Augmented Generation (RAG) by fetching similar past trade setups and incorporating them into the trade setup generation prompt using approximation techniques to manage token usage.

## Strategy for Token Management

### Approximation Techniques:

1. **Limit Similar Setups**: Retrieve only top 3-5 most similar setups (configurable)
2. **Quality Filtering**: Only include setups with quality_score >= 7 (high-quality patterns)
3. **Similarity Threshold**: Minimum similarity score of 0.75 to avoid irrelevant matches
4. **Summarization**: Extract key patterns (direction, entry strategy, quality score) rather than full content
5. **Token Budget**: Target ~500-800 tokens for knowledge context (out of ~4000 total)

## Implementation Steps

### 1. Create Knowledge Context Formatter

- File: `/features/dashboard/utils/knowledgeFormatter.ts`
- Function: `formatSimilarSetupsForPrompt(similarSetups: SimilarSetup[]): string`
- Extract key information: direction, entry context, quality score, key patterns
- Format as concise bullet points or structured summary
- Limit to ~100-150 tokens per similar setup

### 2. Update Knowledge Service

- File: `/features/dashboard/services/knowledge.ts`
- Enhance `findSimilarSetups()` to:
  - Accept quality score filter (minimum 7)
  - Return full trade setup data from trade_setups table (not just metadata)
  - Add similarity threshold parameter (default 0.75)

### 3. Create RAG Service

- File: `/features/dashboard/services/ragService.ts`
- Function: `getRelevantKnowledge(analysis: string, companyId?: string): Promise<string>`
- Steps:

  1. Generate embedding from current analysis
  2. Query similar setups with quality filter (quality_score >= 7)
  3. Limit to top 3-5 results
  4. Format for prompt using knowledgeFormatter
  5. Return formatted knowledge context string

### 4. Update Trade Setup API Route

- File: `/app/api/generate-trade-setup/route.ts`
- Before generating trade setup:

  1. Call `getRelevantKnowledge()` to get formatted knowledge
  2. Inject knowledge into system prompt or user message
  3. Add knowledge context section to prompt

- Handle errors gracefully (continue without knowledge if retrieval fails)

### 5. Update System Prompt

- Add knowledge context section to `DEFAULT_TRADE_SETUP_PROMPT`
- Format: "## RELEVANT PAST SETUPS\n[Knowledge context will be inserted here]"
- Instructions: "Use these similar past setups as reference patterns, but adapt to current market conditions"

### 6. Add Configuration

- Environment variables or constants:
  - `MAX_SIMILAR_SETUPS` = 3 (default)
  - `MIN_QUALITY_SCORE` = 7
  - `MIN_SIMILARITY_THRESHOLD` = 0.75
  - `MAX_KNOWLEDGE_TOKENS` = 800

### 7. Update Knowledge Query

- Modify knowledge service to join with trade_setups table
- Return structured data: direction, entryPrice, qualityScore, key patterns
- Filter by quality_score in query

## Knowledge Context Format

Example format (concise):

```
## RELEVANT PAST SETUPS (Reference Patterns)

1. SELL setup (Quality: 8.5) - Entry: 1.2732 (bearish OB retest), R:R 1:2.9
2. BUY setup (Quality: 9.0) - Entry: 2332.00 (bullish OB in discount), R:R 1:3.35
3. SELL setup (Quality: 7.5) - Entry: 1.1038 (premium OB retest), R:R 1:2.65

Use these patterns as reference but adapt to current analysis.
```

## Error Handling

- If knowledge retrieval fails: Continue without knowledge (log warning)
- If no similar setups found: Omit knowledge section from prompt
- If embedding generation fails: Skip knowledge retrieval (log error)

## Token Budget Management

- Current analysis: ~500 tokens
- Knowledge context: ~500-800 tokens (max)
- System prompt: ~2000 tokens
- Response: ~500 tokens
- Total: ~4000 tokens (well within gpt-4o limit)

## Files to Create/Modify

1. `/features/dashboard/utils/knowledgeFormatter.ts` - NEW
2. `/features/dashboard/services/ragService.ts` - NEW
3. `/features/dashboard/services/knowledge.ts` - MODIFY (add quality filter, return full data)
4. `/app/api/generate-trade-setup/route.ts` - MODIFY (integrate RAG)
5. Update types if needed for knowledge response structure

## Benefits

- Improves AI training by referencing successful patterns
- Manages token usage through approximation
- Filters for quality (only high-scoring setups)
- Graceful degradation if knowledge unavailable

### To-dos

- [ ] Install @supabase/supabase-js and @supabase/ssr packages
- [ ] Create environment variables template and documentation
- [ ] Create Supabase client utilities (client.ts, server.ts, types.ts) in /lib/supabase
- [ ] Create SQL migration files for pgvector extension, trade_setups table, knowledge table, and indexes
- [ ] Create embedding service in /lib/services/embeddings.ts using OpenAI text-embedding-3-small
- [ ] Create tradeSetupStorage.ts service to save trade setups and generate embeddings
- [ ] Add database types (SaveTradeSetupData, TradeSetupRow, KnowledgeRow) to /features/dashboard/types/index.ts
- [ ] Update /app/api/generate-trade-setup/route.ts to save trade setups after successful generation
- [ ] Add proper error handling and logging for storage operations