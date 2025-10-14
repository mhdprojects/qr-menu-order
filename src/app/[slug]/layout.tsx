import { getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";
import { AuthProvider } from "@/hooks/use-auth";

interface TenantLayoutProps {
    children: React.ReactNode;
    params: {
        slug: string;
    };
}

export default async function TenantLayout({
    children,
    params,
}: TenantLayoutProps) {
    const { slug } = await params;

    // Get tenant info
    const tenant = await getTenantBySlug(slug);

    if (!tenant) {
        notFound();
    }

    return (
        <AuthProvider>
            <div className="min-h-screen bg-background">
                {/* Tenant context provider would go here */}
                {children}
            </div>
        </AuthProvider>
    );
}