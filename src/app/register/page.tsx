import { TenantRegisterForm } from "@/components/forms/tenant-register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 to-aqua-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-teal-800 mb-2">OrderMenu</h1>
                    <p className="text-teal-600">Daftarkan restoran atau cafe Anda</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-teal-700">
                            Registrasi Tenant
                        </CardTitle>
                        <CardDescription className="text-center">
                            Buat akun untuk mulai mengelola menu dan pesanan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TenantRegisterForm />
                    </CardContent>
                </Card>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Sudah punya akun?{" "}
                        <a href="/login" className="text-teal-600 hover:underline">
                            Login di sini
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}