// Currency formatting
export function formatCurrency(amount: number | string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numAmount);
}

// Date formatting
export function formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(dateObj);
}

export function formatDateTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(dateObj);
}

export function formatTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(dateObj);
}

// Relative time formatting
export function formatRelativeTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'Baru saja';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} menit yang lalu`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} jam yang lalu`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} hari yang lalu`;
    }
}

// Phone number formatting
export function formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Format for Indonesian phone numbers
    if (cleaned.startsWith('0')) {
        return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (cleaned.startsWith('62')) {
        return cleaned.replace(/(\d{2})(\d{3})(\d{4})(\d{4})/, '+$1 $2-$3-$4');
    }

    return phone;
}

// Slug generation
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim();
}

// File size formatting
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Number formatting
export function formatNumber(num: number | string): string {
    const numValue = typeof num === 'string' ? parseFloat(num) : num;

    return new Intl.NumberFormat('id-ID').format(numValue);
}

// Percentage formatting
export function formatPercentage(value: number | string, decimals: number = 1): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    return `${numValue.toFixed(decimals)}%`;
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;

    return text.slice(0, maxLength) + '...';
}

// Capitalize first letter
export function capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Title case
export function titleCase(text: string): string {
    return text.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

// Pluralize
export function pluralize(count: number, singular: string, plural?: string): string {
    const pluralForm = plural || singular + 's';
    return count === 1 ? singular : pluralForm;
}