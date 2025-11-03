"use client";

import { useState } from "react";
import type { DashboardProps } from "../types";

type AdminDashboardProps = DashboardProps;

export function AdminDashboard({ companyId }: AdminDashboardProps) {
	const [isAdminView, setIsAdminView] = useState(true);

	return (
		<div className="flex flex-col p-8 gap-4">
			<div className="flex justify-between items-center gap-4">
				<h1 className="text-9 font-bold">Admin Dashboard</h1>
				<label className="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={isAdminView}
						onChange={(e) => setIsAdminView(e.target.checked)}
						className="w-4 h-4"
					/>
					<span className="text-3 text-gray-10">
						{isAdminView ? "Admin View" : "Member View"}
					</span>
				</label>
			</div>
			{isAdminView ? (
				<p className="text-3 text-gray-10">Admin view content</p>
			) : (
				<p className="text-3 text-gray-10">Member view content</p>
			)}
		</div>
	);
}

