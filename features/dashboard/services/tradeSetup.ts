import type { TradeSetupRequest, TradeSetupResponse } from "../types";
import { fileToBase64 } from "./imageAnalysis";

export async function generateTradeSetup(
	file: File,
	analysis: string,
	companyId?: string,
	feedback?: string,
	previousTradeSetup?: TradeSetupResponse
): Promise<TradeSetupResponse> {
	try {
		// Convert file to base64
		const base64 = await fileToBase64(file);

		const requestBody: TradeSetupRequest = {
			imageBase64: base64,
			imageMimeType: file.type,
			analysis,
			companyId,
			feedback,
			previousTradeSetup,
		};

		const response = await fetch("/api/generate-trade-setup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			const errorData = (await response.json()) as TradeSetupResponse;
			return {
				direction: "NO SETUP AVAILABLE",
				entryPrice: "",
				stopLoss: { level: "", reasoning: "" },
				tp1: "",
				tp2: "",
				orderType: "market",
				riskRewardRatio: "",
				qualityScore: 0,
				error: errorData.error || `HTTP error! status: ${response.status}`,
			};
		}

		const data = (await response.json()) as TradeSetupResponse;
		return data;
	} catch (error) {
		return {
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
		};
	}
}

