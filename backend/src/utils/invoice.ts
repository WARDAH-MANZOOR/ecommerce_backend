import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";


// export async function generateInvoicePdf({
//   orderId,
//   invoiceNumber,
//   customer,
//   items,
//   totalAmount,
// }: {
//   orderId: string;
//   invoiceNumber: string;
//   customer: { name: string; email: string; address: string };
//   items: { name: string; quantity: number; price: number }[];
//   totalAmount: number;
// }) {
//   const invoiceDir = path.join(process.cwd(), "public", "invoices");
//   if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });

//   const fileName = `${invoiceNumber}.pdf`;
//   const filePath = path.join(invoiceDir, fileName);

//   const doc = new PDFDocument({ margin: 50 });
//   doc.pipe(fs.createWriteStream(filePath));

//   // Title
//   doc.fontSize(20).text("INVOICE", { align: "center" });
//   doc.moveDown();

//   // Invoice info
//   doc.fontSize(12)
//      .text(`Invoice #: ${invoiceNumber}`)
//      .text(`Order ID: ${orderId}`)
//      .text(`Date: ${new Date().toDateString()}`)
//      .moveDown();

//   // Customer info
//   doc.text(`Customer Name: ${customer.name}`)
//      .text(`Email: ${customer.email}`)
//      .text(`Address: ${customer.address}`)
//      .moveDown();

//   // Items
//   doc.text("Items:", { underline: true });
//   items.forEach((item, idx) => {
//     const line = `${idx + 1}. ${item.name} - Qty: ${item.quantity} x ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}`;
//     doc.text(line);
//   });

//   doc.moveDown();

//   // Total amount
//   doc.fontSize(14).text(`Total Amount: ${totalAmount.toFixed(2)}`);
//   doc.moveDown();

//   // Footer
//   doc.fontSize(10)
//      .text("Thank you for your purchase!", { align: "left" })
//      .text("Ambreen | Clifton Block 9 | 03039128174 ", { align: "center" });

//   doc.end();

//   return `/public/invoices/${fileName}`;
// }
export async function generateInvoicePdf({
  orderId,
  invoiceNumber,
  customer,
  items,
  totalAmount,
  orderDate,
  paymentDate,
  deliveryDate,
}: {
  orderId: string;
  invoiceNumber: string;
  customer: { name: string; email: string; address: string };
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  orderDate: Date;
  paymentDate: Date;
  deliveryDate: Date;
}) {
  const invoiceDir = path.join(process.cwd(), "public", "invoices");
  if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });

  const fileName = `${invoiceNumber}.pdf`;
  const filePath = path.join(invoiceDir, fileName);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(fs.createWriteStream(filePath));

  // Title
  doc.fontSize(20).font("Helvetica-Bold").text("INVOICE", { align: "center" });
  doc.moveDown(3);

  // Invoice & Order info
  doc.fontSize(12).font("Helvetica-Bold").text("Invoice Details:");
  doc.moveDown(2);
  doc.font("Helvetica").text(`Invoice #: ${invoiceNumber}`);
  doc.moveDown();
  doc.text(`Order ID: ${orderId}`);
  doc.moveDown();
  doc.text(`Order Date: ${orderDate.toLocaleString()}`);
  doc.moveDown();
  doc.text(`Payment Date: ${paymentDate.toLocaleString()}`);
  doc.moveDown();
  doc.text(`Expected Delivery: ${deliveryDate.toLocaleString()}`);
  doc.moveDown(2);

  // Customer info
  doc.font("Helvetica-Bold").text("Customer Information:");
  doc.moveDown(1);
  doc.font("Helvetica").text(`Name: ${customer.name}`);
  doc.moveDown();
  doc.text(`Email: ${customer.email}`);
  doc.moveDown();
  doc.text(`Address: ${customer.address}`);
  doc.moveDown(2);

  // Items
  doc.font("Helvetica-Bold").text("Items:");
  doc.moveDown(2);
  items.forEach((item, idx) => {
    doc.font("Helvetica").text(
      `${idx + 1}. ${item.name} - Qty: ${item.quantity} x ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}`
    );
  });
  doc.moveDown(2);

  // Total
  doc.font("Helvetica-Bold").fontSize(14).text(`Total Amount: ${totalAmount.toFixed(2)}`);
  doc.moveDown(2);

  // Footer
  doc.fontSize(10).font("Helvetica").text("Thank you for your purchase!", { align: "left" });
  doc.moveDown(10);
  doc.text("Ambreen | Clifton Block 9 | 03039128174", { align: "center" });

  doc.end();
  return `/public/invoices/${fileName}`;
}