import { useState } from "react";
import { analyzeImage } from "../services/imageAnalysis";
import type { ImageAnalysisResponse } from "../types";

type UseImageAnalysisReturn = {
	analyze: (file: File) => Promise<void>;
	analysis: string | null;
	error: string | null;
	isLoading: boolean;
	reset: () => void;
};

export function useImageAnalysis(): UseImageAnalysisReturn {
	const [analysis, setAnalysis] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const analyze = async (file: File) => {
		setIsLoading(true);
		setError(null);
		setAnalysis(null);

		try {
			const result = await analyzeImage(file);
			if (result.error) {
				setError(result.error);
			} else {
				setAnalysis(result.analysis);
			}
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to analyze image"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const reset = () => {
		setAnalysis(null);
		setError(null);
		setIsLoading(false);
	};

	return {
		analyze,
		analysis,
		error,
		isLoading,
		reset,
	};
}

