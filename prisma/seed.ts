import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Create a demo tenant
    const demoTenant = await prisma.tenant.create({
        data: {
            name: 'Demo Resto',
            email: 'demo@ordermenu.com',
            slug: 'demo-resto',
            isActive: true,
        },
    });

    console.log('Created demo tenant:', demoTenant);

    // Create admin user for demo tenant
    const hashedPassword = await hashPassword('admin123');

    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@ordermenu.com',
            password: hashedPassword,
            name: 'Admin User',
        },
    });

    console.log('Created admin user:', adminUser);

    // Link admin user to demo tenant
    const tenantUser = await prisma.tenantUser.create({
        data: {
            tenantId: demoTenant.id,
            userId: adminUser.id,
            role: 'admin',
        },
    });

    console.log('Created tenant user link:', tenantUser);

    // Create demo categories
    const categories = await Promise.all([
        prisma.category.create({
            data: {
                tenantId: demoTenant.id,
                name: 'Makanan',
                sortOrder: 1,
                isActive: true,
            },
        }),
        prisma.category.create({
            data: {
                tenantId: demoTenant.id,
                name: 'Minuman',
                sortOrder: 2,
                isActive: true,
            },
        }),
        prisma.category.create({
            data: {
                tenantId: demoTenant.id,
                name: 'Snack',
                sortOrder: 3,
                isActive: true,
            },
        }),
    ]);

    console.log('Created categories:', categories);

    // Create demo menu items
    const menuItems = await Promise.all([
        // Makanan items
        prisma.menuItem.create({
            data: {
                tenantId: demoTenant.id,
                categoryId: categories[0].id,
                name: 'Nasi Goreng Spesial',
                description: 'Nasi goreng dengan telur mata sapi, ayam suwir, dan kerupuk',
                basePrice: 25000,
                photoUrl: '/placeholder-food.jpg',
                availability: 'available',
            },
        }),
        prisma.menuItem.create({
            data: {
                tenantId: demoTenant.id,
                categoryId: categories[0].id,
                name: 'Mie Ayam Bakar',
                description: 'Mie ayam dengan bumbu bakar khas',
                basePrice: 28000,
                photoUrl: '/placeholder-food.jpg',
                availability: 'available',
            },
        }),
        // Minuman items
        prisma.menuItem.create({
            data: {
                tenantId: demoTenant.id,
                categoryId: categories[1].id,
                name: 'Es Teh Manis',
                description: 'Teh manis dingin dengan es batu',
                basePrice: 8000,
                photoUrl: '/placeholder-drink.jpg',
                availability: 'available',
            },
        }),
        prisma.menuItem.create({
            data: {
                tenantId: demoTenant.id,
                categoryId: categories[1].id,
                name: 'Es Jeruk',
                description: 'Jeruk segar peras dingin',
                basePrice: 12000,
                photoUrl: '/placeholder-drink.jpg',
                availability: 'available',
            },
        }),
        // Snack items
        prisma.menuItem.create({
            data: {
                tenantId: demoTenant.id,
                categoryId: categories[2].id,
                name: 'Kentang Goreng',
                description: 'Kentang goreng renyah dengan sambal',
                basePrice: 15000,
                photoUrl: '/placeholder-food.jpg',
                availability: 'available',
            },
        }),
        prisma.menuItem.create({
            data: {
                tenantId: demoTenant.id,
                categoryId: categories[2].id,
                name: 'Pisang Goreng',
                description: 'Pisang goreng dengan madu',
                basePrice: 18000,
                photoUrl: '/placeholder-food.jpg',
                availability: 'available',
            },
        }),
    ]);

    console.log('Created menu items:', menuItems);

    // Create variants for some menu items
    const variants = await Promise.all([
        // Nasi Goreng variants
        prisma.menuVariant.create({
            data: {
                tenantId: demoTenant.id,
                menuItemId: menuItems[0].id,
                name: 'Regular',
                priceDelta: 0,
                sortOrder: 1,
            },
        }),
        prisma.menuVariant.create({
            data: {
                tenantId: demoTenant.id,
                menuItemId: menuItems[0].id,
                name: 'Porsi Jumbo',
                priceDelta: 10000,
                sortOrder: 2,
            },
        }),
        // Mie Ayam variants
        prisma.menuVariant.create({
            data: {
                tenantId: demoTenant.id,
                menuItemId: menuItems[1].id,
                name: 'Regular',
                priceDelta: 0,
                sortOrder: 1,
            },
        }),
        prisma.menuVariant.create({
            data: {
                tenantId: demoTenant.id,
                menuItemId: menuItems[1].id,
                name: 'Extra Pedas',
                priceDelta: 5000,
                sortOrder: 2,
            },
        }),
    ]);

    console.log('Created variants:', variants);

    // Create modifiers for some menu items
    const modifiers = await Promise.all([
        // Nasi Goreng modifiers
        prisma.menuModifier.create({
            data: {
                tenantId: demoTenant.id,
                menuItemId: menuItems[0].id,
                name: 'Level Pedas',
                isRequired: true,
                maxSelect: 1,
                sortOrder: 1,
            },
        }),
        prisma.menuModifier.create({
            data: {
                tenantId: demoTenant.id,
                menuItemId: menuItems[0].id,
                name: 'Extra Topping',
                isRequired: false,
                maxSelect: 3,
                sortOrder: 2,
            },
        }),
        // Mie Ayam modifiers
        prisma.menuModifier.create({
            data: {
                tenantId: demoTenant.id,
                menuItemId: menuItems[1].id,
                name: 'Level Pedas',
                isRequired: true,
                maxSelect: 1,
                sortOrder: 1,
            },
        }),
    ]);

    console.log('Created modifiers:', modifiers);

    // Create modifier options
    const modifierOptions = await Promise.all([
        // Level Pedas options
        prisma.menuModifierOption.create({
            data: {
                tenantId: demoTenant.id,
                modifierId: modifiers[0].id,
                name: 'Normal',
                priceDelta: 0,
                sortOrder: 1,
            },
        }),
        prisma.menuModifierOption.create({
            data: {
                tenantId: demoTenant.id,
                modifierId: modifiers[0].id,
                name: 'Pedas',
                priceDelta: 2000,
                sortOrder: 2,
            },
        }),
        prisma.menuModifierOption.create({
            data: {
                tenantId: demoTenant.id,
                modifierId: modifiers[0].id,
                name: 'Extra Pedas',
                priceDelta: 3000,
                sortOrder: 3,
            },
        }),
        // Extra Topping options
        prisma.menuModifierOption.create({
            data: {
                tenantId: demoTenant.id,
                modifierId: modifiers[1].id,
                name: 'Telur',
                priceDelta: 5000,
                sortOrder: 1,
            },
        }),
        prisma.menuModifierOption.create({
            data: {
                tenantId: demoTenant.id,
                modifierId: modifiers[1].id,
                name: 'Ayam',
                priceDelta: 8000,
                sortOrder: 2,
            },
        }),
        prisma.menuModifierOption.create({
            data: {
                tenantId: demoTenant.id,
                modifierId: modifiers[1].id,
                name: 'Udang',
                priceDelta: 12000,
                sortOrder: 3,
            },
        }),
    ]);

    console.log('Created modifier options:', modifierOptions);

    // Create demo tables
    const tables = await Promise.all([
        prisma.table.create({
            data: {
                tenantId: demoTenant.id,
                code: 'T01',
                name: 'Meja 1',
                capacity: 4,
                qrcodeToken: 'demo-t01-token',
            },
        }),
        prisma.table.create({
            data: {
                tenantId: demoTenant.id,
                code: 'T02',
                name: 'Meja 2',
                capacity: 4,
                qrcodeToken: 'demo-t02-token',
            },
        }),
        prisma.table.create({
            data: {
                tenantId: demoTenant.id,
                code: 'T03',
                name: 'Meja 3',
                capacity: 6,
                qrcodeToken: 'demo-t03-token',
            },
        }),
        prisma.table.create({
            data: {
                tenantId: demoTenant.id,
                code: 'T04',
                name: 'Meja 4',
                capacity: 6,
                qrcodeToken: 'demo-t04-token',
            },
        }),
        prisma.table.create({
            data: {
                tenantId: demoTenant.id,
                code: 'T05',
                name: 'Meja 5',
                capacity: 8,
                qrcodeToken: 'demo-t05-token',
            },
        }),
    ]);

    console.log('Created tables:', tables);

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });