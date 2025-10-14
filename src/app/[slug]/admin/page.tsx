import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantBySlug, getTenantStats } from "@/lib/tenant";
import { notFound } from "next/navigation";
import { Utensils, ShoppingCart, Table, Users, TrendingUp, Clock } from "lucide-react";

interface AdminDashboardProps {
    params: {
        slug: string;
    };
}

export default async function AdminDashboard({ params }: AdminDashboardProps) {
    const { slug } = await params;

    // Get tenant info
    const tenant = await getTenantBySlug(slug);

    if (!tenant) {
        notFound();
    }

    // Get tenant stats
    const stats = await getTenantStats(tenant.id);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">
                    Selamat datang di dashboard {tenant.name}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Menu</CardTitle>
                        <Utensils className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalMenuItems}</div>
                        <p className="text-xs text-muted-foreground">
                            Menu items yang tersedia
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            Semua pesanan
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Meja</CardTitle>
                        <Table className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalTables}</div>
                        <p className="text-xs text-muted-foreground">
                            Meja yang tersedia
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sesi Aktif</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeSessions}</div>
                        <p className="text-xs text-muted-foreground">
                            Pelanggan yang sedang aktif
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Utensils className="h-5 w-5" />
                            Tambah Menu
                        </CardTitle>
                        <CardDescription>
                            Tambah menu baru ke katalog
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <a
                            href={`/${slug}/admin/menu-items/new`}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 w-full"
                        >
                            Tambah Menu
                        </a>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Table className="h-5 w-5" />
                            Kelola Meja
                        </CardTitle>
                        <CardDescription>
                            Atur meja dan QR code
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <a
                            href={`/${slug}/admin/tables`}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 w-full"
                        >
                            Kelola Meja
                        </a>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Lihat Pesanan
                        </CardTitle>
                        <CardDescription>
                            Kelola pesanan pelanggan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <a
                            href={`/${slug}/admin/orders`}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 w-full"
                        >
                            Lihat Pesanan
                        </a>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Aktivitas Terbaru
                    </CardTitle>
                    <CardDescription>
                        Pesanan dan aktivitas terkini
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Belum ada aktivitas terbaru</p>
                        <p className="text-sm">
                            Pesanan baru akan muncul di sini
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}