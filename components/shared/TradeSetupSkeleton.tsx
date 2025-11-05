import { Skeleton } from "@/components/ui/skeleton";

export function TradeSetupSkeleton() {
	return (
		<div className="mt-4 p-6 bg-[#212121] rounded-lg border border-[#424242]">
			<div className="flex justify-between items-center mb-4">
				<Skeleton className="h-7 w-32" />
				<Skeleton className="h-8 w-20 rounded-lg" />
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Direction */}
				<div>
					<Skeleton className="h-4 w-20 mb-2" />
					<Skeleton className="h-6 w-16" />
				</div>
				{/* Entry Price */}
				<div>
					<Skeleton className="h-4 w-24 mb-2" />
					<Skeleton className="h-6 w-32" />
				</div>
				{/* Stop Loss */}
				<div>
					<Skeleton className="h-4 w-20 mb-2" />
					<Skeleton className="h-6 w-24 mb-1" />
					<Skeleton className="h-3 w-full" />
				</div>
				{/* TP1 */}
				<div>
					<Skeleton className="h-4 w-32 mb-2" />
					<Skeleton className="h-6 w-20" />
				</div>
				{/* TP2 */}
				<div>
					<Skeleton className="h-4 w-32 mb-2" />
					<Skeleton className="h-6 w-20" />
				</div>
				{/* Order Type */}
				<div>
					<Skeleton className="h-4 w-24 mb-2" />
					<Skeleton className="h-6 w-16" />
				</div>
				{/* Risk:Reward */}
				<div>
					<Skeleton className="h-4 w-32 mb-2" />
					<Skeleton className="h-6 w-40" />
				</div>
			</div>
			{/* Quality Score */}
			<div className="mt-4 pt-4 border-t border-[#424242]">
				<Skeleton className="h-4 w-32 mb-2" />
				<div className="flex items-center gap-2 mt-2">
					<Skeleton className="flex-1 h-4 rounded-full" />
					<Skeleton className="h-6 w-12" />
				</div>
			</div>
			{/* Reasoning Section */}
			<div className="mt-4 pt-4 border-t border-[#424242]">
				<Skeleton className="h-6 w-40 mb-3" />
				<div className="space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
				</div>
			</div>
		</div>
	);
}

