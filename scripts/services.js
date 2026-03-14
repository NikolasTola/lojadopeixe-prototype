function generateId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return "SVC-" + timestamp + "-" + random;
}

function getServices() {
  return JSON.parse(localStorage.getItem("services")) || [];
}

function saveServices(services) {
  localStorage.setItem("services", JSON.stringify(services));
}

function createService(data) {
  const services = getServices();
  const service = {
    id: generateId(),
    status: "Parado",
    name: data.name,
    phone: data.phone,
    address: data.address,
    cpf: data.cpf,
    signature: data.signature || "",
    model: data.model,
    color: data.color,
    imei: data.imei,
    value: parseFloat(String(data.value).replace(",", ".")),
    date: data.date,
    technicalReport: data.technicalReport,
    observations: data.observations,
    photo: "Imagem Salva",
    updatedAt: new Date().toISOString().split("T")[0],
  };
  services.push(service);
  saveServices(services);
  return service;
}

function deleteService(id) {
  const services = getServices().filter((s) => s.id !== id);
  saveServices(services);
}

function updateService(id, data) {
  const services = getServices();
  const index = services.findIndex((s) => s.id === id);
  if (index === -1) return;
  services[index] = Object.assign(services[index], data);
  services[index].updatedAt = new Date().toISOString().split("T")[0];
  saveServices(services);
}

function formatCurrency(value) {
    return parseFloat(value).toFixed(2).replace(".", ",");
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return day + "/" + month + "/" + year;
}