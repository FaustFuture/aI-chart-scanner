"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import type { DashboardProps } from "../types";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import { useImageAnalysis } from "../hooks/useImageAnalysis";
import { useTradeSetup } from "../hooks/useTradeSetup";
import { getAnalysisSummary } from "../utils/analysisSummary";
import { formatReasoning } from "../utils/formatReasoning";
import { AdminAnalytics } from "./AdminAnalytics";

type AdminDashboardProps = DashboardProps;

export function AdminDashboard({ companyId }: AdminDashboardProps) {
	const [isAdminView, setIsAdminView] = useState(true);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [shouldGenerateSetup, setShouldGenerateSetup] = useState(false);
	const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);
	const [showFeedback, setShowFeedback] = useState(false);
	const [feedbackText, setFeedbackText] = useState("");
	const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
	const { analyze, analysis, error, isLoading, reset } = useImageAnalysis();
	const {
		generate: generateTradeSetup,
		tradeSetup,
		error: tradeSetupError,
		isLoading: isTradeSetupLoading,
		reset: resetTradeSetup,
	} = useTradeSetup();

	// Track previous states for toast notifications
	const prevAnalysis = useRef<string | null>(null);
	const prevTradeSetup = useRef<typeof tradeSetup>(null);
	const prevError = useRef<string | null>(null);
	const prevTradeSetupError = useRef<string | null>(null);
	const prevIsLoading = useRef(false);
	const prevIsTradeSetupLoading = useRef(false);

	const handleFileSelect = (file: File) => {
		setSelectedFile(file);
		reset();
		resetTradeSetup();
		setShouldGenerateSetup(false);
		setIsAnalysisExpanded(false);
		setShowFeedback(false);
		setFeedbackText("");
	};

	const handleSubmitFeedback = async () => {
		if (!feedbackText.trim() || !tradeSetup || !selectedFile || !analysis) return;

		setIsSubmittingFeedback(true);
		toast.loading("Regenerating trade setup with your feedback...", {
			id: "feedback-regenerating",
		});

		try {
			// Store previous trade setup before regenerating
			const previousTradeSetup = tradeSetup;

			// Regenerate trade setup with feedback using the hook
			await generateTradeSetup(
				selectedFile,
				analysis,
				companyId,
				feedbackText.trim(),
				previousTradeSetup
			);

			// The hook's useEffect will handle toast notifications for success/error
			// We just need to clear the feedback form if successful
			// Wait a moment for state to update
			setTimeout(() => {
				if (!tradeSetupError) {
					toast.success("Trade setup regenerated based on your feedback!", {
						id: "feedback-regenerating",
					});
					setFeedbackText("");
					setShowFeedback(false);
				}
			}, 100);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to regenerate trade setup",
				{ id: "feedback-regenerating" }
			);
		} finally {
			setIsSubmittingFeedback(false);
		}
	};

	const handleAnalyzeAndGenerate = async () => {
		if (!selectedFile) return;

		// Reset previous results
		reset();
		resetTradeSetup();
		setShouldGenerateSetup(true);

		// Show toast for analysis start
		toast.loading("Analyzing chart...", {
			id: "analysis-loading",
		});

		// First, analyze the image
		await analyze(selectedFile);
	};

	// Toast notifications for analysis
	useEffect(() => {
		// Analysis completed successfully
		if (analysis && !isLoading && prevAnalysis.current !== analysis) {
			toast.dismiss("analysis-loading");
			toast.success("Chart analysis completed!", {
				description: "Generating trade setup...",
			});
			prevAnalysis.current = analysis;
		}

		// Analysis error
		if (error && error !== prevError.current) {
			toast.dismiss("analysis-loading");
			toast.error("Analysis failed", {
				description: error,
			});
			prevError.current = error;
		}

		// Trade setup started
		if (
			isTradeSetupLoading &&
			!prevIsTradeSetupLoading.current &&
			analysis &&
			!error
		) {
			toast.loading("Generating trade setup...", {
				id: "trade-setup-loading",
			});
			prevIsTradeSetupLoading.current = true;
		}

		// Trade setup completed successfully
		if (
			tradeSetup &&
			!tradeSetup.error &&
			tradeSetup !== prevTradeSetup.current &&
			!isTradeSetupLoading
		) {
			toast.dismiss("trade-setup-loading");
			const direction = tradeSetup.direction;
			const quality = tradeSetup.qualityScore;
			toast.success("Trade setup generated!", {
				description: `${direction} setup (Quality: ${quality}/10)`,
				duration: 5000,
			});
			prevTradeSetup.current = tradeSetup;
			prevIsTradeSetupLoading.current = false;
		}

		// Trade setup error
		if (
			tradeSetupError &&
			tradeSetupError !== prevTradeSetupError.current &&
			!isTradeSetupLoading
		) {
			toast.dismiss("trade-setup-loading");
			toast.error("Trade setup generation failed", {
				description: tradeSetupError,
			});
			prevTradeSetupError.current = tradeSetupError;
			prevIsTradeSetupLoading.current = false;
		}

		// Reset loading state tracking
		if (!isTradeSetupLoading) {
			prevIsTradeSetupLoading.current = false;
		}
	}, [
		analysis,
		error,
		tradeSetup,
		tradeSetupError,
		isLoading,
		isTradeSetupLoading,
	]);

	// Automatically generate trade setup when analysis completes successfully
	useEffect(() => {
		if (
			shouldGenerateSetup &&
			!isLoading &&
			analysis &&
			!error &&
			selectedFile
		) {
			generateTradeSetup(selectedFile, analysis, companyId);
			setShouldGenerateSetup(false);
		}
	}, [shouldGenerateSetup, isLoading, analysis, error, selectedFile, generateTradeSetup, companyId]);

	return (
		<div className="flex flex-col p-8 gap-4 min-h-screen bg-[#121212]">
			<div className="flex justify-between items-center gap-4">
				<h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
				<label className="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={isAdminView}
						onChange={(e) => setIsAdminView(e.target.checked)}
						className="w-4 h-4"
					/>
					<span className="text-base text-[#E0E0E0]">
						{isAdminView ? "Admin View" : "Member View"}
					</span>
				</label>
			</div>
			{isAdminView ? (
				<AdminAnalytics companyId={companyId} />
			) : (
				<div className="flex flex-col gap-4">
					<p className="text-base text-[#E0E0E0]">Member view content</p>
					<ImageUpload
						onFileSelect={handleFileSelect}
						onError={(errorMessage) => {
							console.error("Upload error:", errorMessage);
						}}
					/>
					<button
						type="button"
						onClick={handleAnalyzeAndGenerate}
						disabled={!selectedFile || isLoading || isTradeSetupLoading}
						className="px-4 py-2 bg-[#FFD700] text-[#121212] rounded-lg hover:bg-[#FFC700] disabled:bg-[#424242] disabled:text-[#9E9E9E] disabled:cursor-not-allowed transition-colors font-semibold"
					>
						{isLoading
							? "Analyzing Chart..."
							: isTradeSetupLoading
								? "Generating Trade Setup..."
								: "Analyze & Generate Trade Setup"}
					</button>
					{analysis && (
						<>
							<div className="mt-4 p-4 bg-[#212121] rounded-lg border border-[#424242]">
								<div className="flex justify-between items-center mb-2">
									<h3 className="text-lg font-semibold text-white">Analysis Result</h3>
									<button
										type="button"
										onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
										className="flex items-center gap-1 text-sm text-[#E0E0E0] hover:text-white transition-colors"
									>
										{isAnalysisExpanded ? (
											<>
												<span>Show Less</span>
												<ChevronUp className="w-4 h-4" />
											</>
										) : (
											<>
												<span>Show More</span>
												<ChevronDown className="w-4 h-4" />
											</>
										)}
									</button>
								</div>
								{isAnalysisExpanded ? (
									<MarkdownRenderer content={analysis} />
								) : (
									<p className="text-sm text-[#E0E0E0] whitespace-pre-wrap">
										{getAnalysisSummary(analysis)}
									</p>
								)}
							</div>
						</>
					)}
					{tradeSetup && !tradeSetup.error && (
						<div className="mt-4 p-6 bg-[#212121] rounded-lg border border-[#424242]">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-xl font-bold text-white">Trade Setup</h3>
								{tradeSetup.direction && (
									<span
										className={`px-4 py-2 rounded-lg font-bold text-lg ${tradeSetup.direction === "BUY"
											? "bg-[#4CAF50] text-white"
											: tradeSetup.direction === "SELL"
												? "bg-[#F44336] text-white"
												: "bg-[#757575] text-white"
											}`}
									>
										{tradeSetup.direction}
									</span>
								)}
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<p className="text-sm font-semibold text-[#B0B0B0]">
										Direction
									</p>
									<p
										className={`text-lg font-bold ${tradeSetup.direction === "BUY"
											? "text-[#4CAF50]"
											: tradeSetup.direction === "SELL"
												? "text-[#F44336]"
												: "text-[#E0E0E0]"
											}`}
									>
										{tradeSetup.direction || "N/A"}
									</p>
								</div>
								<div>
									<p className="text-sm font-semibold text-[#B0B0B0]">
										Entry Price
									</p>
									<p className="text-lg font-bold text-white">
										{tradeSetup.entryPrice}
									</p>
								</div>
								<div>
									<p className="text-sm font-semibold text-[#B0B0B0]">
										Stop Loss
									</p>
									<p className="text-lg font-bold text-white">
										{tradeSetup.stopLoss.level}
									</p>
									<p className="text-xs text-[#B0B0B0] mt-1">
										{tradeSetup.stopLoss.reasoning}
									</p>
								</div>
								<div>
									<p className="text-sm font-semibold text-[#B0B0B0]">
										Take Profit 1 (TP1)
									</p>
									<p className="text-lg font-bold text-[#4CAF50]">
										{tradeSetup.tp1}
									</p>
								</div>
								<div>
									<p className="text-sm font-semibold text-[#B0B0B0]">
										Take Profit 2 (TP2)
									</p>
									<p className="text-lg font-bold text-[#4CAF50]">
										{tradeSetup.tp2}
									</p>
								</div>
								<div>
									<p className="text-sm font-semibold text-[#B0B0B0]">
										Order Type
									</p>
									<p className="text-lg font-bold text-white capitalize">
										{tradeSetup.orderType}
									</p>
								</div>
								<div>
									<p className="text-sm font-semibold text-[#B0B0B0]">
										Risk:Reward Ratio
									</p>
									<p className="text-lg font-bold text-white">
										{tradeSetup.riskRewardRatio}
									</p>
								</div>
							</div>
							<div className="mt-4 pt-4 border-t border-[#424242]">
								<p className="text-sm font-semibold text-[#B0B0B0]">
									Setup Quality Score
								</p>
								<div className="flex items-center gap-2 mt-2">
									<div className="flex-1 bg-[#424242] rounded-full h-4">
										<div
											className="bg-[#FFD700] h-4 rounded-full transition-all"
											style={{
												width: `${(tradeSetup.qualityScore / 10) * 100}%`,
											}}
										/>
									</div>
									<span className="text-lg font-bold text-white">
										{tradeSetup.qualityScore}/10
									</span>
								</div>
							</div>
							{tradeSetup.reasoning && (
								<div className="mt-4 pt-4 border-t border-[#424242]">
									<h4 className="text-lg font-semibold text-white mb-3">
										Why This Setup Is Good
									</h4>
									<div className="text-sm text-[#E0E0E0] leading-relaxed space-y-2">
										{formatReasoning(tradeSetup.reasoning)
											.split("\n")
											.filter((line) => line.trim())
											.map((line, index) => (
												<p key={index} className="text-sm text-[#E0E0E0] leading-relaxed">
													{line.trim()}
												</p>
											))}
									</div>
								</div>
							)}
							{tradeSetup && !tradeSetup.error && (
								<div className="mt-4 pt-4 border-t border-[#424242]">
									<button
										type="button"
										onClick={() => setShowFeedback(!showFeedback)}
										disabled={isTradeSetupLoading}
										className="flex items-center gap-2 px-4 py-2 bg-[#424242] text-white rounded-lg hover:bg-[#525252] disabled:bg-[#3A3A3A] disabled:cursor-not-allowed transition-colors text-sm font-medium"
									>
										{showFeedback ? "Hide" : "Regenerate"} with Feedback
									</button>
									{showFeedback && (
										<div className="mt-4 space-y-3">
											<textarea
												value={feedbackText}
												onChange={(e) => setFeedbackText(e.target.value)}
												placeholder="Provide feedback to improve this trade setup... What should be adjusted? What aspects need more consideration?"
												className="w-full min-h-[120px] px-4 py-3 bg-[#1E1E1E] border border-[#424242] rounded-lg text-white placeholder-[#9E9E9E] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent resize-y"
												disabled={isSubmittingFeedback || isTradeSetupLoading}
											/>
											<div className="flex gap-2">
												<button
													type="button"
													onClick={handleSubmitFeedback}
													disabled={
														!feedbackText.trim() ||
														isSubmittingFeedback ||
														isTradeSetupLoading
													}
													className="px-4 py-2 bg-[#FFD700] text-[#121212] rounded-lg hover:bg-[#FFC700] disabled:bg-[#424242] disabled:text-[#9E9E9E] disabled:cursor-not-allowed transition-colors font-semibold text-sm"
												>
													{isSubmittingFeedback || isTradeSetupLoading
														? "Regenerating..."
														: "Regenerate Setup"}
												</button>
												<button
													type="button"
													onClick={() => {
														setShowFeedback(false);
														setFeedbackText("");
													}}
													disabled={isSubmittingFeedback}
													className="px-4 py-2 bg-[#424242] text-white rounded-lg hover:bg-[#525252] disabled:bg-[#3A3A3A] disabled:cursor-not-allowed transition-colors font-medium text-sm"
												>
													Cancel
												</button>
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					)}
					{error && (
						<div className="mt-4 p-4 bg-[#212121] rounded-lg border border-[#F44336]/50">
							<p className="text-sm text-[#F44336]">
								Error: {error}
							</p>
						</div>
					)}
					{tradeSetupError && (
						<div className="mt-4 p-4 bg-[#212121] rounded-lg border border-[#F44336]/50">
							<p className="text-sm text-[#F44336]">
								Trade Setup Error: {tradeSetupError}
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

