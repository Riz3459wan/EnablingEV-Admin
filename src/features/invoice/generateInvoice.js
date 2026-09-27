import jsPDF from "jspdf";

const formatDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-IN");
};

const safe = (v) => (v === null || v === undefined || v === "" ? "—" : v);

export const generateInvoicePDF = (order) => {
  if (!order) return;

  const pdf = new jsPDF("p", "mm", "a4");
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const contentW = pageW - margin * 2;

  // ── Helpers ──
  let y = margin;

  const drawCell = (x, y, w, h, text = "", opts = {}) => {
    pdf.setLineWidth(0.3);
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(x, y, w, h);

    if (text) {
      pdf.setFontSize(opts.fontSize || 8);
      pdf.setFont("helvetica", opts.bold ? "bold" : "normal");
      const align = opts.align || "left";
      const tx =
        align === "center" ? x + w / 2 : align === "right" ? x + w - 2 : x + 2;
      const ty = y + h / 2 + 1.2;
      pdf.text(String(text), tx, ty, { align });
    }
  };

  const drawLabelValue = (x, y, w, label, value, valueW = 0.5) => {
    const labelW = w * (1 - valueW) - 2;
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${label}`, x + 2, y);
    pdf.text(`:`, x + labelW + 3, y);
    pdf.setFont("helvetica", "bold");
    pdf.text(safe(value), x + labelW + 6, y, {
      maxWidth: w * valueW - 4,
    });
  };

  // ══════════════════════════════════════════
  //  HEADER — Logo strip
  // ══════════════════════════════════════════
  const headerH = 22;
  drawCell(margin, y, contentW * 0.25, headerH, "", {});
  drawCell(margin + contentW * 0.25, y, contentW * 0.5, headerH, "", {});
  drawCell(margin + contentW * 0.75, y, contentW * 0.25, headerH, "", {});

  // Company name in middle
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("ENABLING E-VEHICLE PVT. LTD.", pageW / 2, y + headerH / 2 + 1, {
    align: "center",
  });

  y += headerH;

  // GST row
  const gstRowH = 6;
  drawCell(margin, y, contentW, gstRowH, "", {});
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text(
    `GSTIN: ${safe(order.dealerGstin)}`,
    pageW / 2,
    y + gstRowH / 2 + 1,
    { align: "center" },
  );
  y += gstRowH;

  // ══════════════════════════════════════════
  //  CUSTOMER INFO
  // ══════════════════════════════════════════
  const sectionTitleH = 6;
  drawCell(margin, y, contentW, sectionTitleH, "CUSTOMER INFO", {
    bold: true,
    align: "center",
    fontSize: 9,
  });
  y += sectionTitleH;

  const infoH = 34;
  const halfW = contentW / 2;

  drawCell(margin, y, halfW, infoH, "", {});
  drawCell(margin + halfW, y, halfW, infoH, "", {});

  // Left column
  drawLabelValue(margin, y + 5, halfW, "Sold To", order.customerName || "—");
  drawLabelValue(margin, y + 12, halfW, "S/o,D/o,W/o", "");
  drawLabelValue(
    margin,
    y + 19,
    halfW,
    "Present. Add",
    order.customerAddress || "—",
  );

  // Right column
  drawLabelValue(
    margin + halfW,
    y + 5,
    halfW,
    "Phone",
    order.customerMobile || "—",
  );
  drawLabelValue(margin + halfW, y + 12, halfW, "Customer ID", "");
  drawLabelValue(margin + halfW, y + 19, halfW, "PAN Card", "");
  drawLabelValue(
    margin + halfW,
    y + 26,
    halfW,
    "E-Mail",
    order.customerEmail || "—",
  );

  y += infoH;

  // ══════════════════════════════════════════
  //  VEHICLE INFO
  // ══════════════════════════════════════════
  drawCell(margin, y, contentW, sectionTitleH, "VEHICLE INFO", {
    bold: true,
    align: "center",
    fontSize: 9,
  });
  y += sectionTitleH;

  const vehicleH = 34;
  const colW = contentW / 3;

  drawCell(margin, y, colW, vehicleH, "", {});
  drawCell(margin + colW, y, colW, vehicleH, "", {});
  drawCell(margin + colW * 2, y, colW, vehicleH, "", {});

  // Column 1
  drawLabelValue(margin, y + 5, colW, "Make", "Enabling EV");
  drawLabelValue(
    margin,
    y + 12,
    colW,
    "Product Name",
    order.vehicleType || "—",
  );
  drawLabelValue(margin, y + 19, colW, "Model Name", order.modelName || "—");
  drawLabelValue(
    margin,
    y + 26,
    colW,
    "Chassis no.",
    order.chassisNumber || "—",
  );

  // Column 2
  drawLabelValue(
    margin + colW,
    y + 5,
    colW,
    "Category",
    order.vehicleType || "—",
  );
  drawLabelValue(
    margin + colW,
    y + 12,
    colW,
    "e-Ricksha Color",
    order.colorName || "—",
  );
  drawLabelValue(
    margin + colW,
    y + 19,
    colW,
    "Body Type",
    order.bodyTypeName || "—",
  );
  drawLabelValue(margin + colW, y + 26, colW, "Charger Make", "");

  // Column 3
  drawLabelValue(
    margin + colW * 2,
    y + 5,
    colW,
    "Battery Make",
    order.batteryType || "—",
  );
  drawLabelValue(
    margin + colW * 2,
    y + 12,
    colW,
    "Ampere",
    order.batteryAmpereHours ? `${order.batteryAmpereHours}Ah` : "—",
  );
  drawLabelValue(margin + colW * 2, y + 19, colW, "Battery Sr.No.1", "");
  drawLabelValue(margin + colW * 2, y + 26, colW, "Battery Sr.No.2", "");

  y += vehicleH;

  // ══════════════════════════════════════════
  //  INVOICE INFO
  // ══════════════════════════════════════════
  drawCell(margin, y, contentW, sectionTitleH, "INVOICE INFO", {
    bold: true,
    align: "center",
    fontSize: 9,
  });
  y += sectionTitleH;

  const invoiceH = 22;
  const qW = contentW / 4;

  drawCell(margin, y, qW, invoiceH, "", {});
  drawCell(margin + qW, y, qW, invoiceH, "", {});
  drawCell(margin + qW * 2, y, qW, invoiceH, "", {});
  drawCell(margin + qW * 3, y, qW, invoiceH, "", {});

  drawLabelValue(margin, y + 6, qW, "Invoice No.", order.billNumber || "—");
  drawLabelValue(
    margin,
    y + 13,
    qW,
    "Invoice Date",
    formatDate(order.billedOn),
  );

  drawLabelValue(margin + qW, y + 6, qW, "Financier", "");
  drawLabelValue(margin + qW, y + 13, qW, "Branch", "");
  drawLabelValue(margin + qW, y + 20, qW, "RTO CODE", "");

  drawLabelValue(margin + qW * 2, y + 6, qW, "Sale Cons.", "");
  drawLabelValue(
    margin + qW * 2,
    y + 13,
    qW,
    "Sale Order",
    order.orderNumber || "—",
  );
  drawLabelValue(margin + qW * 2, y + 20, qW, "DOD", "");

  drawLabelValue(
    margin + qW * 3,
    y + 6,
    qW,
    "Chassis no.",
    order.chassisNumber || "—",
  );

  y += invoiceH;

  // ══════════════════════════════════════════
  //  PRICE TABLE
  // ══════════════════════════════════════════
  const priceHeaderH = 6;
  drawCell(margin, y, contentW * 0.6, priceHeaderH, "Particulars", {
    bold: true,
    fontSize: 8,
  });
  drawCell(
    margin + contentW * 0.6,
    y,
    contentW * 0.4,
    priceHeaderH,
    "Amount(Rs)",
    { bold: true, align: "right", fontSize: 8 },
  );
  y += priceHeaderH;

  const total = Number(order.totalAmount) || 0;
  const gstRate = 0.05;
  const subtotal = Math.round(total / (1 + gstRate));
  const cgst = Math.round((total - subtotal) / 2);
  const sgst = cgst;
  const totalTax = cgst + sgst;

  const rows = [
    { label: "Unit Price of One e-Rickshaw", value: subtotal },
    { label: "CGST 2.5%", value: cgst },
    { label: "SGST 2.5%", value: sgst },
    { label: "Total Tax", value: totalTax },
  ];

  const rowH = 6;
  rows.forEach((r) => {
    drawCell(margin, y, contentW * 0.6, rowH, r.label, { fontSize: 8 });
    drawCell(
      margin + contentW * 0.6,
      y,
      contentW * 0.4,
      rowH,
      r.value.toLocaleString("en-IN"),
      { align: "right", fontSize: 8 },
    );
    y += rowH;
  });

  // Ex-Showroom
  drawCell(margin, y, contentW * 0.6, rowH, "Ex-Showroom Price of E-Rickshaw", {
    bold: true,
    fontSize: 8,
  });
  drawCell(
    margin + contentW * 0.6,
    y,
    contentW * 0.4,
    rowH,
    subtotal.toLocaleString("en-IN"),
    { align: "right", bold: true, fontSize: 8 },
  );
  y += rowH;

  // Total
  drawCell(margin, y, contentW * 0.6, rowH, "Total", {
    bold: true,
    fontSize: 8,
  });
  drawCell(
    margin + contentW * 0.6,
    y,
    contentW * 0.4,
    rowH,
    total.toLocaleString("en-IN"),
    { align: "right", bold: true, fontSize: 8 },
  );
  y += rowH;

  // Ins/Registration
  drawCell(
    margin,
    y,
    contentW * 0.6,
    rowH,
    "Ins.,Registration & OthersMisc Expenses",
    { fontSize: 8 },
  );
  drawCell(margin + contentW * 0.6, y, contentW * 0.4, rowH, "0", {
    align: "right",
    fontSize: 8,
  });
  y += rowH;

  // Grand Total
  drawCell(margin, y, contentW * 0.6, rowH + 2, "Grand Total", {
    bold: true,
    fontSize: 9,
  });
  drawCell(
    margin + contentW * 0.6,
    y,
    contentW * 0.4,
    rowH + 2,
    total.toLocaleString("en-IN"),
    { align: "right", bold: true, fontSize: 9 },
  );
  y += rowH + 2;

  // ══════════════════════════════════════════
  //  FOOTER (empty space + signatory)
  // ══════════════════════════════════════════
  const footerH = pageH - y - margin - 15;
  if (footerH > 10) {
    drawCell(margin, y, contentW, footerH, "", {});
    y += footerH;
  }

  // Signatory line
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("(Authorised Signatory)", pageW - margin - 4, pageH - margin - 4, {
    align: "right",
  });

  // Save
  const fileName = `Invoice_${order.billNumber || order.orderNumber || "bill"}.pdf`;
  pdf.save(fileName);
};
