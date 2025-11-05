import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsSkeleton() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<Skeleton className="h-8 w-48" />
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* Stat Card 1 */}
				<div className="p-6 bg-[#212121] rounded-lg border border-[#424242]">
					<div className="flex items-center gap-3 mb-4">
						<Skeleton className="w-9 h-9 rounded-lg" />
						<div className="flex-1">
							<Skeleton className="h-4 w-32 mb-2" />
							<Skeleton className="h-8 w-20" />
						</div>
					</div>
				</div>

				{/* Stat Card 2 */}
				<div className="p-6 bg-[#212121] rounded-lg border border-[#424242]">
					<div className="flex items-center gap-3 mb-4">
						<Skeleton className="w-9 h-9 rounded-lg" />
						<div className="flex-1">
							<Skeleton className="h-4 w-32 mb-2" />
							<Skeleton className="h-8 w-20" />
						</div>
					</div>
				</div>

				{/* Stat Card 3 */}
				<div className="p-6 bg-[#212121] rounded-lg border border-[#424242]">
					<div className="flex items-center gap-3 mb-4">
						<Skeleton className="w-9 h-9 rounded-lg" />
						<div className="flex-1">
							<Skeleton className="h-4 w-32 mb-2" />
							<Skeleton className="h-8 w-20" />
						</div>
					</div>
				</div>
			</div>

			{/* Top Users Section */}
			<div className="p-6 bg-[#212121] rounded-lg border border-[#424242]">
				<div className="flex items-center gap-2 mb-4">
					<Skeleton className="w-5 h-5" />
					<Skeleton className="h-6 w-24" />
				</div>
				<div className="space-y-3">
					{Array.from({ length: 5 }).map((_, index) => (
						<div
							key={index}
							className="flex items-center justify-between p-3 bg-[#1E1E1E] rounded-lg border border-[#424242]"
						>
							<div className="flex items-center gap-3">
								<Skeleton className="w-8 h-8 rounded-full" />
								<div>
									<Skeleton className="h-4 w-32 mb-1" />
									<Skeleton className="h-3 w-40" />
								</div>
							</div>
							<div className="text-right">
								<Skeleton className="h-6 w-8 mb-1" />
								<Skeleton className="h-3 w-12" />
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Top Setups Section */}
			<div className="p-6 bg-[#212121] rounded-lg border border-[#424242]">
				<div className="flex items-center gap-2 mb-4">
					<Skeleton className="w-5 h-5" />
					<Skeleton className="h-6 w-48" />
				</div>
				<div className="space-y-3">
					{Array.from({ length: 5 }).map((_, index) => (
						<div
							key={index}
							className="p-4 bg-[#1E1E1E] rounded-lg border border-[#424242]"
						>
							<div className="flex items-start justify-between mb-2">
								<div className="flex items-center gap-3">
									<Skeleton className="w-6 h-6 rounded-full" />
									<div>
										<div className="flex items-center gap-2 mb-1">
											<Skeleton className="h-5 w-12 rounded" />
											<Skeleton className="h-5 w-24" />
										</div>
										<Skeleton className="h-3 w-32" />
									</div>
								</div>
							</div>
							<div className="mt-3 grid grid-cols-2 gap-3">
								<div>
									<Skeleton className="h-3 w-20 mb-1" />
									<Skeleton className="h-4 w-24" />
								</div>
								<div>
									<Skeleton className="h-3 w-24 mb-1" />
									<Skeleton className="h-4 w-32" />
								</div>
							</div>
							<Skeleton className="h-3 w-40 mt-2" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

