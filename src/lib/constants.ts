// Brand Colors
export const COLORS = {
    primary: '#18A4A5',    // Teal
    secondary: '#27C1E4',  // Aqua Blue
    accent: '#A14CD7',     // Purple Rose
    success: '#10B981',    // Green
    warning: '#F59E0B',    // Yellow
    error: '#EF4444',      // Red
    neutral: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    }
};

// Typography
export const TYPOGRAPHY = {
    fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
    },
    fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
    },
    fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
    },
};

// Spacing
export const SPACING = {
    px: '1px',
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
};

// Border Radius
export const BORDER_RADIUS = {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
};

// Breakpoints
export const BREAKPOINTS = {
    sm: '640px',   // Small screens
    md: '768px',   // Medium screens
    lg: '1024px',  // Large screens
    xl: '1280px',  // Extra large screens
    '2xl': '1536px', // 2X large screens
};

// Order Status
export const ORDER_STATUS = {
    PLACED: 'placed',
    PREPARING: 'preparing',
    READY: 'ready',
    SERVED: 'served',
    CANCELED: 'canceled',
} as const;

// Order Type
export const ORDER_TYPE = {
    DINE_IN: 'dine_in',
    TAKE_AWAY: 'take_away',
} as const;

// Menu Availability
export const MENU_AVAILABILITY = {
    AVAILABLE: 'available',
    UNAVAILABLE: 'unavailable',
} as const;

// User Roles
export const USER_ROLES = {
    ADMIN: 'admin',
    STAFF: 'staff',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        REGISTER: '/api/auth/register',
        ME: '/api/auth/me',
    },
    TENANTS: {
        REGISTER: '/api/tenants/register',
        BY_SLUG: '/api/tenants/[slug]',
        CHECK_SLUG: '/api/tenants/check-slug',
    },
    MENU: {
        CATEGORIES: '/api/[slug]/categories',
        ITEMS: '/api/[slug]/menu-items',
        VARIANTS: '/api/[slug]/variants',
        MODIFIERS: '/api/[slug]/modifiers',
    },
    ORDERS: {
        LIST: '/api/[slug]/orders',
        CREATE: '/api/[slug]/orders',
        UPDATE: '/api/[slug]/orders/[id]',
        UPDATE_STATUS: '/api/[slug]/orders/[id]/status',
    },
    TABLES: {
        LIST: '/api/[slug]/tables',
        CREATE: '/api/[slug]/tables',
        UPDATE: '/api/[slug]/tables/[id]',
        QR_CODE: '/api/[slug]/tables/[id]/qr',
    },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    AUTH: {
        INVALID_CREDENTIALS: 'Email atau password salah',
        SESSION_EXPIRED: 'Sesi telah berakhir, silakan login kembali',
        ACCESS_DENIED: 'Akses ditolak',
    },
    VALIDATION: {
        REQUIRED_FIELD: 'Field ini wajib diisi',
        INVALID_EMAIL: 'Email tidak valid',
        PASSWORD_MIN_LENGTH: 'Password minimal 6 karakter',
        PASSWORD_MISMATCH: 'Password tidak cocok',
    },
    TENANT: {
        NOT_FOUND: 'Tenant tidak ditemukan',
        SLUG_EXISTS: 'Slug sudah digunakan',
        INACTIVE: 'Tenant tidak aktif',
    },
    ORDER: {
        NOT_FOUND: 'Order tidak ditemukan',
        INVALID_STATUS: 'Status order tidak valid',
        CANNOT_CANCEL: 'Order tidak dapat dibatalkan',
    },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: 'Login berhasil',
        LOGOUT_SUCCESS: 'Logout berhasil',
        REGISTER_SUCCESS: 'Registrasi berhasil',
    },
    TENANT: {
        REGISTER_SUCCESS: 'Tenant berhasil didaftarkan',
        UPDATE_SUCCESS: 'Tenant berhasil diperbarui',
    },
    MENU: {
        CREATE_SUCCESS: 'Menu berhasil ditambahkan',
        UPDATE_SUCCESS: 'Menu berhasil diperbarui',
        DELETE_SUCCESS: 'Menu berhasil dihapus',
    },
    ORDER: {
        CREATE_SUCCESS: 'Order berhasil dibuat',
        UPDATE_SUCCESS: 'Order berhasil diperbarui',
        STATUS_UPDATE_SUCCESS: 'Status order berhasil diperbarui',
    },
} as const;