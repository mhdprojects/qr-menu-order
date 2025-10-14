'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Table, Star, Share2, Phone, LocateIcon, Search } from 'lucide-react';
import type { Tenant } from '@/types/auth';

interface MenuHeaderProps {
    tenant: Tenant;
    tableCode?: string;
    cartItemCount: number;
    onCartClick: () => void;
}

export function MenuHeader({
    tenant,
    tableCode,
    cartItemCount,
    onCartClick
}: MenuHeaderProps) {
    return (
        <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-solid border-[#F2F2F2] dark:border-white/10">
            <div className="px-4 md:px-10 lg:px-20 max-w-7xl mx-auto">
                <div className="flex items-center justify-between whitespace-nowrap py-3">
                    {/* Restaurant Info */}
                    <div className="flex items-center gap-4 text-[#111717] dark:text-white">
                        <div className="size-8 text-primary">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_6_330)">
                                    <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                                </g>
                                <defs>
                                    <clipPath id="clip0_6_330"><rect fill="white" height="48" width="48"></rect></clipPath>
                                </defs>
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold tracking-[-0.015em]">{tenant.name}</h1>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex flex-1 justify-end items-center gap-4">
                        {/* Search */}
                        <label className="flex flex-col min-w-40 !h-10 max-w-64">
                            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                                <div className="text-[#648687] flex border-none bg-black/5 dark:bg-white/5 items-center justify-center pl-4 rounded-l-lg border-r-0">
                                    <Search />
                                </div>
                                <input
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111717] dark:text-white focus:outline-0 focus:ring-0 border-none bg-black/5 dark:bg-white/5 focus:border-none h-full placeholder:text-[#648687] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                                    placeholder="Search menu..."
                                    value=""
                                />
                            </div>
                        </label>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10">
                                <LocateIcon /> View Location
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10">
                                <Phone /> Contact
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10">
                                <Share2 /> Share
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

// Restaurant Hero Section
interface RestaurantHeroProps {
    tenant: Tenant;
    tableCode?: string;
    cartItemCount: number;
    onCartClick: () => void;
}

export function RestaurantHero({
    tenant,
    tableCode,
    cartItemCount,
    onCartClick
}: RestaurantHeroProps) {
    return (
        <div className="py-8">
            <div className="flex flex-wrap justify-between gap-4 items-center">
                <div className="flex min-w-72 flex-col gap-2">
                    <p className="text-4xl font-black leading-tight tracking-[-0.033em] text-[#111717] dark:text-white">
                        {tenant.name}
                    </p>
                    <p className="text-[#648687] dark:text-gray-400 text-base font-normal leading-normal flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                            <Star className="text-accent text-lg" />
                            4.5
                        </span>
                        <span>|</span>
                        <span>Italian</span>
                        <span>|</span>
                        <span>123 Main St, Anytown</span>
                        <span>|</span>
                        <span>Open 11am - 10pm</span>
                    </p>
                    <p className="text-[#648687] dark:text-gray-400 text-sm font-normal leading-normal">
                        Est. Time: 30-45 mins | Service Fee: $2.50
                    </p>

                    {tableCode && (
                        <div className="flex items-center gap-2 mt-2">
                            <Table className="h-4 w-4" />
                            <Badge variant="outline">
                                Meja {tableCode}
                            </Badge>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Category Tabs
interface CategoryTabsProps {
    categories: Array<{ id: string; name: string; isActive: boolean }>;
    selectedCategory: string | null;
    onCategorySelect: (categoryId: string) => void;
}

export function CategoryTabs({ categories, selectedCategory, onCategorySelect }: CategoryTabsProps) {
    return (
        <div className="sticky top-[61px] z-10 bg-background-light dark:bg-background-dark py-4 -mx-4 md:-mx-10 lg:-mx-20 px-4 md:px-10 lg:px-20 border-b border-solid border-[#F2F2F2] dark:border-white/10">
            <div className="flex gap-3 overflow-x-auto pb-2 -mb-2">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg pl-4 pr-4 cursor-pointer transition-colors ${selectedCategory === category.id
                            ? 'bg-primary text-white'
                            : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#333333] dark:text-white'
                            }`}
                        onClick={() => onCategorySelect(category.id)}
                    >
                        <p className="text-sm font-medium leading-normal">{category.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Floating Cart Button
interface FloatingCartButtonProps {
    cartItemCount: number;
    totalPrice: number;
    onCartClick: () => void;
}

export function FloatingCartButton({ cartItemCount, totalPrice, onCartClick }: FloatingCartButtonProps) {
    return (
        <div className="fixed bottom-0 right-5 z-20">
            <div className="flex justify-end overflow-hidden px-2 py-1">
                <Button
                    onClick={onCartClick}
                    size="lg"
                    className="shadow-lg bg-primary text-white transform hover:scale-105 transition-transform rounded-full h-16 gap-3 pl-5 pr-6"
                >
                    <div className="relative">
                        <ShoppingCart className="h-6 w-6" />
                        {cartItemCount > 0 && (
                            <span className="absolute -top-3.5 -right-3 bg-accent text-white text-xs font-bold rounded-full size-5 flex items-center justify-center">
                                {cartItemCount}
                            </span>
                        )}
                    </div>
                    <span className="truncate">
                        {cartItemCount > 0 ? `View Cart - $${totalPrice.toFixed(2)}` : 'View Cart'}
                    </span>
                </Button>
            </div>
        </div>
    );
}