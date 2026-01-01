import {
  PrismaClient,
  Role,
  FinancialType,
  DebtType,
  DebtStatus,
  PaymentMethod,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("Passzein1", 12);
  const admin = await prisma.user.upsert({
    where: { email: "zen@gmail.com" },
    update: {
      password: hashedPassword,
      isActive: true,
      name: "Zen Admin",
      phone: "081234567890",
      avatar: "/uploads/products/product-1766995478018-737268756.jpg",
      refreshToken: null,
    },
    create: {
      email: "zen@gmail.com",
      password: hashedPassword,
      name: "Zen Admin",
      role: Role.ADMIN,
      phone: "081234567890",
      avatar: "/uploads/products/product-1766995478018-737268756.jpg",
      isActive: true,
      refreshToken: null,
    },
  });
  console.log("✅ Created admin user:", admin.email);

  // Create categories (stationery-focused)
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: "cat-pena" },
      update: {},
      create: {
        id: "cat-pena",
        name: "Pena & Pulpen",
        description: "Berbagai jenis pena dan pulpen",
        color: "#3B82F6",
        icon: "pen-nib",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-pensil" },
      update: {},
      create: {
        id: "cat-pensil",
        name: "Pensil",
        description: "Pensil kayu, mekanik, warna",
        color: "#F59E42",
        icon: "pencil",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-buku" },
      update: {},
      create: {
        id: "cat-buku",
        name: "Buku Tulis",
        description: "Buku tulis, gambar, dan catatan",
        color: "#10B981",
        icon: "book",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-kertas" },
      update: {},
      create: {
        id: "cat-kertas",
        name: "Kertas",
        description: "Kertas HVS, folio, dan lainnya",
        color: "#6366F1",
        icon: "file-alt",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-aksesoris" },
      update: {},
      create: {
        id: "cat-aksesoris",
        name: "Aksesoris Kantor",
        description: "Perlengkapan kantor dan sekolah",
        color: "#EF4444",
        icon: "paperclip",
      },
    }),
    prisma.category.upsert({
      where: { id: "cat-lainnya" },
      update: {},
      create: {
        id: "cat-lainnya",
        name: "Lainnya",
        description: "Produk lainnya",
        color: "#8B5CF6",
        icon: "package",
      },
    }),
  ]);
  console.log("✅ Created categories:", categories.length);

  // Create many products (stationery, all fields filled)
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: "PRD-001" },
      update: {},
      create: {
        sku: "PRD-001",
        name: "Pulpen Standard Hitam",
        description:
          "Pulpen tinta hitam, nyaman digunakan untuk menulis harian.",
        price: 2500,
        costPrice: 1800,
        stock: 200,
        minStock: 50,
        unit: "pcs",
        image: "/uploads/products/product-1766995478018-737268756.jpg",
        isActive: true,
        categoryId: "cat-pena",
      },
    }),
    prisma.product.upsert({
      where: { sku: "PRD-002" },
      update: {},
      create: {
        sku: "PRD-002",
        name: "Pensil 2B Faber-Castell",
        description: "Pensil 2B untuk ujian dan menggambar.",
        price: 3000,
        costPrice: 2200,
        stock: 120,
        minStock: 20,
        unit: "pcs",
        image: null,
        isActive: true,
        categoryId: "cat-pensil",
      },
    }),
    prisma.product.upsert({
      where: { sku: "PRD-003" },
      update: {},
      create: {
        sku: "PRD-003",
        name: "Buku Tulis Sidu 38 Lembar",
        description: "Buku tulis Sidu isi 38 lembar, cover tebal.",
        price: 4000,
        costPrice: 3200,
        stock: 300,
        minStock: 60,
        unit: "buku",
        image: null,
        isActive: true,
        categoryId: "cat-buku",
      },
    }),
    prisma.product.upsert({
      where: { sku: "PRD-004" },
      update: {},
      create: {
        sku: "PRD-004",
        name: "Kertas HVS A4 70gsm",
        description: "Kertas HVS ukuran A4, 1 rim isi 500 lembar.",
        price: 55000,
        costPrice: 48000,
        stock: 40,
        minStock: 10,
        unit: "rim",
        image: null,
        isActive: true,
        categoryId: "cat-kertas",
      },
    }),
    prisma.product.upsert({
      where: { sku: "PRD-005" },
      update: {},
      create: {
        sku: "PRD-005",
        name: "Stapler Joyko Mini",
        description:
          "Stapler mini Joyko, cocok untuk penggunaan kantor dan sekolah.",
        price: 12000,
        costPrice: 9500,
        stock: 35,
        minStock: 5,
        unit: "pcs",
        image: null,
        isActive: true,
        categoryId: "cat-aksesoris",
      },
    }),
    prisma.product.upsert({
      where: { sku: "PRD-006" },
      update: {},
      create: {
        sku: "PRD-006",
        name: "Penghapus Staedtler",
        description: "Penghapus Staedtler, bersih tanpa merusak kertas.",
        price: 2500,
        costPrice: 1800,
        stock: 100,
        minStock: 20,
        unit: "pcs",
        image: null,
        isActive: true,
        categoryId: "cat-aksesoris",
      },
    }),
    prisma.product.upsert({
      where: { sku: "PRD-007" },
      update: {},
      create: {
        sku: "PRD-007",
        name: "Spidol Snowman Hitam",
        description: "Spidol permanen Snowman warna hitam.",
        price: 7000,
        costPrice: 5500,
        stock: 60,
        minStock: 10,
        unit: "pcs",
        image: null,
        isActive: true,
        categoryId: "cat-pena",
      },
    }),
    prisma.product.upsert({
      where: { sku: "PRD-008" },
      update: {},
      create: {
        sku: "PRD-008",
        name: "Map Plastik Folio",
        description: "Map plastik ukuran folio, berbagai warna.",
        price: 1500,
        costPrice: 1000,
        stock: 80,
        minStock: 15,
        unit: "pcs",
        image: null,
        isActive: true,
        categoryId: "cat-aksesoris",
      },
    }),
    prisma.product.upsert({
      where: { sku: "PRD-009" },
      update: {},
      create: {
        sku: "PRD-009",
        name: "Penggaris 30cm",
        description: "Penggaris plastik 30cm, bening.",
        price: 3500,
        costPrice: 2500,
        stock: 90,
        minStock: 20,
        unit: "pcs",
        image: null,
        isActive: true,
        categoryId: "cat-aksesoris",
      },
    }),
    prisma.product.upsert({
      where: { sku: "PRD-010" },
      update: {},
      create: {
        sku: "PRD-010",
        name: "Pensil Warna Faber-Castell 12 Warna",
        description: "Pensil warna isi 12, cocok untuk anak sekolah.",
        price: 18000,
        costPrice: 14500,
        stock: 25,
        minStock: 5,
        unit: "kotak",
        image: null,
        isActive: true,
        categoryId: "cat-pensil",
      },
    }),
  ]);
  console.log("✅ Created products:", products.length);

  // Create sample transactions (with all fields)
  const transaction1 = await prisma.transaction.create({
    data: {
      invoiceNumber: "INV-20251230001",
      subtotal: 25000,
      discount: 2000,
      tax: 1000,
      total: 24000,
      paidAmount: 25000,
      changeAmount: 1000,
      paymentMethod: PaymentMethod.CASH,
      status: "COMPLETED",
      notes: "Pembelian alat tulis untuk sekolah",
      customerName: "Andi Wijaya",
      customerPhone: "081234567800",
      userId: admin.id,
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 5,
            price: 2500,
            subtotal: 12500,
          },
          {
            productId: products[2].id,
            quantity: 2,
            price: 4000,
            subtotal: 8000,
          },
        ],
      },
    },
  });
  const transaction2 = await prisma.transaction.create({
    data: {
      invoiceNumber: "INV-20251230002",
      subtotal: 18000,
      discount: 0,
      tax: 0,
      total: 18000,
      paidAmount: 20000,
      changeAmount: 2000,
      paymentMethod: PaymentMethod.QRIS,
      status: "COMPLETED",
      notes: "Pembelian pensil warna dan penghapus",
      customerName: "Siti Nurhaliza",
      customerPhone: "081234567801",
      userId: admin.id,
      items: {
        create: [
          {
            productId: products[9].id,
            quantity: 1,
            price: 18000,
            subtotal: 18000,
          },
          {
            productId: products[5].id,
            quantity: 2,
            price: 2500,
            subtotal: 5000,
          },
        ],
      },
    },
  });
  console.log("✅ Created transactions");

  // Create more financial records (all fields)
  const financialRecords = await Promise.all([
    prisma.financialRecord.create({
      data: {
        type: FinancialType.INCOME,
        category: "Penjualan",
        amount: 500000,
        description: "Pendapatan harian",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        reference: transaction1.invoiceNumber,
        userId: admin.id,
      },
    }),
    prisma.financialRecord.create({
      data: {
        type: FinancialType.EXPENSE,
        category: "Operasional",
        amount: 100000,
        description: "Biaya listrik bulan ini",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        reference: null,
        userId: admin.id,
      },
    }),
    prisma.financialRecord.create({
      data: {
        type: FinancialType.EXPENSE,
        category: "Stok",
        amount: 250000,
        description: "Pembelian stok baru (Buku Tulis, Pulpen, Pensil)",
        date: new Date(),
        reference: null,
        userId: admin.id,
      },
    }),
    prisma.financialRecord.create({
      data: {
        type: FinancialType.INCOME,
        category: "Jasa Fotokopi",
        amount: 75000,
        description: "Pendapatan jasa fotokopi bulan ini",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        reference: null,
        userId: admin.id,
      },
    }),
  ]);
  console.log("✅ Created financial records:", financialRecords.length);

  // Create sample debts/receivables (all fields)
  const debts = await Promise.all([
    prisma.debtReceivable.create({
      data: {
        type: DebtType.RECEIVABLE,
        personName: "Budi Santoso",
        personPhone: "081234567891",
        personAddress: "Jl. Melati No. 10, Surabaya",
        amount: 150000,
        paidAmount: 50000,
        remainingAmount: 100000,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: DebtStatus.PARTIAL,
        description: "Piutang pembelian alat tulis kantor",
        payments: {
          create: [
            {
              amount: 50000,
              paymentMethod: PaymentMethod.CASH,
              notes: "Pembayaran pertama",
            },
          ],
        },
      },
    }),
    prisma.debtReceivable.create({
      data: {
        type: DebtType.PAYABLE,
        personName: "Supplier ABC",
        personPhone: "081234567892",
        personAddress: "Jl. Kenanga No. 5, Sidoarjo",
        amount: 500000,
        paidAmount: 0,
        remainingAmount: 500000,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: DebtStatus.PENDING,
        description: "Hutang pembelian kertas HVS dan buku tulis",
        payments: {
          create: [],
        },
      },
    }),
    prisma.debtReceivable.create({
      data: {
        type: DebtType.RECEIVABLE,
        personName: "SMA Negeri 1",
        personPhone: "081234567893",
        personAddress: "Jl. Mawar No. 2, Gresik",
        amount: 300000,
        paidAmount: 0,
        remainingAmount: 300000,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: DebtStatus.PENDING,
        description: "Piutang penjualan alat tulis ke sekolah",
        payments: {
          create: [],
        },
      },
    }),
  ]);
  console.log("✅ Created debts/receivables:", debts.length);

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
