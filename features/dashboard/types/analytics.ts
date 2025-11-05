export type TopUser = {
	user_id: string;
	user_name: string | null;
	total_setups: number;
};

export type TopPair = {
	pair: string;
	count: number;
};

export type AnalyticsData = {
	topUsers: TopUser[];
	topPair: TopPair | null;
	averageConfidence: number | null;
	topSetups: Array<{
		id: string;
		user_name: string | null;
		direction: string | null;
		entryPrice: string;
		qualityScore: number | null;
		riskRewardRatio: string;
		created_at: string;
	}>;
};

