import { Request, Response } from "express";
import { transactionService } from "../services/transaction.service";
import { settingsService } from "../services/settings.service";
// @ts-ignore
const PDFDocument = require("pdfkit");
import { prisma } from "../lib/prisma";

export const generateReceipt = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const transaction = await transactionService.findById(id);
    if (!transaction)
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    const settings = await settingsService.getSettings();

    // PDFKit setup
    const doc = new PDFDocument({ margin: 36, size: "A6" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt-${id}.pdf`
    );
    doc.pipe(res);

    // Header
    if (settings.showLogoOnReceipt && settings.logo) {
      try {
        doc.image(settings.logo, { fit: [60, 60], align: "center" });
      } catch {}
    }
    if (settings.receiptHeader) {
      doc.fontSize(12).text(settings.receiptHeader, { align: "center" });
    }
    doc.fontSize(14).text(settings.name, { align: "center", underline: true });
    if (settings.showAddressOnReceipt && settings.address) {
      doc.fontSize(9).text(settings.address, { align: "center" });
    }
    if (settings.showPhoneOnReceipt && settings.phone) {
      doc.fontSize(9).text(`Telp: ${settings.phone}`, { align: "center" });
    }
    if (settings.website) {
      doc.fontSize(8).text(settings.website, { align: "center" });
    }
    doc.moveDown();

    // Transaction info
    doc.fontSize(10).text(`No. Transaksi: ${transaction.invoiceNumber}`);
    doc.text(
      `Tanggal: ${new Date(transaction.createdAt).toLocaleString("id-ID")}`
    );
    doc.text(`Kasir: ${transaction.user?.name || "-"}`);
    doc.moveDown();

    // Items
    doc.fontSize(10).text("Daftar Barang:");
    transaction.items.forEach((item: any) => {
      doc.text(
        `${item.product.name} x${item.quantity} @${Number(
          item.price
        ).toLocaleString()} = Rp${Number(item.subtotal).toLocaleString()}`
      );
    });
    doc.moveDown();
    doc.text(`Total: Rp${Number(transaction.total).toLocaleString()}`);
    doc.text(`Tunai: Rp${Number(transaction.paidAmount).toLocaleString()}`);
    doc.text(`Kembali: Rp${Number(transaction.changeAmount).toLocaleString()}`);
    doc.moveDown();

    // Footer
    if (settings.receiptFooter) {
      doc.fontSize(9).text(settings.receiptFooter, { align: "center" });
    }
    doc.end();
  } catch (e) {
    res.status(500).json({ message: "Gagal membuat struk" });
  }
};
