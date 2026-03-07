function generateServicePDF(serviceId) {
  const service = getServices().find((s) => s.id === serviceId);
  if (!service) return;

  const preview = document.getElementById("export-preview");

  preview.innerHTML =
    '<div class="pdf-page">' +
      '<div class="pdf-header">' +
        '<span class="pdf-brand">Loja do Peixe</span>' +
      '</div>' +
      '<div class="pdf-section">' +
        '<div class="pdf-row"><span class="pdf-label">Nome</span><span class="pdf-value">' + service.name + '</span></div>' +
        '<div class="pdf-row"><span class="pdf-label">Telefone</span><span class="pdf-value">' + service.phone + '</span></div>' +
        '<div class="pdf-row"><span class="pdf-label">Endereço</span><span class="pdf-value">' + service.address + '</span></div>' +
        '<div class="pdf-row"><span class="pdf-label">CPF</span><span class="pdf-value">' + service.cpf + '</span></div>' +
        '<div class="pdf-row"><span class="pdf-label">Modelo</span><span class="pdf-value">' + service.model + '</span></div>' +
        '<div class="pdf-row"><span class="pdf-label">Cor</span><span class="pdf-value">' + service.color + '</span></div>' +
        '<div class="pdf-row"><span class="pdf-label">IMEI</span><span class="pdf-value">' + service.imei + '</span></div>' +
        '<div class="pdf-row"><span class="pdf-label">Valor</span><span class="pdf-value">R$ ' + service.value + '</span></div>' +
        '<div class="pdf-row"><span class="pdf-label">Data</span><span class="pdf-value">' + formatDateDisplay(service.date) + '</span></div>' +
      '</div>' +
      '<div class="pdf-section">' +
        '<div class="pdf-row pdf-row-block"><span class="pdf-label">Laudo técnico</span><span class="pdf-value">' + service.technicalReport + '</span></div>' +
        '<div class="pdf-row pdf-row-block"><span class="pdf-label">Observações</span><span class="pdf-value">' + service.observations + '</span></div>' +
      '</div>' +
      '<div class="pdf-signature-area">' +
        '<div class="pdf-signature-line"></div>' +
        '<span class="pdf-signature-label">Assinatura</span>' +
      '</div>' +
    '</div>';

  document.getElementById("export-modal").classList.add("active");
}

function downloadPDF() {
  const page = document.querySelector(".pdf-page");
  if (!page) return;

  const originalParent = page.parentElement;
  const printFrame = document.createElement("iframe");

  printFrame.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;";
  document.body.appendChild(printFrame);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Nunito', sans-serif; background: #fff; color: #1a1a2e; }
    .pdf-page { padding: 40px 48px; width: 210mm; min-height: 297mm; }
    .pdf-header { text-align: center; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 2px solid #1a1a2e; }
    .pdf-brand { font-size: 26px; font-weight: 800; color: #1a1a2e; letter-spacing: -0.5px; }
    .pdf-section { margin-bottom: 24px; border-bottom: 1px solid #e2e1f0; padding-bottom: 16px; }
    .pdf-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dotted #e2e1f0; }
    .pdf-row:last-child { border-bottom: none; }
    .pdf-row-block { flex-direction: column; gap: 4px; }
    .pdf-label { font-size: 12px; font-weight: 700; color: #6b6b8a; text-transform: uppercase; letter-spacing: 0.3px; }
    .pdf-value { font-size: 13px; font-weight: 600; color: #1a1a2e; }
    .pdf-signature-area { margin-top: 48px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .pdf-signature-line { width: 80%; height: 1px; background: #1a1a2e; }
    .pdf-signature-label { font-size: 12px; font-weight: 700; color: #6b6b8a; text-transform: uppercase; letter-spacing: 0.3px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  `;

  const doc = printFrame.contentDocument;
  doc.open();
  doc.write("<!DOCTYPE html><html><head><style>" + styles + "</style></head><body>" + page.outerHTML + "</body></html>");
  doc.close();

  printFrame.onload = () => {
    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();
    setTimeout(() => document.body.removeChild(printFrame), 1000);
  };
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return day + "/" + month + "/" + year;
}