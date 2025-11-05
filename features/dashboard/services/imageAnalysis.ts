import type {
	ImageAnalysisRequest,
	ImageAnalysisResponse,
} from "../types";

export async function analyzeImage(
	file: File
): Promise<ImageAnalysisResponse> {
	try {
		// Convert file to base64
		const base64 = await fileToBase64(file);

		const requestBody: ImageAnalysisRequest = {
			imageBase64: base64,
			imageMimeType: file.type,
		};

		const response = await fetch("/api/analyze-image", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			const errorData = (await response.json()) as ImageAnalysisResponse;
			return {
				analysis: "",
				error: errorData.error || `HTTP error! status: ${response.status}`,
			};
		}

		const data = (await response.json()) as ImageAnalysisResponse;
		return data;
	} catch (error) {
		return {
			analysis: "",
			error:
				error instanceof Error
					? error.message
					: "Failed to analyze image",
		};
	}
}

export function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			const result = reader.result as string;
			// Remove data URL prefix (e.g., "data:image/png;base64,")
			const base64 = result.split(",")[1];
			if (base64) {
				resolve(base64);
			} else {
				reject(new Error("Failed to convert file to base64"));
			}
		};
		reader.onerror = (error) => reject(error);
	});
}

