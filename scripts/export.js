async function exportServicePDF(serviceId) {
  const service = getServices().find((s) => s.id === serviceId);
  if (!service) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const lineHeight = 7;
  const sectionGap = 6;

  function drawHeader() {
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 46);
    doc.text("Loja do Peixe", pageWidth / 2, y, { align: "center" });
    y += 8;
    doc.setDrawColor(26, 26, 46);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += sectionGap;
  }

  function drawField(label, value) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(107, 107, 138);
    doc.text(label.toUpperCase(), margin, y);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(26, 26, 46);

    const lines = doc.splitTextToSize(String(value || "—"), contentWidth);
    lines.forEach((line) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, margin, y + 5);
      y += lineHeight;
    });

    doc.setDrawColor(226, 225, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 1, pageWidth - margin, y + 1);
    y += 5;
  }

  function drawSectionDivider() {
    y += 2;
    doc.setDrawColor(226, 225, 240);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += sectionGap;
  }

  drawHeader();

  drawField("ID", service.id);
  drawField("Status", service.status);
  drawField("Data", formatDateDisplay(service.date));

  drawSectionDivider();

  drawField("Nome", service.name);
  drawField("Telefone", service.phone || "—");
  drawField("Endereço", service.address);
  drawField("CPF", service.cpf);

  drawSectionDivider();

  drawField("Modelo", service.model);
  drawField("Cor", service.color);
  drawField("IMEI", service.imei || "—");
  drawField("Valor", "R$ " + formatCurrency(service.value));

  drawSectionDivider();

  drawField("Laudo técnico", service.technicalReport);
  drawField("Observações", service.observations || "—");

  y += 4;

  if (service.signature) {
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(107, 107, 138);
    doc.text("ASSINATURA", margin, y);
    y += 6;
    const sigWidth = contentWidth * 0.6;
    const sigHeight = 25;
    const sigX = (pageWidth - sigWidth) / 2;
    doc.addImage(service.signature, "PNG", sigX, y, sigWidth, sigHeight);
    y += sigHeight + 4;
  } else {
    y += 16;
  }

  doc.setDrawColor(26, 26, 46);
  doc.setLineWidth(0.5);
  const lineWidth = contentWidth * 0.6;
  const lineX = (pageWidth - lineWidth) / 2;
  doc.line(lineX, y, lineX + lineWidth, y);
  y += 5;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(107, 107, 138);
  doc.text("ASSINATURA", pageWidth / 2, y, { align: "center" });

  const fileName = "servico-" + service.id + ".pdf";
  const pdfBlob = doc.output("blob");

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile && navigator.share) {
    const file = new File([pdfBlob], fileName, { type: "application/pdf" });
    try {
      await navigator.share({ files: [file], title: "Nota de Serviço - " + service.id });
    } catch (err) {
      if (err.name !== "AbortError") {
        doc.save(fileName);
      }
    }
  } else {
    doc.save(fileName);
  }
}