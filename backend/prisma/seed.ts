import {
  PrismaClient,
  Role,
  FinancialType,
  DebtType,
  DebtStatus,
  PaymentMethod,
  TransactionStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Helper function untuk generate random date dalam range
function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

// Helper function untuk generate invoice number
function generateInvoiceNumber(index: number, date: Date): string {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `INV-${dateStr}-${String(index).padStart(4, "0")}`;
}

async function main() {
  console.log("🌱 Starting restaurant seed...\n");

  // ==================== USERS ====================
  console.log("👤 Creating users...");
  const hashedPassword = await bcrypt.hash("Passzein1", 12);

  const admin = await prisma.user.upsert({
    where: { email: "zen@gmail.com" },
    update: {
      password: hashedPassword,
      isActive: true,
      name: "Zen Admin",
      phone: "081234567890",
      role: Role.ADMIN,
      refreshToken: null,
    },
    create: {
      email: "zen@gmail.com",
      password: hashedPassword,
      name: "Zen Admin",
      role: Role.ADMIN,
      phone: "081234567890",
      isActive: true,
      refreshToken: null,
    },
  });
  console.log("✅ Created admin user:", admin.email);

  // Create cashier users
  const cashierPassword = await bcrypt.hash("Cashier123", 12);
  const cashiers = await Promise.all([
    prisma.user.upsert({
      where: { email: "siti@zenresto.com" },
      update: {},
      create: {
        email: "siti@zenresto.com",
        password: cashierPassword,
        name: "Siti Rahayu",
        role: Role.CASHIER,
        phone: "081298765432",
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "budi@zenresto.com" },
      update: {},
      create: {
        email: "budi@zenresto.com",
        password: cashierPassword,
        name: "Budi Santoso",
        role: Role.CASHIER,
        phone: "081387654321",
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: "dewi@zenresto.com" },
      update: {},
      create: {
        email: "dewi@zenresto.com",
        password: cashierPassword,
        name: "Dewi Lestari",
        role: Role.CASHIER,
        phone: "081456789012",
        isActive: true,
      },
    }),
  ]);
  console.log("✅ Created cashiers:", cashiers.length);

  // ==================== STORE SETTINGS ====================
  console.log("\n🏪 Creating store settings...");
  await prisma.storeSettings.upsert({
    where: { id: "store-main" },
    update: {},
    create: {
      id: "store-main",
      name: "Zen Restaurant & Cafe",
      address: "Jl. Sudirman No. 123, Jakarta Pusat 10220",
      phone: "021-5551234",
      email: "info@zenresto.com",
      website: "www.zenresto.com",
      receiptHeader:
        "🍽️ ZEN RESTAURANT & CAFE 🍽️\nMasakan Nusantara & International",
      receiptFooter: "Terima kasih telah berkunjung!\nFollow us @zenresto",
      showLogoOnReceipt: true,
      showAddressOnReceipt: true,
      showPhoneOnReceipt: true,
    },
  });
  console.log("✅ Store settings created");

  // ==================== CATEGORIES ====================
  console.log("\n📁 Creating categories...");
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: "cat-makanan-utama" },
      update: {},
      create: {
        id: "cat-makanan-utama",
        name: "Makanan Utama",
        description: "Hidangan utama nasi, mie, dan lauk pauk",
        color: "#EF4444",
        icon: "utensils",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-appetizer" },
      update: {},
      create: {
        id: "cat-appetizer",
        name: "Appetizer",
        description: "Hidangan pembuka dan snack",
        color: "#F59E0B",
        icon: "cookie",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-minuman" },
      update: {},
      create: {
        id: "cat-minuman",
        name: "Minuman",
        description: "Berbagai jenis minuman segar dan hangat",
        color: "#3B82F6",
        icon: "coffee",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-dessert" },
      update: {},
      create: {
        id: "cat-dessert",
        name: "Dessert",
        description: "Hidangan penutup dan makanan manis",
        color: "#EC4899",
        icon: "ice-cream",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-seafood" },
      update: {},
      create: {
        id: "cat-seafood",
        name: "Seafood",
        description: "Hidangan laut segar",
        color: "#06B6D4",
        icon: "fish",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-nusantara" },
      update: {},
      create: {
        id: "cat-nusantara",
        name: "Masakan Nusantara",
        description: "Kuliner khas Indonesia",
        color: "#10B981",
        icon: "fire",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-western" },
      update: {},
      create: {
        id: "cat-western",
        name: "Western Food",
        description: "Hidangan ala barat",
        color: "#8B5CF6",
        icon: "burger",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-paket" },
      update: {},
      create: {
        id: "cat-paket",
        name: "Paket Hemat",
        description: "Paket bundling hemat untuk keluarga",
        color: "#F97316",
        icon: "gift",
      },
    }),
  ]);
  console.log("✅ Created categories:", categories.length);

  // ==================== PRODUCTS ====================
  console.log("\n🍕 Creating products...");
  const products = await Promise.all([
    // === MAKANAN UTAMA ===
    prisma.product.upsert({
      where: { sku: "MU-001" },
      update: {},
      create: {
        sku: "MU-001",
        name: "Nasi Goreng Spesial",
        description: "Nasi goreng dengan telur, ayam, udang, dan sayuran segar",
        price: 35000,
        costPrice: 18000,
        stock: 100,
        minStock: 20,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-makanan-utama",
      },
    }),
    prisma.product.upsert({
      where: { sku: "MU-002" },
      update: {},
      create: {
        sku: "MU-002",
        name: "Mie Goreng Jawa",
        description: "Mie goreng dengan bumbu khas Jawa, telur dan sayuran",
        price: 32000,
        costPrice: 15000,
        stock: 80,
        minStock: 15,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-makanan-utama",
      },
    }),
    prisma.product.upsert({
      where: { sku: "MU-003" },
      update: {},
      create: {
        sku: "MU-003",
        name: "Ayam Goreng Kremes",
        description: "Ayam goreng dengan kremesan gurih renyah",
        price: 38000,
        costPrice: 20000,
        stock: 60,
        minStock: 10,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-makanan-utama",
      },
    }),
    prisma.product.upsert({
      where: { sku: "MU-004" },
      update: {},
      create: {
        sku: "MU-004",
        name: "Nasi Campur Bali",
        description:
          "Nasi dengan lauk khas Bali: ayam suwir, sate lilit, lawar",
        price: 45000,
        costPrice: 25000,
        stock: 50,
        minStock: 10,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-makanan-utama",
      },
    }),
    prisma.product.upsert({
      where: { sku: "MU-005" },
      update: {},
      create: {
        sku: "MU-005",
        name: "Kwetiau Goreng Seafood",
        description: "Kwetiau dengan udang, cumi, dan sayuran",
        price: 40000,
        costPrice: 22000,
        stock: 70,
        minStock: 15,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-makanan-utama",
      },
    }),

    // === APPETIZER ===
    prisma.product.upsert({
      where: { sku: "AP-001" },
      update: {},
      create: {
        sku: "AP-001",
        name: "Lumpia Goreng (5 pcs)",
        description: "Lumpia isi rebung dan daging, disajikan dengan saus",
        price: 25000,
        costPrice: 12000,
        stock: 100,
        minStock: 20,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-appetizer",
      },
    }),
    prisma.product.upsert({
      where: { sku: "AP-002" },
      update: {},
      create: {
        sku: "AP-002",
        name: "Tahu Crispy",
        description: "Tahu goreng tepung dengan saus pedas manis",
        price: 18000,
        costPrice: 8000,
        stock: 120,
        minStock: 25,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-appetizer",
      },
    }),
    prisma.product.upsert({
      where: { sku: "AP-003" },
      update: {},
      create: {
        sku: "AP-003",
        name: "Chicken Wings (6 pcs)",
        description: "Sayap ayam goreng dengan pilihan saus BBQ atau spicy",
        price: 35000,
        costPrice: 18000,
        stock: 80,
        minStock: 15,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-appetizer",
      },
    }),
    prisma.product.upsert({
      where: { sku: "AP-004" },
      update: {},
      create: {
        sku: "AP-004",
        name: "Calamari Goreng",
        description: "Cumi goreng tepung dengan mayonnaise",
        price: 38000,
        costPrice: 20000,
        stock: 60,
        minStock: 10,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-appetizer",
      },
    }),
    prisma.product.upsert({
      where: { sku: "AP-005" },
      update: {},
      create: {
        sku: "AP-005",
        name: "French Fries",
        description: "Kentang goreng dengan bumbu special",
        price: 20000,
        costPrice: 8000,
        stock: 150,
        minStock: 30,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-appetizer",
      },
    }),
    prisma.product.upsert({
      where: { sku: "AP-006" },
      update: {},
      create: {
        sku: "AP-006",
        name: "Salad Garden Fresh",
        description: "Salad segar dengan dressing thousand island",
        price: 22000,
        costPrice: 10000,
        stock: 50,
        minStock: 10,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-appetizer",
      },
    }),

    // === MINUMAN ===
    prisma.product.upsert({
      where: { sku: "MN-001" },
      update: {},
      create: {
        sku: "MN-001",
        name: "Es Teh Manis",
        description: "Teh manis dingin menyegarkan",
        price: 8000,
        costPrice: 2000,
        stock: 200,
        minStock: 50,
        unit: "gelas",
        isActive: true,
        categoryId: "cat-minuman",
      },
    }),
    prisma.product.upsert({
      where: { sku: "MN-002" },
      update: {},
      create: {
        sku: "MN-002",
        name: "Es Jeruk Segar",
        description: "Jus jeruk segar dengan es",
        price: 12000,
        costPrice: 4000,
        stock: 180,
        minStock: 40,
        unit: "gelas",
        isActive: true,
        categoryId: "cat-minuman",
      },
    }),
    prisma.product.upsert({
      where: { sku: "MN-003" },
      update: {},
      create: {
        sku: "MN-003",
        name: "Kopi Susu Gula Aren",
        description: "Kopi robusta dengan susu dan gula aren",
        price: 22000,
        costPrice: 8000,
        stock: 150,
        minStock: 30,
        unit: "gelas",
        isActive: true,
        categoryId: "cat-minuman",
      },
    }),
    prisma.product.upsert({
      where: { sku: "MN-004" },
      update: {},
      create: {
        sku: "MN-004",
        name: "Americano",
        description: "Espresso dengan air panas",
        price: 18000,
        costPrice: 6000,
        stock: 120,
        minStock: 25,
        unit: "gelas",
        isActive: true,
        categoryId: "cat-minuman",
      },
    }),
    prisma.product.upsert({
      where: { sku: "MN-005" },
      update: {},
      create: {
        sku: "MN-005",
        name: "Cappuccino",
        description: "Espresso dengan susu dan foam",
        price: 25000,
        costPrice: 10000,
        stock: 100,
        minStock: 20,
        unit: "gelas",
        isActive: true,
        categoryId: "cat-minuman",
      },
    }),
    prisma.product.upsert({
      where: { sku: "MN-006" },
      update: {},
      create: {
        sku: "MN-006",
        name: "Matcha Latte",
        description: "Green tea latte dengan susu",
        price: 28000,
        costPrice: 12000,
        stock: 80,
        minStock: 15,
        unit: "gelas",
        isActive: true,
        categoryId: "cat-minuman",
      },
    }),
    prisma.product.upsert({
      where: { sku: "MN-007" },
      update: {},
      create: {
        sku: "MN-007",
        name: "Jus Alpukat",
        description: "Jus alpukat segar dengan susu",
        price: 20000,
        costPrice: 8000,
        stock: 90,
        minStock: 20,
        unit: "gelas",
        isActive: true,
        categoryId: "cat-minuman",
      },
    }),
    prisma.product.upsert({
      where: { sku: "MN-008" },
      update: {},
      create: {
        sku: "MN-008",
        name: "Lemon Tea",
        description: "Teh dengan perasan lemon segar",
        price: 15000,
        costPrice: 5000,
        stock: 130,
        minStock: 30,
        unit: "gelas",
        isActive: true,
        categoryId: "cat-minuman",
      },
    }),
    prisma.product.upsert({
      where: { sku: "MN-009" },
      update: {},
      create: {
        sku: "MN-009",
        name: "Air Mineral",
        description: "Air mineral dalam kemasan",
        price: 6000,
        costPrice: 2000,
        stock: 300,
        minStock: 50,
        unit: "botol",
        isActive: true,
        categoryId: "cat-minuman",
      },
    }),
    prisma.product.upsert({
      where: { sku: "MN-010" },
      update: {},
      create: {
        sku: "MN-010",
        name: "Thai Tea",
        description: "Teh Thailand dengan susu kental manis",
        price: 18000,
        costPrice: 6000,
        stock: 110,
        minStock: 25,
        unit: "gelas",
        isActive: true,
        categoryId: "cat-minuman",
      },
    }),

    // === DESSERT ===
    prisma.product.upsert({
      where: { sku: "DS-001" },
      update: {},
      create: {
        sku: "DS-001",
        name: "Es Cendol",
        description: "Cendol dengan santan dan gula merah",
        price: 15000,
        costPrice: 5000,
        stock: 100,
        minStock: 20,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-dessert",
      },
    }),
    prisma.product.upsert({
      where: { sku: "DS-002" },
      update: {},
      create: {
        sku: "DS-002",
        name: "Es Campur",
        description: "Aneka buah dan jelly dengan sirup dan susu",
        price: 18000,
        costPrice: 7000,
        stock: 80,
        minStock: 15,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-dessert",
      },
    }),
    prisma.product.upsert({
      where: { sku: "DS-003" },
      update: {},
      create: {
        sku: "DS-003",
        name: "Pisang Goreng Keju",
        description: "Pisang goreng dengan taburan keju dan cokelat",
        price: 20000,
        costPrice: 8000,
        stock: 70,
        minStock: 15,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-dessert",
      },
    }),
    prisma.product.upsert({
      where: { sku: "DS-004" },
      update: {},
      create: {
        sku: "DS-004",
        name: "Brownies Cokelat",
        description: "Brownies cokelat lembut dengan es krim",
        price: 28000,
        costPrice: 12000,
        stock: 50,
        minStock: 10,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-dessert",
      },
    }),
    prisma.product.upsert({
      where: { sku: "DS-005" },
      update: {},
      create: {
        sku: "DS-005",
        name: "Pancake Maple Syrup",
        description: "Pancake dengan maple syrup dan butter",
        price: 25000,
        costPrice: 10000,
        stock: 60,
        minStock: 12,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-dessert",
      },
    }),

    // === SEAFOOD ===
    prisma.product.upsert({
      where: { sku: "SF-001" },
      update: {},
      create: {
        sku: "SF-001",
        name: "Udang Saus Padang",
        description: "Udang besar dengan saus padang pedas",
        price: 65000,
        costPrice: 35000,
        stock: 40,
        minStock: 8,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-seafood",
      },
    }),
    prisma.product.upsert({
      where: { sku: "SF-002" },
      update: {},
      create: {
        sku: "SF-002",
        name: "Cumi Goreng Tepung",
        description: "Cumi goreng tepung crispy dengan saus tartar",
        price: 48000,
        costPrice: 25000,
        stock: 50,
        minStock: 10,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-seafood",
      },
    }),
    prisma.product.upsert({
      where: { sku: "SF-003" },
      update: {},
      create: {
        sku: "SF-003",
        name: "Ikan Bakar Sambal Matah",
        description: "Ikan kakap bakar dengan sambal matah khas Bali",
        price: 75000,
        costPrice: 40000,
        stock: 30,
        minStock: 5,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-seafood",
      },
    }),
    prisma.product.upsert({
      where: { sku: "SF-004" },
      update: {},
      create: {
        sku: "SF-004",
        name: "Kepiting Saus Tiram",
        description: "Kepiting dengan saus tiram, bawang putih",
        price: 120000,
        costPrice: 70000,
        stock: 20,
        minStock: 5,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-seafood",
      },
    }),
    prisma.product.upsert({
      where: { sku: "SF-005" },
      update: {},
      create: {
        sku: "SF-005",
        name: "Kerang Saus Padang",
        description: "Kerang hijau dengan saus padang",
        price: 55000,
        costPrice: 28000,
        stock: 35,
        minStock: 8,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-seafood",
      },
    }),

    // === MASAKAN NUSANTARA ===
    prisma.product.upsert({
      where: { sku: "NU-001" },
      update: {},
      create: {
        sku: "NU-001",
        name: "Rendang Sapi",
        description: "Rendang daging sapi khas Padang, empuk dan gurih",
        price: 55000,
        costPrice: 30000,
        stock: 45,
        minStock: 10,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-nusantara",
      },
    }),
    prisma.product.upsert({
      where: { sku: "NU-002" },
      update: {},
      create: {
        sku: "NU-002",
        name: "Soto Ayam Lamongan",
        description: "Soto ayam dengan kuah kuning dan koya",
        price: 32000,
        costPrice: 15000,
        stock: 70,
        minStock: 15,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-nusantara",
      },
    }),
    prisma.product.upsert({
      where: { sku: "NU-003" },
      update: {},
      create: {
        sku: "NU-003",
        name: "Sate Ayam Madura (10 tusuk)",
        description: "Sate ayam dengan bumbu kacang khas Madura",
        price: 35000,
        costPrice: 18000,
        stock: 80,
        minStock: 15,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-nusantara",
      },
    }),
    prisma.product.upsert({
      where: { sku: "NU-004" },
      update: {},
      create: {
        sku: "NU-004",
        name: "Gudeg Jogja",
        description: "Gudeg nangka dengan ayam, telur, dan sambal krecek",
        price: 42000,
        costPrice: 22000,
        stock: 40,
        minStock: 8,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-nusantara",
      },
    }),
    prisma.product.upsert({
      where: { sku: "NU-005" },
      update: {},
      create: {
        sku: "NU-005",
        name: "Rawon Surabaya",
        description: "Rawon daging sapi dengan kuah hitam kluwek",
        price: 45000,
        costPrice: 24000,
        stock: 50,
        minStock: 10,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-nusantara",
      },
    }),
    prisma.product.upsert({
      where: { sku: "NU-006" },
      update: {},
      create: {
        sku: "NU-006",
        name: "Gado-gado Jakarta",
        description: "Sayuran segar dengan bumbu kacang dan kerupuk",
        price: 28000,
        costPrice: 12000,
        stock: 60,
        minStock: 12,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-nusantara",
      },
    }),
    prisma.product.upsert({
      where: { sku: "NU-007" },
      update: {},
      create: {
        sku: "NU-007",
        name: "Ayam Betutu",
        description: "Ayam bumbu betutu khas Bali, pedas dan aromatik",
        price: 58000,
        costPrice: 30000,
        stock: 35,
        minStock: 8,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-nusantara",
      },
    }),

    // === WESTERN FOOD ===
    prisma.product.upsert({
      where: { sku: "WS-001" },
      update: {},
      create: {
        sku: "WS-001",
        name: "Beef Steak",
        description: "Tenderloin steak medium dengan sauce mushroom",
        price: 95000,
        costPrice: 55000,
        stock: 30,
        minStock: 5,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-western",
      },
    }),
    prisma.product.upsert({
      where: { sku: "WS-002" },
      update: {},
      create: {
        sku: "WS-002",
        name: "Chicken Cordon Bleu",
        description: "Dada ayam isi keju dan ham, saus creamy",
        price: 65000,
        costPrice: 35000,
        stock: 40,
        minStock: 8,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-western",
      },
    }),
    prisma.product.upsert({
      where: { sku: "WS-003" },
      update: {},
      create: {
        sku: "WS-003",
        name: "Fish & Chips",
        description: "Ikan dori goreng tepung dengan kentang goreng",
        price: 55000,
        costPrice: 28000,
        stock: 50,
        minStock: 10,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-western",
      },
    }),
    prisma.product.upsert({
      where: { sku: "WS-004" },
      update: {},
      create: {
        sku: "WS-004",
        name: "Spaghetti Bolognese",
        description: "Spaghetti dengan saus daging sapi cincang",
        price: 48000,
        costPrice: 22000,
        stock: 60,
        minStock: 12,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-western",
      },
    }),
    prisma.product.upsert({
      where: { sku: "WS-005" },
      update: {},
      create: {
        sku: "WS-005",
        name: "Fettuccine Carbonara",
        description: "Fettuccine dengan saus creamy telur dan bacon",
        price: 52000,
        costPrice: 25000,
        stock: 55,
        minStock: 10,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-western",
      },
    }),
    prisma.product.upsert({
      where: { sku: "WS-006" },
      update: {},
      create: {
        sku: "WS-006",
        name: "Beef Burger",
        description: "Burger daging sapi dengan keju, selada, tomat",
        price: 45000,
        costPrice: 22000,
        stock: 70,
        minStock: 15,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-western",
      },
    }),
    prisma.product.upsert({
      where: { sku: "WS-007" },
      update: {},
      create: {
        sku: "WS-007",
        name: "Chicken Burger",
        description: "Burger ayam crispy dengan saus special",
        price: 40000,
        costPrice: 18000,
        stock: 80,
        minStock: 15,
        unit: "porsi",
        isActive: true,
        categoryId: "cat-western",
      },
    }),
    prisma.product.upsert({
      where: { sku: "WS-008" },
      update: {},
      create: {
        sku: "WS-008",
        name: "Pizza Margherita",
        description: "Pizza dengan tomat, mozzarella, dan basil segar",
        price: 68000,
        costPrice: 32000,
        stock: 40,
        minStock: 8,
        unit: "loyang",
        isActive: true,
        categoryId: "cat-western",
      },
    }),

    // === PAKET HEMAT ===
    prisma.product.upsert({
      where: { sku: "PH-001" },
      update: {},
      create: {
        sku: "PH-001",
        name: "Paket Nasi + Ayam + Es Teh",
        description: "Nasi putih, ayam goreng, es teh manis",
        price: 35000,
        costPrice: 18000,
        stock: 100,
        minStock: 20,
        unit: "paket",
        isActive: true,
        categoryId: "cat-paket",
      },
    }),
    prisma.product.upsert({
      where: { sku: "PH-002" },
      update: {},
      create: {
        sku: "PH-002",
        name: "Paket Keluarga (4 orang)",
        description: "4 nasi, 4 ayam/ikan, 4 es teh, 1 sambal besar",
        price: 150000,
        costPrice: 80000,
        stock: 50,
        minStock: 10,
        unit: "paket",
        isActive: true,
        categoryId: "cat-paket",
      },
    }),
    prisma.product.upsert({
      where: { sku: "PH-003" },
      update: {},
      create: {
        sku: "PH-003",
        name: "Paket Makan Siang",
        description: "Nasi goreng/mie goreng + es jeruk",
        price: 38000,
        costPrice: 18000,
        stock: 80,
        minStock: 15,
        unit: "paket",
        isActive: true,
        categoryId: "cat-paket",
      },
    }),
    prisma.product.upsert({
      where: { sku: "PH-004" },
      update: {},
      create: {
        sku: "PH-004",
        name: "Paket Seafood Duo",
        description: "Udang saus padang + cumi goreng + 2 nasi + 2 es teh",
        price: 135000,
        costPrice: 70000,
        stock: 30,
        minStock: 5,
        unit: "paket",
        isActive: true,
        categoryId: "cat-paket",
      },
    }),
  ]);
  console.log("✅ Created products:", products.length);

  // ==================== TRANSACTIONS (MASSIVE DATA - 1 YEAR) ====================
  console.log("\n💳 Creating transactions (1 year of data)...");

  const allProducts = await prisma.product.findMany();
  const allUsers = await prisma.user.findMany();

  // Generate 1500+ transactions over the last 12 months (simulating a busy restaurant)
  const transactions = [];
  const startDate = new Date("2025-01-26"); // 1 year ago
  const endDate = new Date("2026-01-26"); // today

  const customerNames = [
    "Pak Ahmad",
    "Bu Siti",
    "Mas Andi",
    "Mbak Dewi",
    "Pak Bambang",
    "Bu Ratna",
    "Mas Rizki",
    "Mbak Ayu",
    "Pak Hendra",
    "Bu Lina",
    "Mas Dedi",
    "Mbak Rina",
    "Pak Joko",
    "Bu Maya",
    "Mas Fajar",
    "Keluarga Wijaya",
    "Keluarga Santoso",
    "Rombongan Kantor PT. ABC",
    "Arisan Bu-bu",
    "Reuni SMA 2010",
    "Pak Darmawan",
    "Bu Sulistyo",
    "Mas Agung",
    "Mbak Putri",
    "Pak Hendro",
    "Bu Kartini",
    "Keluarga Pratama",
    "Group Office XYZ",
    "Birthday Party Lia",
    "Corporate Lunch",
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ];

  const customerPhones = [
    "081234567890",
    "082345678901",
    "083456789012",
    "084567890123",
    "085678901234",
    "081111222333",
    "082222333444",
    "083333444555",
    null,
    null,
    null,
    null,
    null,
  ];

  // Generate transactions - more on weekends, lunch time, dinner time
  let transactionCount = 0;
  const totalTransactions = 1500; // Target 1500 transactions

  for (let i = 0; i < totalTransactions; i++) {
    // Create a weighted random date (more recent = more likely)
    const daysAgo = Math.floor(Math.pow(Math.random(), 1.5) * 365); // Bias towards recent
    const txDate = new Date(endDate);
    txDate.setDate(txDate.getDate() - daysAgo);

    // Add random time (business hours 10:00 - 22:00)
    const hour =
      Math.random() > 0.6
        ? Math.random() > 0.5
          ? 12 + Math.floor(Math.random() * 2)
          : 18 + Math.floor(Math.random() * 3) // Peak hours
        : 10 + Math.floor(Math.random() * 12); // Regular hours
    txDate.setHours(
      hour,
      Math.floor(Math.random() * 60),
      Math.floor(Math.random() * 60),
    );

    const user = allUsers[Math.floor(Math.random() * allUsers.length)];

    // Weekend and holidays = more items per transaction
    const isWeekend = txDate.getDay() === 0 || txDate.getDay() === 6;
    const baseItems = isWeekend ? 3 : 2;
    const numItems = Math.floor(Math.random() * 5) + baseItems; // 2-7 items

    // Select random products for this transaction
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    const selectedProducts = shuffled.slice(
      0,
      Math.min(numItems, shuffled.length),
    );

    let subtotal = 0;
    const items = selectedProducts.map((product) => {
      const qty = Math.floor(Math.random() * 4) + 1; // 1-4 qty
      const price = Number(product.price);
      const itemSubtotal = price * qty;
      subtotal += itemSubtotal;
      return {
        productId: product.id,
        quantity: qty,
        price: price,
        subtotal: itemSubtotal,
      };
    });

    const discount =
      Math.random() > 0.85
        ? Math.floor(subtotal * (0.05 + Math.random() * 0.15))
        : 0; // 15% chance of 5-20% discount
    const tax = Math.floor((subtotal - discount) * 0.1); // 10% tax
    const total = subtotal - discount + tax;

    const paymentMethods = [
      PaymentMethod.CASH,
      PaymentMethod.CASH,
      PaymentMethod.CASH,
      PaymentMethod.QRIS,
      PaymentMethod.QRIS,
      PaymentMethod.TRANSFER,
      PaymentMethod.CARD,
    ];
    const paymentMethod =
      paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

    const paidAmount =
      paymentMethod === PaymentMethod.CASH
        ? Math.ceil(total / 10000) * 10000 // Round up to nearest 10k for cash
        : total;

    // 95% completed, 3% cancelled, 2% refunded
    const statusRoll = Math.random();
    let status: TransactionStatus;
    if (statusRoll > 0.05) {
      status = TransactionStatus.COMPLETED;
    } else if (statusRoll > 0.02) {
      status = TransactionStatus.CANCELLED;
    } else {
      status = TransactionStatus.REFUNDED;
    }

    transactionCount++;
    const invoiceNumber = generateInvoiceNumber(transactionCount, txDate);

    const transaction = await prisma.transaction.create({
      data: {
        invoiceNumber,
        subtotal,
        discount,
        tax,
        total,
        paidAmount,
        changeAmount: paidAmount - total,
        paymentMethod,
        status,
        customerName:
          customerNames[Math.floor(Math.random() * customerNames.length)],
        customerPhone:
          customerPhones[Math.floor(Math.random() * customerPhones.length)],
        userId: user.id,
        createdAt: txDate,
        updatedAt: txDate,
        items: {
          create: items,
        },
      },
    });
    transactions.push(transaction);

    // Progress indicator
    if (transactionCount % 300 === 0) {
      console.log(
        `   📊 Progress: ${transactionCount}/${totalTransactions} transactions...`,
      );
    }
  }
  console.log("✅ Created transactions:", transactions.length);

  // ==================== FINANCIAL RECORDS (1 YEAR OF DATA) ====================
  console.log("\n💰 Creating financial records (1 year of data)...");

  const finStartDate = new Date("2025-01-26");
  const finEndDate = new Date("2026-01-26");

  const incomeCategories = [
    "Penjualan Makanan",
    "Penjualan Minuman",
    "Katering",
    "Event & Booking",
  ];

  const expenseCategories = [
    "Bahan Baku",
    "Gaji Karyawan",
    "Listrik & Air",
    "Gas",
    "Peralatan Dapur",
    "Renovasi",
    "Marketing",
    "Sewa Tempat",
    "Internet & Telepon",
    "Transportasi",
  ];

  const financialRecords = [];

  // Create income records - monthly (12 months x 4 categories = 48, plus random extra)
  for (let month = 0; month < 12; month++) {
    for (const category of incomeCategories) {
      const recordDate = new Date(finStartDate);
      recordDate.setMonth(recordDate.getMonth() + month);
      recordDate.setDate(Math.floor(Math.random() * 28) + 1); // Random day 1-28

      let amount: number;
      if (category === "Penjualan Makanan") {
        amount = Math.floor(Math.random() * 20000000) + 15000000; // 15M - 35M
      } else if (category === "Penjualan Minuman") {
        amount = Math.floor(Math.random() * 10000000) + 5000000; // 5M - 15M
      } else if (category === "Katering") {
        amount =
          Math.random() > 0.3
            ? Math.floor(Math.random() * 15000000) + 5000000
            : 0; // 70% chance
      } else {
        amount =
          Math.random() > 0.5
            ? Math.floor(Math.random() * 8000000) + 2000000
            : 0; // 50% chance
      }

      if (amount > 0) {
        const record = await prisma.financialRecord.create({
          data: {
            type: FinancialType.INCOME,
            category,
            amount,
            description: `Pendapatan ${category.toLowerCase()} bulan ${recordDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`,
            date: recordDate,
            reference: `INC-${recordDate.getFullYear()}${String(recordDate.getMonth() + 1).padStart(2, "0")}-${category.substring(0, 3).toUpperCase()}`,
            userId: admin.id,
            createdAt: recordDate,
            updatedAt: recordDate,
          },
        });
        financialRecords.push(record);
      }
    }
  }

  // Create expense records - monthly recurring
  for (let month = 0; month < 12; month++) {
    for (const category of expenseCategories) {
      const recordDate = new Date(finStartDate);
      recordDate.setMonth(recordDate.getMonth() + month);
      recordDate.setDate(Math.floor(Math.random() * 28) + 1);

      let amount: number;
      let shouldCreate = true;

      // Vary amounts based on category
      if (category === "Gaji Karyawan") {
        amount = 45000000 + Math.floor(Math.random() * 5000000); // 45M - 50M monthly
      } else if (category === "Bahan Baku") {
        amount = Math.floor(Math.random() * 15000000) + 8000000; // 8M - 23M
      } else if (category === "Sewa Tempat") {
        amount = 25000000; // Fixed rent
      } else if (category === "Listrik & Air") {
        amount = Math.floor(Math.random() * 3000000) + 2000000; // 2M - 5M
      } else if (category === "Gas") {
        amount = Math.floor(Math.random() * 2000000) + 1000000; // 1M - 3M
      } else if (category === "Renovasi") {
        shouldCreate = Math.random() > 0.8; // Only 20% months have renovation
        amount = Math.floor(Math.random() * 10000000) + 5000000; // 5M - 15M
      } else if (category === "Peralatan Dapur") {
        shouldCreate = Math.random() > 0.6; // 40% months
        amount = Math.floor(Math.random() * 5000000) + 500000; // 500k - 5.5M
      } else if (category === "Marketing") {
        amount = Math.floor(Math.random() * 3000000) + 500000; // 500k - 3.5M
      } else if (category === "Internet & Telepon") {
        amount = Math.floor(Math.random() * 500000) + 500000; // 500k - 1M
      } else {
        amount = Math.floor(Math.random() * 2000000) + 200000; // 200k - 2.2M
      }

      if (shouldCreate && amount > 0) {
        const record = await prisma.financialRecord.create({
          data: {
            type: FinancialType.EXPENSE,
            category,
            amount,
            description: `Pembayaran ${category.toLowerCase()} bulan ${recordDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`,
            date: recordDate,
            reference: `EXP-${recordDate.getFullYear()}${String(recordDate.getMonth() + 1).padStart(2, "0")}-${category.substring(0, 3).toUpperCase()}`,
            userId: admin.id,
            createdAt: recordDate,
            updatedAt: recordDate,
          },
        });
        financialRecords.push(record);
      }
    }
  }
  console.log("✅ Created financial records:", financialRecords.length);

  // ==================== DEBT/RECEIVABLES ====================
  console.log("\n📋 Creating debts and receivables...");

  const debtPersons = [
    {
      name: "Supplier Bahan Pokok CV. Sumber Rejeki",
      phone: "021-5551234",
      address: "Jl. Pasar Baru No. 45",
    },
    {
      name: "Supplier Sayuran Pak Karno",
      phone: "081234567001",
      address: "Pasar Induk Kramat Jati",
    },
    {
      name: "Supplier Daging UD. Makmur",
      phone: "021-5559876",
      address: "Jl. Rumah Potong Hewan No. 12",
    },
    {
      name: "Supplier Seafood PT. Laut Biru",
      phone: "081234567002",
      address: "Pelabuhan Muara Angke",
    },
    {
      name: "Rental AC & Kulkas",
      phone: "081234567003",
      address: "Jl. Elektronik No. 88",
    },
    {
      name: "PT. Catering Sukses",
      phone: "021-5553333",
      address: "Jl. Catering No. 1",
    },
    {
      name: "Event Organizer Pak Budi",
      phone: "081234567004",
      address: "Jl. Event No. 25",
    },
    {
      name: "Kantor PT. Global Tech",
      phone: "021-5554444",
      address: "Gedung Graha, Lt. 5",
    },
  ];

  const debtsReceivables = [];

  // Payables (Hutang ke supplier)
  for (let i = 0; i < 8; i++) {
    const person = debtPersons[i % debtPersons.length];
    const dueDate = randomDate(new Date("2025-12-01"), new Date("2026-02-28"));
    const amount = Math.floor(Math.random() * 15000000) + 2000000;
    const paidAmount =
      Math.random() > 0.5 ? Math.floor(amount * Math.random()) : 0;

    let status: DebtStatus;
    if (paidAmount >= amount) {
      status = DebtStatus.PAID;
    } else if (paidAmount > 0) {
      status = DebtStatus.PARTIAL;
    } else if (dueDate < new Date()) {
      status = DebtStatus.OVERDUE;
    } else {
      status = DebtStatus.PENDING;
    }

    const debt = await prisma.debtReceivable.create({
      data: {
        type: DebtType.PAYABLE,
        personName: person.name,
        personPhone: person.phone,
        personAddress: person.address,
        amount,
        paidAmount,
        remainingAmount: amount - paidAmount,
        dueDate,
        status,
        description: `Pembelian bahan baku dan perlengkapan`,
      },
    });

    // Add payments if partially paid
    if (paidAmount > 0) {
      await prisma.debtPayment.create({
        data: {
          amount: paidAmount,
          paymentMethod: PaymentMethod.TRANSFER,
          notes: "Pembayaran via transfer bank",
          debtReceivableId: debt.id,
        },
      });
    }

    debtsReceivables.push(debt);
  }

  // Receivables (Piutang dari pelanggan)
  const receivablePersons = [
    {
      name: "PT. Maju Jaya - Katering Kantor",
      phone: "021-5556666",
      address: "Jl. Sudirman No. 100",
    },
    {
      name: "Wedding Event Keluarga Susanto",
      phone: "081234567005",
      address: "Jl. Kebon Jeruk No. 55",
    },
    {
      name: "Acara Ulang Tahun Anak Pak Rahmat",
      phone: "081234567006",
      address: "Jl. Kelapa Gading",
    },
    {
      name: "PT. Teknologi Nusantara - Gathering",
      phone: "021-5557777",
      address: "Jl. Kuningan No. 88",
    },
    {
      name: "Arisan RT 05 Bu Santi",
      phone: "081234567007",
      address: "Perumahan Hijau Asri",
    },
    {
      name: "Catering Sekolah SDN 01",
      phone: "021-5558888",
      address: "Jl. Pendidikan No. 1",
    },
  ];

  for (let i = 0; i < 6; i++) {
    const person = receivablePersons[i];
    const dueDate = randomDate(new Date("2025-12-15"), new Date("2026-02-15"));
    const amount = Math.floor(Math.random() * 20000000) + 5000000;
    const paidAmount =
      Math.random() > 0.4 ? Math.floor(amount * Math.random() * 0.7) : 0;

    let status: DebtStatus;
    if (paidAmount >= amount) {
      status = DebtStatus.PAID;
    } else if (paidAmount > 0) {
      status = DebtStatus.PARTIAL;
    } else if (dueDate < new Date()) {
      status = DebtStatus.OVERDUE;
    } else {
      status = DebtStatus.PENDING;
    }

    const debt = await prisma.debtReceivable.create({
      data: {
        type: DebtType.RECEIVABLE,
        personName: person.name,
        personPhone: person.phone,
        personAddress: person.address,
        amount,
        paidAmount,
        remainingAmount: amount - paidAmount,
        dueDate,
        status,
        description: `Tagihan untuk layanan katering/event`,
      },
    });

    if (paidAmount > 0) {
      await prisma.debtPayment.create({
        data: {
          amount: paidAmount,
          paymentMethod: PaymentMethod.TRANSFER,
          notes: "Pembayaran DP/cicilan",
          debtReceivableId: debt.id,
        },
      });
    }

    debtsReceivables.push(debt);
  }
  console.log("✅ Created debts/receivables:", debtsReceivables.length);

  // ==================== SUMMARY ====================
  console.log("\n" + "=".repeat(50));
  console.log("🎉 SEED COMPLETED SUCCESSFULLY!");
  console.log("=".repeat(50));
  console.log("\n📊 Summary:");
  console.log(`   👤 Users: ${allUsers.length}`);
  console.log(`   📁 Categories: ${categories.length}`);
  console.log(`   🍕 Products: ${products.length}`);
  console.log(`   💳 Transactions: ${transactions.length}`);
  console.log(`   💰 Financial Records: ${financialRecords.length}`);
  console.log(`   📋 Debts/Receivables: ${debtsReceivables.length}`);
  console.log("\n🔐 Admin Login:");
  console.log(`   Email: zen@gmail.com`);
  console.log(`   Password: Passzein1`);
  console.log("\n🏪 Store: Zen Restaurant & Cafe");
  console.log("=".repeat(50) + "\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
