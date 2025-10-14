import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-aqua-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-teal-800 mb-4">
            OrderMenu
          </h1>
          <p className="text-lg text-teal-600 max-w-2xl mx-auto">
            Sistem pemesanan menu F&B multi-tenant yang modern dan mudah digunakan
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-teal-700">Untuk Restoran & Cafe</CardTitle>
              <CardDescription>
                Kelola menu, pesanan, dan pelanggan dengan mudah dalam satu platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                  <span>Multi-tenant dengan data terisolasi</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                  <span>Manajemen menu dengan variant & modifier</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                  <span>Real-time order tracking</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                  <span>Laporan penjualan</span>
                </li>
              </ul>
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                Daftar Sekarang
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-purple-700">Untuk Pelanggan</CardTitle>
              <CardDescription>
                Pesan menu favorit Anda dengan mudah dan cepat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span>Pesan via QR code (Dine In)</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span>Custom menu dengan variant & modifier</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span>Tracking status order real-time</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  <span>Pembayaran mudah</span>
                </li>
              </ul>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Cari Restoran
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-aqua-blue-700">Status Pengembangan</CardTitle>
            <CardDescription className="text-center">
              Progress Task 1: Setup & Konfigurasi Awal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white mr-3">
                  ✓
                </div>
                <div>
                  <h3 className="font-medium">Inisialisasi proyek Next.js dengan TypeScript</h3>
                  <p className="text-sm text-muted-foreground">Selesai</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white mr-3">
                  ✓
                </div>
                <div>
                  <h3 className="font-medium">Setup TailwindCSS dan Shadcn/UI</h3>
                  <p className="text-sm text-muted-foreground">Selesai</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white mr-3">
                  ✓
                </div>
                <div>
                  <h3 className="font-medium">Konfigurasi environment variables</h3>
                  <p className="text-sm text-muted-foreground">Selesai</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white mr-3">
                  ~
                </div>
                <div>
                  <h3 className="font-medium">Konfigurasi Supabase (database & auth)</h3>
                  <p className="text-sm text-muted-foreground">Dalam proses</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white mr-3">
                  ○
                </div>
                <div>
                  <h3 className="font-medium">Setup Prisma ORM</h3>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white mr-3">
                  ○
                </div>
                <div>
                  <h3 className="font-medium">Buat struktur folder dan file dasar</h3>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <footer className="text-center text-gray-600">
          <p>© 2024 OrderMenu. Dibuat dengan Next.js, TypeScript, dan TailwindCSS.</p>
        </footer>
      </div>
    </div>
  );
}
