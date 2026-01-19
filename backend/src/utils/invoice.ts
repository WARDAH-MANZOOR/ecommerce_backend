import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function generateInvoicePdf({ orderId, invoiceNumber }: { orderId: string; invoiceNumber: string }) {
  const fileName = `${invoiceNumber}.pdf`;
  const filePath = path.join("public/invoices", fileName);

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

  return `/invoices/${fileName}`;
}
