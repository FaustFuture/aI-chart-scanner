"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Users, BarChart3, Award } from "lucide-react";
import type { AnalyticsData } from "../types/analytics";
import { fetchAnalytics } from "../services/analytics";
import { AnalyticsSkeleton } from "@/components/shared/AnalyticsSkeleton";

type AdminAnalyticsProps = {
	companyId: string;
};

export function AdminAnalytics({ companyId }: AdminAnalyticsProps) {
	const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadAnalytics() {
			setIsLoading(true);
			const data = await fetchAnalytics(companyId);
			setAnalytics(data);
			setIsLoading(false);
		}

		loadAnalytics();
	}, [companyId]);

	if (isLoading) {
		return <AnalyticsSkeleton />;
	}

	if (!analytics) {
		return null;
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* Average Confidence */}
				<div className="p-6 bg-[#212121] rounded-lg border border-[#424242]">
					<div className="flex items-center gap-3 mb-4">
						<div className="p-2 bg-[#424242] rounded-lg">
							<BarChart3 className="w-5 h-5 text-[#FFD700]" />
						</div>
						<div>
							<p className="text-sm text-[#B0B0B0]">Average Confidence</p>
							<p className="text-2xl font-bold text-white">
								{analytics.averageConfidence !== null
									? analytics.averageConfidence.toFixed(1)
									: "N/A"}
								<span className="text-lg text-[#B0B0B0]">/10</span>
							</p>
						</div>
					</div>
				</div>

				{/* Most Analyzed Pair */}
				<div className="p-6 bg-[#212121] rounded-lg border border-[#424242]">
					<div className="flex items-center gap-3 mb-4">
						<div className="p-2 bg-[#424242] rounded-lg">
							<TrendingUp className="w-5 h-5 text-[#FFD700]" />
						</div>
						<div>
							<p className="text-sm text-[#B0B0B0]">Most Analyzed Pair</p>
							<p className="text-2xl font-bold text-white">
								{analytics.topPair ? analytics.topPair.pair : "N/A"}
							</p>
							{analytics.topPair && (
								<p className="text-xs text-[#9E9E9E] mt-1">
									{analytics.topPair.count} setups
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Total Users */}
				<div className="p-6 bg-[#212121] rounded-lg border border-[#424242]">
					<div className="flex items-center gap-3 mb-4">
						<div className="p-2 bg-[#424242] rounded-lg">
							<Users className="w-5 h-5 text-[#FFD700]" />
						</div>
						<div>
							<p className="text-sm text-[#B0B0B0]">Active Users</p>
							<p className="text-2xl font-bold text-white">
								{analytics.topUsers.length}
							</p>
							<p className="text-xs text-[#9E9E9E] mt-1">Total users</p>
						</div>
					</div>
				</div>
			</div>

			{/* Top Users */}
			<div className="p-6 bg-[#212121] rounded-lg border border-[#424242]">
				<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
					<Users className="w-5 h-5 text-[#FFD700]" />
					Top Users
				</h3>
				{analytics.topUsers.length > 0 ? (
					<div className="space-y-3">
						{analytics.topUsers.map((user, index) => (
							<div
								key={user.user_id}
								className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg border border-[#424242]"
							>
								<div className="flex items-center gap-3">
									<div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#424242] text-white font-bold text-sm">
										{index + 1}
									</div>
									<div>
										<p className="text-white font-medium">
											{user.user_name || `User ${user.user_id.slice(0, 8)}`}
										</p>
										<p className="text-xs text-[#9E9E9E]">User ID: {user.user_id.slice(0, 12)}...</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-lg font-bold text-[#FFD700]">
										{user.total_setups}
									</p>
									<p className="text-xs text-[#9E9E9E]">setups</p>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-[#9E9E9E] text-sm">No users yet</p>
				)}
			</div>

			{/* Top 5 Most Confident Setups */}
			<div className="p-6 bg-[#212121] rounded-lg border border-[#424242]">
				<h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
					<Award className="w-5 h-5 text-[#FFD700]" />
					Top 5 Most Confident Setups
				</h3>
				{analytics.topSetups.length > 0 ? (
					<div className="space-y-3">
						{analytics.topSetups.map((setup, index) => (
							<div
								key={setup.id}
								className="p-4 bg-[#1E1E1E] rounded-lg border border-[#424242]"
							>
								<div className="flex items-start justify-between mb-2">
									<div className="flex items-center gap-3">
										<div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#424242] text-white font-bold text-xs">
											{index + 1}
										</div>
										<div>
											<div className="flex items-center gap-2">
												<span
													className={`px-2 py-1 rounded text-xs font-bold ${setup.direction === "BUY"
														? "bg-[#4CAF50] text-white"
														: setup.direction === "SELL"
															? "bg-[#F44336] text-white"
															: "bg-[#757575] text-white"
														}`}
												>
													{setup.direction || "N/A"}
												</span>
												<span className="text-sm font-semibold text-white">
													Quality: {setup.qualityScore?.toFixed(1)}/10
												</span>
											</div>
											<p className="text-xs text-[#9E9E9E] mt-1">
												by {setup.user_name || "Unknown"}
											</p>
										</div>
									</div>
								</div>
								<div className="mt-3 grid grid-cols-2 gap-3 text-sm">
									<div>
										<p className="text-[#B0B0B0] text-xs">Entry Price</p>
										<p className="text-white font-medium">{setup.entryPrice}</p>
									</div>
									<div>
										<p className="text-[#B0B0B0] text-xs">Risk:Reward</p>
										<p className="text-white font-medium">
											{setup.riskRewardRatio}
										</p>
									</div>
								</div>
								<p className="text-xs text-[#9E9E9E] mt-2">
									{new Date(setup.created_at).toLocaleDateString("en-US", {
										year: "numeric",
										month: "short",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</p>
							</div>
						))}
					</div>
				) : (
					<p className="text-[#9E9E9E] text-sm">No setups yet</p>
				)}
			</div>
		</div>
	);
}

