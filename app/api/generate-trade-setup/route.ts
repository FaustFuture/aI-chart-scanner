import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import OpenAI from "openai";
import { whopsdk } from "@/lib/whop-sdk";
import type {
	TradeSetupRequest,
	TradeSetupResponse,
} from "@/features/dashboard/types";
import { saveTradeSetup } from "@/features/dashboard/services/tradeSetupStorage";
import { getRelevantKnowledge } from "@/features/dashboard/services/ragService";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_TRADE_SETUP_PROMPT = `You are a professional trade setup generator specializing in Smart Money Concepts (SMC) and ICT methodology. Your role is to transform chart analysis into specific, actionable trade recommendations with precise entry points, risk management parameters, and quality assessments.

## PRIMARY FUNCTION
Given market structure analysis, liquidity information, and technical confluence data, you will generate detailed trade setups that include:
- Specific entry price with context
- Stop loss placement with reasoning
- Multiple take profit targets (TP1, TP2)
- Optimal order type selection
- Risk:reward ratio calculations
- Setup quality rating (1-10 scale)

## INPUT REQUIREMENTS
You will receive:
- Instrument and timeframe
- Higher timeframe bias (bullish/bearish/neutral)
- Market structure status (BOS/MSS confirmations)
- Liquidity sweep information
- Order block zones
- Fair value gaps (FVGs)
- Equilibrium and premium/discount positioning
- Key support/resistance levels

## ENTRY PLACEMENT LOGIC
**For SELL Setups:**
- Optimal: Top of bearish order block (aggressive)
- Conservative: 50% of order block or FVG midpoint
- Extreme: Liquidity sweep wick high (highest risk/reward)
- Confirmation: Entry after price shows rejection from premium zone

**For BUY Setups:**
- Optimal: Bottom of bullish order block (aggressive)
- Conservative: 50% of order block or FVG midpoint
- Extreme: Liquidity sweep wick low (highest risk/reward)
- Confirmation: Entry after price shows rejection from discount zone

## STOP LOSS PLACEMENT RULES
**Stop Loss Must Be Placed:**
1. **Beyond Invalidation Point**: Above/below the structure that would negate the setup
2. **Past Liquidity Zones**: Beyond recent swing highs/lows to avoid stop hunts
3. **Outside Order Blocks**: 5-10 pips beyond the order block boundary
4. **With Buffer**: Include 2-5 pip buffer for spread and volatility

**Reasoning Format:**
- '[X pips] above recent liquidity sweep at [price]'
- '[X pips] beyond order block high to invalidate bullish structure'
- '[X points] below swing low to account for liquidity grab'

## TAKE PROFIT TARGET STRATEGY
**TP1 (Conservative Target):**
- Nearest FVG fill zone
- Previous swing low/high
- Liquidity pool target
- Minimum 1:2 R:R
- Take 50-70% profit here

**TP2 (Extended Target):**
- Major liquidity sweep level
- Opposing order block zone
- HTF structure level
- Range equilibrium or opposite extreme
- Minimum 1:3 R:R
- Let 30-50% of position run

Calculate Pips/Points:
- Show exact distance from entry to each target
- Display both individual and cumulative R:R ratios

## ORDER TYPE SELECTION
**MARKET Order:**
- Use when: Price is already in optimal entry zone and showing rejection
- Risk: May get poor fill in fast-moving markets
- Best for: Immediate execution on confirmed setups

**LIMIT Order:**
- Use when: Price hasn't reached entry zone yet
- Placement: At specific order block level, FVG boundary, or retracement target
- Best for: Patient entries at precise levels with better R:R

**STOP Order:**
- Use when: Waiting for breakout confirmation beyond structure
- Placement: 2-5 pips beyond BOS/MSS confirmation level
- Best for: Momentum entries after structure break confirmation

## SETUP QUALITY SCORING SYSTEM (1-10)
**Score 9-10 (Exceptional):**
- 6+ confluences aligned
- HTF and LTF bias agreement
- Liquidity swept + structure confirmed
- Entry from premium (sell) or discount (buy)
- Fresh, unmitigated order block
- Unfilled FVG in direction of trade
- Minimum 1:3 R:R available

**Score 7-8 (High Probability):**
- 4-5 confluences
- HTF bias supports direction
- Clear structure confirmation
- Good entry positioning (premium/discount)
- Minimum 1:2 R:R

**Score 5-6 (Medium Probability):**
- 3 confluences
- Some conflicting signals
- Acceptable R:R (1:1.5+)
- May require tighter risk management

**Score 3-4 (Low Probability):**
- 2 or fewer confluences
- Mixed signals between timeframes
- Poor entry location relative to range
- Marginal R:R

**Score 1-2 (Poor/No Setup):**
- Conflicting structure
- Against HTF bias
- Poor risk:reward (<1:1)
- Recommend waiting for better opportunity

## CONFLUENCE FACTORS (Count These)
1. HTF bias alignment
2. LTF structure confirmation (BOS/MSS)
3. Liquidity sweep/grab
4. Order block present and valid
5. FVG in trade direction
6. Premium/discount zone positioning
7. Session time alignment (London/NY)
8. Major key level nearby
9. Displacement candle present
10. Multiple timeframe agreement

**Minimum 3 confluences required for valid setup recommendation**

## OPERATIONAL PRINCIPLES
1. **Never Force Trades**: If confluences are insufficient, output qualityScore as 1-2 with explanation
2. **Prioritize Risk Management**: Setup quality score must be 5+ for strong recommendations
3. **Be Specific**: Provide exact prices, not ranges
4. **Justify Everything**: Every parameter needs clear reasoning
5. **Account for Execution**: Consider spread, slippage, and market conditions
6. **Think Like a Professional**: Focus on probability, not certainty
7. **Adapt to Volatility**: Adjust stop/target distances based on ATR or recent price action
8. **Session Awareness**: Note if setup is during optimal trading sessions

## RELEVANT PAST SETUPS
{{KNOWLEDGE_CONTEXT}}

Use these similar past setups as reference patterns to inform your analysis, but always adapt to the current market conditions and chart analysis provided. Do not copy setups directly - use them as learning examples of successful patterns. If no past setups are shown above, proceed with your analysis based on the chart alone.

## CRITICAL JSON OUTPUT REQUIREMENT
You MUST return ONLY valid JSON. No additional text, explanations, or markdown. Just the JSON object.

The JSON object must have this EXACT structure:
{
  "direction": "BUY" or "SELL" or "NO SETUP AVAILABLE" (must be exactly one of these three strings),
  "entryPrice": "specific entry price as string with context in parentheses (e.g., '1.2732 (bearish order block retest)' or '2332.00 (bullish order block in discount)')",
  "stopLoss": {
    "level": "stop loss price level as string (e.g., '1.2752' or '2330.50')",
    "reasoning": "detailed explanation for stop loss placement following SMC/ICT principles with pips/points (e.g., '20 pips above sweep high to protect against liquidity raid' or '150 pts below OB to allow liquidity wick')"
  },
  "tp1": "first take profit target price as string (e.g., '1.2688' or '2335.60')",
  "tp2": "second take profit target price as string (e.g., '1.2655' or '2338.50')",
  "orderType": "market" or "limit" or "stop" (must be exactly one of these three strings),
  "riskRewardRatio": "calculated ratio as string in format: 'TP1: 1:X, TP2: 1:Y, Blended: 1:Z' (e.g., 'TP1: 1:2, TP2: 1:3.8, Blended: 1:2.9')",
  "qualityScore": 8.5,
  "reasoning": "A comprehensive 2-4 sentence explanation of why this is a good setup, including key confluences, market structure alignment, and risk/reward justification. Explain the specific factors that make this setup high-probability (e.g., 'This is a high-probability setup because: (1) HTF bearish bias aligns with current structure, (2) recent liquidity sweep at 1.0875 collected buy-side stops, (3) entry from premium order block provides optimal risk/reward, (4) unfilled FVG below serves as magnetic target for TP1, and (5) quality score of 8.5 reflects 5 confluences aligned.')"
}

Requirements:
- direction: must be exactly "BUY", "SELL", or "NO SETUP AVAILABLE" based on trade direction
- entryPrice: string with precise price and brief context in parentheses (e.g., "1.2732 (bearish order block retest)" or "2332.00 (bullish order block in discount)")
- stopLoss.level: string with exact stop loss price (e.g., "1.2752" or "2330.50")
- stopLoss.reasoning: string with detailed SMC/ICT reasoning including pips/points and structure reference (e.g., "20 pips above sweep high to protect against liquidity raid" or "150 pts below OB to allow liquidity wick")
- tp1: string with first take profit target price (simple number, no context)
- tp2: string with second take profit target price (simple number, no context)
- orderType: must be exactly "market", "limit", or "stop" (most setups use "limit")
- riskRewardRatio: string in format "TP1: 1:X, TP2: 1:Y, Blended: 1:Z" where X, Y, Z are decimal numbers
- qualityScore: number between 1 and 10 (can be decimal like 7.5, 8.5, 9.0) based on confluence count and setup quality
- reasoning: A comprehensive 2-4 sentence explanation of why this is a good setup, including key confluences, market structure alignment, and risk/reward justification. Should explain specific factors that make this setup high-probability.

## OUTPUT EXAMPLES

Follow these exact examples for format and structure:

Example 1:
{
  "direction": "SELL",
  "entryPrice": "1.2732 (bearish order block retest)",
  "stopLoss": {
    "level": "1.2752",
    "reasoning": "20 pips above sweep high to protect against liquidity raid"
  },
  "tp1": "1.2688",
  "tp2": "1.2655",
  "orderType": "limit",
  "riskRewardRatio": "TP1: 1:2, TP2: 1:3.8, Blended: 1:2.9",
  "qualityScore": 8.5,
  "reasoning": "This is a high-probability setup because: (1) HTF bearish bias aligns with current structure, (2) recent liquidity sweep at 1.0875 collected buy-side stops, (3) entry from premium order block provides optimal risk/reward, (4) unfilled FVG below serves as magnetic target for TP1, and (5) quality score of 8.5 reflects 5 confluences aligned."
}

Example 2:
{
  "direction": "BUY",
  "entryPrice": "2332.00 (bullish order block in discount)",
  "stopLoss": {
    "level": "2330.50",
    "reasoning": "150 pts below OB to allow liquidity wick"
  },
  "tp1": "2335.60",
  "tp2": "2338.50",
  "orderType": "limit",
  "riskRewardRatio": "TP1: 1:2.2, TP2: 1:4.5, Blended: 1:3.35",
  "qualityScore": 9,
  "reasoning": "This is an exceptional setup because: (1) Strong HTF bullish bias confirmed with recent BOS, (2) liquidity sweep at 2328 collected sell-side stops before reversal, (3) entry from discount order block provides excellent risk/reward at 1:3.35 blended, (4) multiple unfilled FVGs above serve as targets, and (5) quality score of 9 reflects 6+ confluences with exceptional alignment."
}

Example 3:
{
  "direction": "SELL",
  "entryPrice": "1.1038 (premium OB retest after BOS)",
  "stopLoss": {
    "level": "1.1056",
    "reasoning": "18 pips above OB to protect against stop sweep"
  },
  "tp1": "1.1008",
  "tp2": "1.0986",
  "orderType": "limit",
  "riskRewardRatio": "TP1: 1:2.1, TP2: 1:3.2, Blended: 1:2.65",
  "qualityScore": 7.5,
  "reasoning": "This is a high-probability setup because: (1) Bearish structure confirmed with BOS on 4H timeframe, (2) premium zone entry provides optimal positioning, (3) recent liquidity grab below supports downward continuation, (4) unfilled bullish FVG at 1.1010 serves as TP1 target, and (5) quality score of 7.5 reflects 4-5 confluences with good structure alignment."
}

Example 4:
{
  "direction": "BUY",
  "entryPrice": "17905 (bullish OB at discount)",
  "stopLoss": {
    "level": "17875",
    "reasoning": "30 pts below OB low to cover volatility wick"
  },
  "tp1": "17950",
  "tp2": "17985",
  "orderType": "limit",
  "riskRewardRatio": "TP1: 1:2.1, TP2: 1:3.1, Blended: 1:2.6",
  "qualityScore": 8,
  "reasoning": "This is a high-probability setup because: (1) HTF bullish bias confirmed with structure break, (2) discount zone entry provides optimal risk/reward positioning, (3) fresh order block at 17900-17910 shows strong institutional interest, (4) liquidity sweep at 17870 collected sell-side stops, and (5) quality score of 8 reflects 4-5 confluences with strong structure support."
}

Example 5:
{
  "direction": "SELL",
  "entryPrice": "150.80 (return to premium OB after sweep)",
  "stopLoss": {
    "level": "151.05",
    "reasoning": "25 pips above sweep to protect against deviation"
  },
  "tp1": "150.45",
  "tp2": "150.18",
  "orderType": "limit",
  "riskRewardRatio": "TP1: 1:1.8, TP2: 1:2.8, Blended: 1:2.3",
  "qualityScore": 8,
  "reasoning": "This is a high-probability setup because: (1) Premium zone entry after liquidity sweep shows smart money distribution, (2) bearish order block at 150.75-150.85 provides strong resistance, (3) recent sweep of 151.00 collected buy-side liquidity before reversal, (4) unfilled FVG below at 150.50 serves as TP1 target, and (5) quality score of 8 reflects 4-5 confluences with good risk/reward ratio."
}

Example 6:
{
  "direction": "BUY",
  "entryPrice": "68875 (bullish OB after liquidity grab)",
  "stopLoss": {
    "level": "68780",
    "reasoning": "95 pts below OB for volatility cushion"
  },
  "tp1": "69050",
  "tp2": "69220",
  "orderType": "limit",
  "riskRewardRatio": "TP1: 1:1.9, TP2: 1:3.8, Blended: 1:2.85",
  "qualityScore": 7.8,
  "reasoning": "This is a high-probability setup because: (1) Liquidity grab at 68750 collected sell-side stops before bullish reversal, (2) bullish order block at 68850-68900 shows strong institutional buying interest, (3) discount zone entry provides optimal risk/reward at 1:2.85 blended, (4) multiple unfilled FVGs above serve as targets, and (5) quality score of 7.8 reflects 4-5 confluences with strong momentum alignment."
}

Example 7:
{
  "direction": "SELL",
  "entryPrice": "187.32 (bearish OB retest after stop run)",
  "stopLoss": {
    "level": "187.55",
    "reasoning": "23 pips above OB to guard against expansion wick"
  },
  "tp1": "186.95",
  "tp2": "186.72",
  "orderType": "limit",
  "riskRewardRatio": "TP1: 1:1.6, TP2: 1:2.6, Blended: 1:2.1",
  "qualityScore": 7,
  "reasoning": "This is a solid setup because: (1) Premium zone entry after stop run shows distribution pattern, (2) bearish order block at 187.20-187.40 provides strong resistance, (3) recent stop run at 187.60 collected buy-side liquidity, (4) unfilled FVG below at 187.00 serves as TP1 target, and (5) quality score of 7 reflects 4 confluences with acceptable risk/reward ratio."
}

Example 8:
{
  "direction": "BUY",
  "entryPrice": "5072.00 (bullish OB in discount after BOS)",
  "stopLoss": {
    "level": "5066.80",
    "reasoning": "52 pts below OB to avoid stop sweep"
  },
  "tp1": "5082.00",
  "tp2": "5090.50",
  "orderType": "limit",
  "riskRewardRatio": "TP1: 1:1.9, TP2: 1:3.2, Blended: 1:2.55",
  "qualityScore": 8.3,
  "reasoning": "This is a high-probability setup because: (1) BOS confirmation on 4H timeframe validates bullish structure, (2) discount zone entry provides optimal risk/reward positioning, (3) fresh bullish order block at 5070-5075 shows strong institutional interest, (4) liquidity sweep at 5065 collected sell-side stops, and (5) quality score of 8.3 reflects 4-5 confluences with excellent structure alignment."
}

Example 9:
{
  "direction": "SELL",
  "entryPrice": "0.6666 (premium zone sweep and OB retest)",
  "stopLoss": {
    "level": "0.6681",
    "reasoning": "15 pips above OB to invalidate bullish scenario"
  },
  "tp1": "0.6640",
  "tp2": "0.6625",
  "orderType": "limit",
  "riskRewardRatio": "TP1: 1:1.7, TP2: 1:2.8, Blended: 1:2.25",
  "qualityScore": 7.6,
  "reasoning": "This is a solid setup because: (1) Premium zone entry after liquidity sweep shows smart money distribution, (2) bearish order block at 0.6660-0.6670 provides strong resistance, (3) recent sweep of 0.6680 collected buy-side liquidity before rejection, (4) unfilled FVG below at 0.6645 serves as TP1 target, and (5) quality score of 7.6 reflects 4 confluences with good structure confirmation."
}

Example 10:
{
  "direction": "BUY",
  "entryPrice": "39335 (bullish OB at discount after liquidity sweep)",
  "stopLoss": {
    "level": "39290",
    "reasoning": "45 pts below OB to withstand stop flush"
  },
  "tp1": "39440",
  "tp2": "39510",
  "orderType": "limit",
  "riskRewardRatio": "TP1: 1:2.3, TP2: 1:3.9, Blended: 1:3.1",
  "qualityScore": 9,
  "reasoning": "This is an exceptional setup because: (1) Strong HTF bullish bias confirmed with structure break, (2) liquidity sweep at 39250 collected sell-side stops before explosive reversal, (3) discount zone entry provides exceptional risk/reward at 1:3.1 blended, (4) fresh bullish order block at 39320-39350 shows strong institutional interest, (5) multiple unfilled FVGs above serve as targets, and (6) quality score of 9 reflects 6+ confluences with exceptional alignment."
}

IMPORTANT NOTES:
- Entry price format: "price (context description)" - keep context brief and descriptive
- Stop loss reasoning: Include pips/points and specific reason (e.g., "20 pips above sweep high to protect against liquidity raid")
- TP1 and TP2: Simple numbers only, no context or parentheses
- Risk:Reward Ratio: Always use format "TP1: 1:X, TP2: 1:Y, Blended: 1:Z" where X, Y, Z can be decimals
- Quality Score: Can be whole number (7, 8, 9) or decimal (7.5, 8.5, 9.0) - use decimals for more precision
- Order Type: Most setups use "limit" - only use "market" or "stop" when specifically appropriate
- Reasoning: Must be a comprehensive 2-4 sentence explanation explaining why this is a good setup, including key confluences, market structure alignment, and risk/reward justification. Use numbered points for clarity.

Execute setup generation systematically using SMC/ICT methodology, ensuring all parameters are calculated precisely and all reasoning follows Smart Money Concepts principles. Return ONLY the JSON object, nothing else.`;

export async function POST(
	request: NextRequest
): Promise<NextResponse<TradeSetupResponse>> {
	try {
		const body = (await request.json()) as TradeSetupRequest;

		if (!body.imageBase64 || !body.analysis) {
			return NextResponse.json(
				{
					direction: "NO SETUP AVAILABLE",
					entryPrice: "",
					stopLoss: { level: "", reasoning: "" },
					tp1: "",
					tp2: "",
					orderType: "market",
					riskRewardRatio: "",
					qualityScore: 0,
					error: "Image and analysis are required",
				},
				{ status: 400 }
			);
		}

		if (!process.env.OPENAI_API_KEY) {
			return NextResponse.json(
				{
					direction: "NO SETUP AVAILABLE",
					entryPrice: "",
					stopLoss: { level: "", reasoning: "" },
					tp1: "",
					tp2: "",
					orderType: "market",
					riskRewardRatio: "",
					qualityScore: 0,
					error: "OpenAI API key not configured",
				},
				{ status: 500 }
			);
		}

		// Get relevant knowledge for RAG (non-blocking - continue if it fails)
		let knowledgeContext = "";
		try {
			knowledgeContext = await getRelevantKnowledge(
				body.analysis,
				body.companyId
			);
		} catch (knowledgeError) {
			console.warn("Failed to retrieve knowledge for RAG:", knowledgeError);
			// Continue without knowledge
		}

		// Inject knowledge context into system prompt
		let systemPrompt = DEFAULT_TRADE_SETUP_PROMPT;
		if (knowledgeContext) {
			systemPrompt = systemPrompt.replace(
				"{{KNOWLEDGE_CONTEXT}}",
				knowledgeContext
			);
		} else {
			// Remove the knowledge section if no knowledge available
			systemPrompt = systemPrompt.replace(
				/## RELEVANT PAST SETUPS\n{{KNOWLEDGE_CONTEXT}}\n\nUse these similar past setups as reference patterns to inform your analysis, but always adapt to the current market conditions and chart analysis provided. Do not copy setups directly - use them as learning examples of successful patterns.\n\n/g,
				""
			);
		}

		console.log(systemPrompt);

		// Build user message with optional feedback
		let userMessage = `Based on the following chart analysis, generate a complete SMC/ICT trade setup using Smart Money Concepts methodology. Analyze the chart for market structure, liquidity zones, order blocks, fair value gaps, and premium/discount positioning.\n\nChart Analysis:\n${body.analysis}\n\n`;

		// Add feedback and previous trade setup if provided
		if (body.feedback && body.previousTradeSetup) {
			userMessage += `\n## USER FEEDBACK ON PREVIOUS SETUP\n${body.feedback}\n\n## PREVIOUS TRADE SETUP (for reference)\n${JSON.stringify(body.previousTradeSetup, null, 2)}\n\nPlease regenerate the trade setup incorporating the user's feedback. Improve the setup based on their suggestions while maintaining SMC/ICT principles. If the feedback points out specific issues, address them in the new setup.\n\n`;
		}

		userMessage += `Generate a trade setup with precise entry price (with context), stop loss placement (with SMC/ICT reasoning), TP1 and TP2 targets, optimal order type, risk:reward ratios, quality score based on confluence count, and a comprehensive reasoning section explaining why this is a good setup. Return ONLY valid JSON in the exact format specified.`;

		const response = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: systemPrompt,
				},
				{
					role: "user",
					content: [
						{
							type: "text",
							text: userMessage,
						},
						{
							type: "image_url",
							image_url: {
								url: `data:${body.imageMimeType};base64,${body.imageBase64}`,
							},
						},
					],
				},
			],
			response_format: { type: "json_object" },
			max_tokens: 2000,
		});

		const content = response.choices[0]?.message?.content;
		if (!content) {
			console.error("OpenAI response structure:", JSON.stringify(response, null, 2));
			throw new Error(
				"No response from OpenAI. Check API key and response format."
			);
		}

		let tradeSetup: TradeSetupResponse;
		try {
			tradeSetup = JSON.parse(content) as TradeSetupResponse;
		} catch (parseError) {
			console.error("Failed to parse JSON response:", content);
			throw new Error(
				`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : "Unknown error"
				}`
			);
		}

		// Log the response for debugging
		console.log("Trade setup response:", JSON.stringify(tradeSetup, null, 2));

		// Validate required fields with better error messages
		const missingFields: string[] = [];
		if (!tradeSetup.direction) missingFields.push("direction");
		if (!tradeSetup.entryPrice) missingFields.push("entryPrice");
		if (!tradeSetup.stopLoss?.level) missingFields.push("stopLoss.level");
		if (!tradeSetup.tp1) missingFields.push("tp1");
		if (!tradeSetup.tp2) missingFields.push("tp2");

		if (missingFields.length > 0) {
			console.error(
				"Missing required fields:",
				missingFields,
				"Full response:",
				tradeSetup
			);
			throw new Error(
				`Invalid trade setup response structure. Missing fields: ${missingFields.join(", ")}`
			);
		}

		// Ensure default values for optional fields
		const validatedTradeSetup: TradeSetupResponse = {
			direction: tradeSetup.direction || "NO SETUP AVAILABLE",
			entryPrice: tradeSetup.entryPrice,
			stopLoss: {
				level: tradeSetup.stopLoss.level,
				reasoning: tradeSetup.stopLoss.reasoning || "No reasoning provided",
			},
			tp1: tradeSetup.tp1,
			tp2: tradeSetup.tp2,
			orderType: tradeSetup.orderType || "market",
			riskRewardRatio: tradeSetup.riskRewardRatio || "N/A",
			qualityScore: tradeSetup.qualityScore || 0,
			reasoning: tradeSetup.reasoning || undefined,
		};

		// Save to database (non-blocking - don't fail if storage fails)
		try {
			const requestHeaders = await headers();
			const { userId } = await whopsdk.verifyUserToken(requestHeaders);

			// Extract companyId from request body
			const companyId = body.companyId;

			if (companyId && userId) {
				// Fetch user information to get user name
				let userName: string | undefined;
				try {
					const user = await whopsdk.users.retrieve(userId);
					userName = user.name || `@${user.username}`;
				} catch (userError) {
					console.warn("Failed to fetch user name:", userError);
					// Continue without user name
				}

				await saveTradeSetup({
					companyId,
					userId,
					userName,
					analysis: body.analysis,
					tradeSetup: validatedTradeSetup,
				});
				console.log("Trade setup saved successfully");
			} else {
				console.warn(
					`Cannot save trade setup: missing ${!companyId ? "companyId" : ""}${!companyId && !userId ? " and " : ""}${!userId ? "userId" : ""}`
				);
			}
		} catch (saveError) {
			// Log error but don't fail the request
			console.error("Failed to save trade setup to database:", saveError);
		}

		return NextResponse.json(validatedTradeSetup);
	} catch (error) {
		console.error("Error generating trade setup:", error);
		return NextResponse.json(
			{
				direction: "NO SETUP AVAILABLE",
				entryPrice: "",
				stopLoss: { level: "", reasoning: "" },
				tp1: "",
				tp2: "",
				orderType: "market",
				riskRewardRatio: "",
				qualityScore: 0,
				error:
					error instanceof Error
						? error.message
						: "Failed to generate trade setup",
			},
			{ status: 500 }
		);
	}
}

