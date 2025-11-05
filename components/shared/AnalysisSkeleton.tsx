import { Skeleton } from "@/components/ui/skeleton";

export function AnalysisSkeleton() {
	return (
		<div className="mt-4 p-4 bg-[#212121] rounded-lg border border-[#424242]">
			<div className="flex justify-between items-center mb-2">
				<Skeleton className="h-6 w-32" />
				<Skeleton className="h-5 w-24" />
			</div>
			<div className="space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-3/4" />
			</div>
		</div>
	);
}

