import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// export async function generateInvoicePdf({
//   orderId,
//   invoiceNumber,
// }: {
//   orderId: string;
//   invoiceNumber: string;
// }) {
//   const invoiceDir = path.join(process.cwd(), "public", "invoices");

//   // ✅ Ensure directory exists
//   if (!fs.existsSync(invoiceDir)) {
//     fs.mkdirSync(invoiceDir, { recursive: true });
//   }

//   const fileName = `${invoiceNumber}.pdf`;

//   // ✅ ABSOLUTE path (VERY IMPORTANT)
//   const filePath = path.join(invoiceDir, fileName);

//   const doc = new PDFDocument();
//   doc.pipe(fs.createWriteStream(filePath));

//   doc.fontSize(20).text("Invoice", { align: "center" });
//   doc.moveDown();

//   doc.fontSize(12).text(`Invoice #: ${invoiceNumber}`);
//   doc.text(`Order ID: ${orderId}`);
//   doc.text(`Date: ${new Date().toDateString()}`);

//   doc.moveDown();
//   doc.text("Thank you for your purchase!");

//   doc.end();

//   // ✅ Public URL (static serve ke liye)
//   return `/public/invoices/${fileName}`;
// }

export async function generateInvoicePdf({
  orderId,
  invoiceNumber,
  customer,
  items,
  totalAmount,
}: {
  orderId: string;
  invoiceNumber: string;
  customer: { name: string; email: string; address: string };
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
}) {
  const invoiceDir = path.join(process.cwd(), "public", "invoices");
  if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });

  const fileName = `${invoiceNumber}.pdf`;
  const filePath = path.join(invoiceDir, fileName);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(fs.createWriteStream(filePath));

  // Title
  doc.fontSize(20).text("INVOICE", { align: "center" });
  doc.moveDown();

  // Invoice info
  doc.fontSize(12)
     .text(`Invoice #: ${invoiceNumber}`)
     .text(`Order ID: ${orderId}`)
     .text(`Date: ${new Date().toDateString()}`)
     .moveDown();

  // Customer info
  doc.text(`Customer Name: ${customer.name}`)
     .text(`Email: ${customer.email}`)
     .text(`Address: ${customer.address}`)
     .moveDown();

  // Items
  doc.text("Items:", { underline: true });
  items.forEach((item, idx) => {
    const line = `${idx + 1}. ${item.name} - Qty: ${item.quantity} x ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}`;
    doc.text(line);
  });

  doc.moveDown();

  // Total amount
  doc.fontSize(14).text(`Total Amount: ${totalAmount.toFixed(2)}`);
  doc.moveDown();

  // Footer
  doc.fontSize(10)
     .text("Thank you for your purchase!", { align: "left" })
     .text("Company Name | Address | Contact | Terms", { align: "center" });

  doc.end();

  return `/public/invoices/${fileName}`;
}
