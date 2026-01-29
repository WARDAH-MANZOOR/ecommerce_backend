import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function generateInvoicePdf({
  orderId,
  invoiceNumber,
}: {
  orderId: string;
  invoiceNumber: string;
}) {
  const invoiceDir = path.join(process.cwd(), "public", "invoices");

  // ✅ Ensure directory exists
  if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir, { recursive: true });
  }

  const fileName = `${invoiceNumber}.pdf`;

  // ✅ ABSOLUTE path (VERY IMPORTANT)
  const filePath = path.join(invoiceDir, fileName);

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("Invoice", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Invoice #: ${invoiceNumber}`);
  doc.text(`Order ID: ${orderId}`);
  doc.text(`Date: ${new Date().toDateString()}`);

  doc.moveDown();
  doc.text("Thank you for your purchase!");

  doc.end();

  // ✅ Public URL (static serve ke liye)
  return `/public/invoices/${fileName}`;
}
