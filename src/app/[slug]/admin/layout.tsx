import { getTenantBySlug, getCurrentUserId } from "@/lib/tenant";
import { notFound, redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";

interface AdminLayoutProps {
    children: React.ReactNode;
    params: {
        slug: string;
    };
}

export default async function AdminLayout({
    children,
    params,
}: AdminLayoutProps) {
    const { slug } = await params;

    // Get tenant info
    const tenant = await getTenantBySlug(slug);

    if (!tenant) {
        notFound();
    }

    // Get current user ID (this would come from middleware or session)
    const userId = await getCurrentUserId();

    if (!userId) {
        redirect(`/${slug}/login`);
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="flex h-screen">
                {/* Sidebar */}
                <AdminSidebar tenantSlug={slug} tenantName={tenant.name} />

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <AdminHeader
                        tenantSlug={slug}
                        tenantName={tenant.name}
                        userName="Admin User" // This would come from user data
                    />

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}