# 🍽️ New Order Menu - Food & Beverage Ordering System

Sistem pemesanan menu digital untuk restoran dan kafe dengan dukungan multi-tenant, manajemen menu lengkap, dan pengalaman pengguna yang modern.

## ✨ Fitur Utama

### 🏪 **Multi-Tenant System**

- Setiap restoran memiliki subdomain unik (contoh: `resto-anda.domain.com`)
- Dashboard admin terpisah untuk setiap tenant
- Isolasi data penuh antar tenant

### 🍕 **Manajemen Menu Lengkap**

- **Kategori Menu**: Kelompokkan menu berdasarkan jenis (Appetizers, Main Course, Drinks, dll)
- **Menu Items**: Tambah menu dengan foto, deskripsi, dan harga dasar
- **Variants**: Opsi ukuran (Regular, Large) dengan harga berbeda
- **Modifiers**: Tambahan seperti Ice, Sugar, Toppings dengan harga tambahan
- **Ketersediaan**: Kontrol status available/unavailable per menu

### 🛒 **Pengalaman Pemesanan Modern**

- **Responsive Design**: Optimal di desktop, tablet, dan mobile
- **Dark Mode**: Dukungan tema gelap/terang
- **Real-time Cart**: Keranjang belanja dengan kalkulasi otomatis
- **Menu Customization**: Pilih variant dan modifier saat pemesan
- **QR Code Integration**: Scan meja untuk dine-in ordering

### 📊 **Dashboard Admin**

- **Ringkasan Order**: Pantau pesanan real-time
- **Manajemen Meja**: Generate QR code untuk setiap meja
- **Laporan Penjualan**: Statistik harian/mingguan/bulanan
- **Manajemen Pelanggan**: Basis data pelanggan

### 💰 **Sistem Pembayaran**

- **Multiple Payment Methods**: Credit Card, PayPal, dll
- **Tax Calculation**: Otomatis hitung pajak 10%
- **Service Charge**: Biaya service 5% untuk dine-in
- **Order Tracking**: Status pesanan real-time

## 🚀 Teknologi

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Shadcn/UI
- **Database**: PostgreSQL dengan Prisma ORM
- **Authentication**: Custom JWT
- **Real-time**: Supabase Realtime
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod

## 📁 Struktur Proyek

```
src/
├── app/                          # Next.js App Router
│   ├── [slug]/                   # Dynamic routes untuk tenant
│   │   ├── page.tsx             # Halaman menu publik
│   │   ├── checkout/            # Halaman checkout
│   │   └── admin/               # Dashboard admin
│   │       ├── categories/      # Manajemen kategori
│   │       ├── menu-items/      # Manajemen menu
│   │       └── tables/          # Manajemen meja
│   └── register/                # Registrasi tenant baru
├── components/                  # Reusable components
│   ├── ui/                      # Shadcn/UI components
│   ├── menu/                    # Menu-related components
│   ├── cart/                    # Shopping cart components
│   ├── checkout/                # Checkout components
│   ├── admin/                   # Admin dashboard components
│   └── layout/                  # Layout components
├── hooks/                       # Custom React hooks
├── lib/                         # Utilities & configurations
│   ├── prisma.ts               # Database client
│   ├── validations.ts          # Zod schemas
│   ├── format.ts              # Currency & date formatting
│   └── auth.ts                 # Authentication utilities
└── types/                       # TypeScript type definitions
```

## 🛠️ Instalasi & Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm/yarn/pnpm

### Langkah Instalasi

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd new-order-menu
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` dengan konfigurasi database dan secrets:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/new_order_menu"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Setup database**

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Run development server**

   ```bash
   npm run dev
   ```

6. **Buka browser**

   ```
   http://localhost:3000
   ```

## 📊 Database Schema

Proyek menggunakan PostgreSQL dengan Prisma ORM. Schema utama:

- **Tenants**: Data restoran/kafe
- **Users & TenantUsers**: Sistem autentikasi multi-tenant
- **Categories**: Kategori menu
- **MenuItems**: Item menu dengan variants dan modifiers
- **Tables & TableSessions**: Manajemen meja untuk dine-in
- **Orders & OrderItems**: Sistem pemesanan
- **Customers**: Basis data pelanggan

## 🎨 Design System

### Color Palette

- **Primary**: `#18a3a5` (Teal)
- **Secondary**: `#A14CD7` (Purple)
- **Accent**: `#F5A623` (Orange)
- **Background**: `#f6f8f8` (Light), `#112021` (Dark)

### Typography

- **Font Family**: Plus Jakarta Sans
- **Material Symbols**: Untuk icons

### Components

- **UI Library**: Shadcn/UI dengan TailwindCSS
- **Responsive**: Mobile-first approach
- **Accessibility**: ARIA compliant

## 🔐 Authentication Flow

1. **Tenant Registration**: Pemilik resto daftar akun
2. **Admin Login**: Login ke dashboard admin
3. **Menu Access**: Pelanggan akses menu via QR code atau direct URL
4. **Order Placement**: Sistem checkout dengan informasi pelanggan

## 📱 User Journey

### Customer Flow

1. **Scan QR** atau akses URL restoran
2. **Browse Menu** dengan filter kategori
3. **Customize Order** pilih variant dan modifier
4. **Add to Cart** dengan kalkulasi harga real-time
5. **Checkout** dengan informasi pengiriman
6. **Track Order** status pesanan real-time

### Admin Flow

1. **Setup Restaurant** konfigurasi tenant
2. **Manage Categories** tambah/edit kategori menu
3. **Add Menu Items** dengan foto dan deskripsi
4. **Configure Variants** ukuran dan harga berbeda
5. **Setup Modifiers** opsi tambahan
6. **Monitor Orders** real-time order tracking
7. **Generate QR Codes** untuk setiap meja

## 🚀 Deployment

### Environment Variables Production

```env
DATABASE_URL="postgresql://prod-url"
NEXTAUTH_SECRET="production-secret"
NEXTAUTH_URL="https://your-domain.com"
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-key"
```

### Build Commands

```bash
# Build untuk production
npm run build

# Start production server
npm run start
```

## 📚 API Documentation

API endpoints tersedia di `/api/[slug]/` dengan dokumentasi lengkap untuk:

- Menu management
- Order processing
- Table management
- Customer management

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

Untuk dukungan atau pertanyaan, silakan buat issue di repository ini atau hubungi tim development.

---

**Dibangun dengan ❤️ untuk revolusi pemesanan makanan digital**
