import type { DashboardProps } from "../types";

type MemberDashboardProps = DashboardProps;

export function MemberDashboard({ companyId }: MemberDashboardProps) {
	return (
		<div className="flex flex-col p-8 gap-4">
			<h1 className="text-9 font-bold">Member Dashboard</h1>
			<p className="text-3 text-gray-10">Member view content</p>
		</div>
	);
}

