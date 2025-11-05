export type AccessLevel = "admin" | "member" | string;

export type DashboardProps = {
	companyId: string;
};

export type ImageAnalysisRequest = {
	imageBase64: string;
	imageMimeType: string;
};

export type ImageAnalysisResponse = {
	analysis: string;
	error?: string;
};

export type TradeSetupRequest = {
	imageBase64: string;
	imageMimeType: string;
	analysis: string;
	companyId?: string;
	feedback?: string;
	previousTradeSetup?: TradeSetupResponse;
};

export type TradeSetupResponse = {
	direction: "BUY" | "SELL" | "NO SETUP AVAILABLE";
	entryPrice: string;
	stopLoss: {
		level: string;
		reasoning: string;
	};
	tp1: string;
	tp2: string;
	orderType: "market" | "limit" | "stop";
	riskRewardRatio: string;
	qualityScore: number;
	reasoning?: string;
	error?: string;
};

export type SaveTradeSetupData = {
	companyId: string;
	userId: string;
	userName?: string;
	analysis: string;
	tradeSetup: TradeSetupResponse;
};

export type TradeSetupRow = {
	id: string;
	company_id: string;
	user_id: string;
	user_name: string | null;
	analysis: string;
	trade_setup: Record<string, unknown>;
	quality_score: number | null;
	direction: string | null;
	image_url: string | null;
	created_at: string;
	updated_at: string;
};

export type KnowledgeRow = {
	id: string;
	trade_setup_id: string | null;
	company_id: string;
	content: string;
	embedding: number[] | null;
	metadata: Record<string, unknown> | null;
	created_at: string;
};

export type SimilarSetup = {
	trade_setup_id: string;
	content: string;
	metadata: Record<string, unknown> | null;
	similarity: number;
};

export type SimilarSetupWithDetails = {
	trade_setup_id: string;
	direction: string | null;
	entryPrice: string;
	qualityScore: number | null;
	riskRewardRatio: string;
	orderType: string;
	similarity: number;
};

export type FeedbackRequest = {
	tradeSetupId?: string;
	companyId: string;
	feedbackText: string;
};

export type FeedbackResponse = {
	success: boolean;
	feedbackId?: string;
	error?: string;
};

export * from "./analytics";

