import { useState } from "react";
import { generateTradeSetup } from "../services/tradeSetup";
import type { TradeSetupResponse } from "../types";

type UseTradeSetupReturn = {
	generate: (
		file: File,
		analysis: string,
		companyId?: string,
		feedback?: string,
		previousTradeSetup?: TradeSetupResponse
	) => Promise<void>;
	tradeSetup: TradeSetupResponse | null;
	error: string | null;
	isLoading: boolean;
	reset: () => void;
};

export function useTradeSetup(): UseTradeSetupReturn {
	const [tradeSetup, setTradeSetup] = useState<TradeSetupResponse | null>(
		null
	);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const generate = async (
		file: File,
		analysis: string,
		companyId?: string,
		feedback?: string,
		previousTradeSetup?: TradeSetupResponse
	) => {
		setIsLoading(true);
		setError(null);
		// Don't reset tradeSetup when regenerating with feedback - keep previous for reference
		if (!feedback) {
			setTradeSetup(null);
		}

		try {
			const result = await generateTradeSetup(
				file,
				analysis,
				companyId,
				feedback,
				previousTradeSetup
			);
			if (result.error) {
				setError(result.error);
			} else {
				setTradeSetup(result);
			}
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to generate trade setup"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const reset = () => {
		setTradeSetup(null);
		setError(null);
		setIsLoading(false);
	};

	return {
		generate,
		tradeSetup,
		error,
		isLoading,
		reset,
	};
}

