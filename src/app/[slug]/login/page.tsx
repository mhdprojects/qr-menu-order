import { LoginForm } from "@/components/forms/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantBySlug } from "@/lib/tenant";
import { notFound } from "next/navigation";

interface LoginPageProps {
    params: {
        slug: string;
    };
}

export default async function LoginPage({ params }: LoginPageProps) {
    const { slug } = await params;

    // Get tenant info
    const tenant = await getTenantBySlug(slug);

    if (!tenant) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-aqua-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-teal-800 mb-2">OrderMenu</h1>
                    <p className="text-teal-600">Login ke {tenant.name}</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-teal-700">
                            Login Admin
                        </CardTitle>
                        <CardDescription className="text-center">
                            Masuk ke dashboard untuk mengelola {tenant.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoginForm tenantSlug={slug} tenantName={tenant.name} />
                    </CardContent>
                </Card>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Belum punya akun?{" "}
                        <a href="/register" className="text-teal-600 hover:underline">
                            Daftar di sini
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}