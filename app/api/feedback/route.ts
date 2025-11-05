import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { createServiceClient } from "@/lib/supabase/server";
import type { FeedbackRequest, FeedbackResponse } from "@/features/dashboard/types";

export async function POST(
	request: NextRequest
): Promise<NextResponse<FeedbackResponse>> {
	try {
		const body = (await request.json()) as FeedbackRequest;

		// Validate required fields
		if (!body.feedbackText || body.feedbackText.trim().length === 0) {
			return NextResponse.json(
				{
					success: false,
					error: "Feedback text is required",
				},
				{ status: 400 }
			);
		}

		if (!body.companyId) {
			return NextResponse.json(
				{
					success: false,
					error: "Company ID is required",
				},
				{ status: 400 }
			);
		}

		// Verify user token and get userId
		const requestHeaders = await headers();
		const { userId } = await whopsdk.verifyUserToken(requestHeaders);

		if (!userId) {
			return NextResponse.json(
				{
					success: false,
					error: "Unauthorized",
				},
				{ status: 401 }
			);
		}

		// Get user name from Whop
		let userName: string | undefined;
		try {
			const user = await whopsdk.users.retrieve(userId);
			userName = user.name || `@${user.username}`;
		} catch (userError) {
			console.warn("Failed to fetch user name:", userError);
			// Continue without user name
		}

		// Save feedback to database
		const supabase = await createServiceClient();
		const { data, error } = await supabase
			.from("feedback")
			.insert({
				trade_setup_id: body.tradeSetupId || null,
				company_id: body.companyId,
				user_id: userId,
				user_name: userName,
				feedback_text: body.feedbackText.trim(),
			})
			.select("id")
			.single();

		if (error) {
			console.error("Failed to save feedback:", error);
			return NextResponse.json(
				{
					success: false,
					error: "Failed to save feedback",
				},
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			feedbackId: data.id,
		});
	} catch (error) {
		console.error("Error saving feedback:", error);
		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to save feedback",
			},
			{ status: 500 }
		);
	}
}

