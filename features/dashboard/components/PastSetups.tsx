"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Calendar, TrendingUp } from "lucide-react";
import type { TradeSetupRow } from "../types";
import { fetchUserTradeSetups } from "../services/tradeSetups";
import { formatReasoning } from "../utils/formatReasoning";
import { Skeleton } from "@/components/ui/skeleton";

type PastSetupsProps = {
	companyId: string;
};

export function PastSetups({ companyId }: PastSetupsProps) {
	const [setups, setSetups] = useState<TradeSetupRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [expandedSetup, setExpandedSetup] = useState<string | null>(null);

	useEffect(() => {
		async function loadSetups() {
			setIsLoading(true);
			const data = await fetchUserTradeSetups(companyId);
			setSetups(data);
			setIsLoading(false);
		}

		loadSetups();
	}, [companyId]);

	if (isLoading) {
		return (
			<div className="bg-[#212121] rounded-lg border border-[#424242] p-6">
				<h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
					<TrendingUp className="w-5 h-5 text-[#FFD700]" />
					Past Trade Setups
				</h3>
				<div className="space-y-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<div
							key={index}
							className="p-4 bg-[#1E1E1E] rounded-lg border border-[#424242]"
						>
							<Skeleton className="h-5 w-32 mb-2" />
							<Skeleton className="h-4 w-full mb-1" />
							<Skeleton className="h-4 w-3/4" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (setups.length === 0) {
		return (
			<div className="bg-[#212121] rounded-lg border border-[#424242] p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-xl font-bold text-white flex items-center gap-2">
						<TrendingUp className="w-5 h-5 text-[#FFD700]" />
						Past Trade Setups
					</h3>
				</div>
				<p className="text-[#9E9E9E] text-sm">No past setups found. Generate your first trade setup to see it here!</p>
			</div>
		);
	}

	return (
		<div className="bg-[#212121] rounded-lg border border-[#424242] p-6">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-xl font-bold text-white flex items-center gap-2">
					<TrendingUp className="w-5 h-5 text-[#FFD700]" />
					Past Trade Setups
				</h3>
				<span className="text-sm text-[#B0B0B0]">{setups.length} total</span>
			</div>
			<div className="space-y-3">
				{setups.map((setup) => {
					const tradeSetup = setup.trade_setup as Record<string, unknown>;
					const isExpanded = expandedSetup === setup.id;

					return (
						<div
							key={setup.id}
							className="p-4 bg-[#1E1E1E] rounded-lg border border-[#424242]"
						>
							<div className="flex items-start justify-between mb-3">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-2">
										<span
											className={`px-3 py-1 rounded-lg text-sm font-bold ${setup.direction === "BUY"
												? "bg-[#4CAF50] text-white"
												: setup.direction === "SELL"
													? "bg-[#F44336] text-white"
													: "bg-[#757575] text-white"
												}`}
										>
											{setup.direction || "N/A"}
										</span>
										{setup.quality_score !== null && (
											<span className="text-sm font-semibold text-white">
												Quality: {setup.quality_score.toFixed(1)}/10
											</span>
										)}
									</div>
									<div className="flex items-center gap-2 text-xs text-[#9E9E9E]">
										<Calendar className="w-3 h-3" />
										{new Date(setup.created_at).toLocaleDateString("en-US", {
											year: "numeric",
											month: "short",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</div>
								</div>
								<button
									type="button"
									onClick={() =>
										setExpandedSetup(isExpanded ? null : setup.id)
									}
									className="flex items-center gap-1 text-sm text-[#E0E0E0] hover:text-white transition-colors"
								>
									{isExpanded ? (
										<>
											<span>Hide Details</span>
											<ChevronUp className="w-4 h-4" />
										</>
									) : (
										<>
											<span>Show Details</span>
											<ChevronDown className="w-4 h-4" />
										</>
									)}
								</button>
							</div>

							{isExpanded && (
								<div className="mt-4 pt-4 border-t border-[#424242] space-y-4">
									{/* Trade Setup Details */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<p className="text-sm font-semibold text-[#B0B0B0]">
												Entry Price
											</p>
											<p className="text-base font-bold text-white">
												{typeof tradeSetup.entryPrice === "string"
													? tradeSetup.entryPrice
													: "N/A"}
											</p>
										</div>
										<div>
											<p className="text-sm font-semibold text-[#B0B0B0]">
												Stop Loss
											</p>
											<p className="text-base font-bold text-white">
												{typeof tradeSetup.stopLoss === "object" &&
													tradeSetup.stopLoss !== null &&
													"level" in tradeSetup.stopLoss
													? String(tradeSetup.stopLoss.level)
													: "N/A"}
											</p>
										</div>
										<div>
											<p className="text-sm font-semibold text-[#B0B0B0]">
												Take Profit 1 (TP1)
											</p>
											<p className="text-base font-bold text-[#4CAF50]">
												{typeof tradeSetup.tp1 === "string"
													? tradeSetup.tp1
													: "N/A"}
											</p>
										</div>
										<div>
											<p className="text-sm font-semibold text-[#B0B0B0]">
												Take Profit 2 (TP2)
											</p>
											<p className="text-base font-bold text-[#4CAF50]">
												{typeof tradeSetup.tp2 === "string"
													? tradeSetup.tp2
													: "N/A"}
											</p>
										</div>
										<div>
											<p className="text-sm font-semibold text-[#B0B0B0]">
												Order Type
											</p>
											<p className="text-base font-bold text-white capitalize">
												{typeof tradeSetup.orderType === "string"
													? tradeSetup.orderType
													: "N/A"}
											</p>
										</div>
										<div>
											<p className="text-sm font-semibold text-[#B0B0B0]">
												Risk:Reward Ratio
											</p>
											<p className="text-base font-bold text-white">
												{typeof tradeSetup.riskRewardRatio === "string"
													? tradeSetup.riskRewardRatio
													: "N/A"}
											</p>
										</div>
									</div>

									{/* Reasoning */}
									{typeof tradeSetup.reasoning === "string" &&
										tradeSetup.reasoning && (
											<div className="pt-4 border-t border-[#424242]">
												<h4 className="text-sm font-semibold text-white mb-2">
													Why This Setup Is Good
												</h4>
												<div className="text-sm text-[#E0E0E0] leading-relaxed space-y-2">
													{formatReasoning(tradeSetup.reasoning)
														.split("\n")
														.filter((line) => line.trim())
														.map((line, index) => (
															<p
																key={index}
																className="text-sm text-[#E0E0E0] leading-relaxed"
															>
																{line.trim()}
															</p>
														))}
												</div>
											</div>
										)}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

