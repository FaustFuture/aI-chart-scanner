import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { AdminDashboard } from "@/features/dashboard/components/AdminDashboard";
import { MemberDashboard } from "@/features/dashboard/components/MemberDashboard";

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	const { companyId } = await params;
	// Ensure the user is logged in on whop.
	const { userId } = await whopsdk.verifyUserToken(await headers());

	// Fetch the necessary data we want from whop.
	const access = await whopsdk.users.checkAccess(companyId, { id: userId });

	// Check if user is admin based on access_level
	const isAdmin = access.access_level === "admin";

	if (isAdmin) {
		return <AdminDashboard companyId={companyId} />;
	}

	return <MemberDashboard companyId={companyId} />;
}
