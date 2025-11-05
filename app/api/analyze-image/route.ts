import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import type { ImageAnalysisRequest, ImageAnalysisResponse } from "@/features/dashboard/types";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_SYSTEM_PROMPT =
	"You are an expert trading chart analyst. Analyze the provided trading chart image and provide a concise, professional analysis. Focus on key technical indicators, trend patterns, support/resistance levels, and potential trading opportunities. Keep your response under 300 words.";

export async function POST(request: NextRequest): Promise<NextResponse<ImageAnalysisResponse>> {
	try {
		const body = (await request.json()) as ImageAnalysisRequest;

		if (!body.imageBase64) {
			return NextResponse.json(
				{ analysis: "", error: "No image provided" },
				{ status: 400 }
			);
		}

		if (!process.env.OPENAI_API_KEY) {
			return NextResponse.json(
				{ analysis: "", error: "OpenAI API key not configured" },
				{ status: 500 }
			);
		}

		const systemPrompt =
			process.env.OPENAI_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT;

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
							text: "Please analyze this trading chart image and provide your analysis.",
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
			max_tokens: 500,
		});

		const analysis =
			response.choices[0]?.message?.content || "No analysis generated";

		return NextResponse.json({ analysis });
	} catch (error) {
		console.error("Error analyzing image:", error);
		return NextResponse.json(
			{
				analysis: "",
				error:
					error instanceof Error
						? error.message
						: "Failed to analyze image",
			},
			{ status: 500 }
		);
	}
}

