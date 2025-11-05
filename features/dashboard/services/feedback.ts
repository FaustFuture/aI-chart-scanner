import type { FeedbackRequest, FeedbackResponse } from "../types";

export async function submitFeedback(
	data: FeedbackRequest
): Promise<FeedbackResponse> {
	try {
		const response = await fetch("/api/feedback", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			const errorData = (await response.json()) as FeedbackResponse;
			return {
				success: false,
				error: errorData.error || `HTTP error! status: ${response.status}`,
			};
		}

		const result = (await response.json()) as FeedbackResponse;
		return result;
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: "Failed to submit feedback",
		};
	}
}

