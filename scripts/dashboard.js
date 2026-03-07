document.addEventListener("DOMContentLoaded", () => {
    const session = getSession();
    if (!session) {
        window.location.replace("login.html");
        return;
    }

    document.getElementById("header-username").textContent = session.name;

    const formModal = document.getElementById("form-modal");
    const detailModal = document.getElementById("detail-modal");
    const deleteModal = document.getElementById("delete-modal");
    const editModal = document.getElementById("edit-modal");
    const exportModal = document.getElementById("export-modal");
    const cardList = document.getElementById("card-list");
    const errorMessage = document.getElementById("form-error");

    let pendingDeleteId = null;
    let editingServiceId = null;

    function getTodayFormatted() {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        return year + "-" + month + "-" + day;
    }

    function openFormModal() {
        document.getElementById("service-form").reset();
        document.getElementById("photo-preview").style.display = "none";
        document.getElementById("photo-preview").src = "";
        document.getElementById("field-date").value = getTodayFormatted();
        hideFormError();
        formModal.classList.add("active");
    }

    function closeFormModal() {
        formModal.classList.remove("active");
    }

    function hideFormError() {
        errorMessage.textContent = "";
        errorMessage.classList.remove("visible");
    }

    function showFormError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add("visible");
    }

    function validateForm() {
        const fields = [
            "field-name",
            "field-phone",
            "field-address",
            "field-cpf",
            "field-model",
            "field-color",
            "field-imei",
            "field-value",
            "field-date",
            "field-technical-report",
            "field-observations",
        ];

        for (const id of fields) {
            const el = document.getElementById(id);
            if (!el.value.trim()) {
                showFormError("Preencha todos os campos antes de continuar.");
                return false;
            }
        }

        const phone = document.getElementById("field-phone").value.trim();
        const phoneRegex = /^(\(?\d{2}\)?\s?)(\d{4,5}-?\d{4})$/;
        if (!phoneRegex.test(phone)) {
            showFormError("Telefone inválido. Use o formato (XX) XXXXX-XXXX.");
            return false;
        }

        const cpf = document.getElementById("field-cpf").value.trim();
        const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
        if (!cpfRegex.test(cpf)) {
            showFormError("CPF inválido. Use o formato XXX.XXX.XXX-XX.");
            return false;
        }

        return true;
    }

    function getStatusClass(status) {
        const map = {
            Parado: "status-stopped",
            Andamento: "status-progress",
            Completo: "status-complete",
            Cancelado: "status-cancelled",
        };
        return map[status] || "status-stopped";
    }

    function buildCard(service) {
        const card = document.createElement("div");
        card.className = "service-card";
        card.dataset.id = service.id;

        card.innerHTML =
            '<div class="card-top">' +
            '<span class="card-id">' + service.id + '</span>' +
            '<span class="card-status ' + getStatusClass(service.status) + '">' + service.status + '</span>' +
            '</div>' +
            '<div class="card-top">' +
            '<span class="card-name">' + service.name + '</span>' +
            '<span class="card-date">' + formatDateDisplay(service.date) + '</span>' +
            '</div>' +
            '<div class="card-middle">' +
            '<span class="card-model">' + service.model + ' - ' + service.color + '</span>' +
            '</div>' +
            '<div class="card-bottom">' +
            '<span class="card-value">R$ ' + service.value + '</span>' +
            '<div class="card-actions">' +
            '<button class="btn-export-card" data-id="' + service.id + '">Exportar</button>' +
            '<button class="btn-edit-card" data-id="' + service.id + '">Editar</button>' +
            '<button class="btn-delete-card" data-id="' + service.id + '">Excluir</button>' +
            '</div>' +
            '</div>';

        return card;
    }

    function renderCards() {
        const query = document.getElementById("search-input").value.trim().toLowerCase();
        const statusValue = document.getElementById("status-filter").value;
        const services = getServices().filter((s) => {
        const matchesQuery = !query ||
            s.name.toLowerCase().includes(query) ||
            s.model.toLowerCase().includes(query) ||
            s.color.toLowerCase().includes(query);
        const matchesStatus = !statusValue || s.status === statusValue;
        return matchesQuery && matchesStatus;
        });

        cardList.innerHTML = "";

        if (services.length === 0) {
            cardList.innerHTML = '<p class="empty-message">Nenhum serviço em aberto.</p>';
            return;
        }

        services.forEach((service) => {
            cardList.appendChild(buildCard(service));
        });
    }

    function openDetailModal(id) {
        const service = getServices().find((s) => s.id === id);
        if (!service) return;

        document.getElementById("detail-id").textContent = service.id;
        document.getElementById("detail-status").textContent = service.status;
        document.getElementById("detail-status").className =
            "detail-status " + getStatusClass(service.status);
        document.getElementById("detail-name").textContent = service.name;
        document.getElementById("detail-phone").textContent = service.phone;
        document.getElementById("detail-address").textContent = service.address;
        document.getElementById("detail-cpf").textContent = service.cpf;
        document.getElementById("detail-model").textContent = service.model;
        document.getElementById("detail-color").textContent = service.color;
        document.getElementById("detail-imei").textContent = service.imei;
        document.getElementById("detail-value").textContent = "R$ " + service.value;
        document.getElementById("detail-date").textContent = formatDateDisplay(service.date);
        document.getElementById("detail-technical-report").textContent = service.technicalReport;
        document.getElementById("detail-observations").textContent = service.observations;
        document.getElementById("detail-photo").textContent = service.photo;
        document.getElementById("detail-signature").textContent = service.signature || "—";

        detailModal.classList.add("active");
    }

    function closeDetailModal() {
        detailModal.classList.remove("active");
    }

    function openDeleteModal(id) {
        pendingDeleteId = id;
        deleteModal.classList.add("active");
    }

    function closeDeleteModal() {
        pendingDeleteId = null;
        deleteModal.classList.remove("active");
    }

    function openEditModal(id) {
        const service = getServices().find((s) => s.id === id);
        if (!service) return;

        editingServiceId = id;

        document.getElementById("edit-status").value = service.status;
        document.getElementById("edit-name").value = service.name;
        document.getElementById("edit-phone").value = service.phone;
        document.getElementById("edit-address").value = service.address;
        document.getElementById("edit-cpf").value = service.cpf;
        document.getElementById("edit-model").value = service.model;
        document.getElementById("edit-color").value = service.color;
        document.getElementById("edit-imei").value = service.imei;
        document.getElementById("edit-value").value = service.value;
        document.getElementById("edit-date").value = service.date;
        document.getElementById("edit-technical-report").value = service.technicalReport;
        document.getElementById("edit-observations").value = service.observations;

        document.getElementById("edit-error").classList.remove("visible");
        editModal.classList.add("active");
    }

    function closeEditModal() {
        editingServiceId = null;
        editModal.classList.remove("active");
    }

    function validateEditForm() {
        const fields = [
            "edit-name", "edit-phone", "edit-address", "edit-cpf",
            "edit-model", "edit-color", "edit-imei", "edit-value",
            "edit-date", "edit-technical-report", "edit-observations",
        ];

        for (const id of fields) {
            if (!document.getElementById(id).value.trim()) {
                document.getElementById("edit-error").textContent = "Preencha todos os campos antes de continuar.";
                document.getElementById("edit-error").classList.add("visible");
                return false;
            }
        }

        return true;
    }

    function confirmDelete() {
        if (pendingDeleteId) {
            deleteService(pendingDeleteId);
            renderCards();
        }
        closeDeleteModal();
    }

    document.getElementById("btn-new-service").addEventListener("click", openFormModal);

    document.getElementById("btn-close-form").addEventListener("click", closeFormModal);
    document.getElementById("btn-cancel-form").addEventListener("click", closeFormModal);

    document.getElementById("btn-close-detail").addEventListener("click", closeDetailModal);

    document.getElementById("btn-close-delete").addEventListener("click", closeDeleteModal);
    document.getElementById("btn-cancel-delete").addEventListener("click", closeDeleteModal);
    document.getElementById("btn-confirm-delete").addEventListener("click", confirmDelete);

    document.getElementById("btn-close-edit").addEventListener("click", closeEditModal);
    document.getElementById("btn-cancel-edit").addEventListener("click", closeEditModal);
    document.getElementById("btn-close-export").addEventListener("click", () => exportModal.classList.remove("active"));
    document.getElementById("btn-cancel-export").addEventListener("click", () => exportModal.classList.remove("active"));
    document.getElementById("btn-download-pdf").addEventListener("click", downloadPDF);

    document.getElementById("edit-form").addEventListener("submit", (event) => {
        event.preventDefault();
        if (!validateEditForm()) return;

        updateService(editingServiceId, {
            status: document.getElementById("edit-status").value,
            name: document.getElementById("edit-name").value.trim(),
            phone: document.getElementById("edit-phone").value.trim(),
            address: document.getElementById("edit-address").value.trim(),
            cpf: document.getElementById("edit-cpf").value.trim(),
            model: document.getElementById("edit-model").value.trim(),
            color: document.getElementById("edit-color").value.trim(),
            imei: document.getElementById("edit-imei").value.trim(),
            value: document.getElementById("edit-value").value.trim(),
            date: document.getElementById("edit-date").value,
            technicalReport: document.getElementById("edit-technical-report").value.trim(),
            observations: document.getElementById("edit-observations").value.trim(),
        });

        closeEditModal();
        renderCards();
    });

    document.getElementById("field-photo").addEventListener("change", (event) => {
        const file = event.target.files[0];
        const preview = document.getElementById("photo-preview");
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.style.display = "block";
            };
            reader.readAsDataURL(file);
        } else {
            preview.style.display = "none";
            preview.src = "";
        }
    });

    document.getElementById("service-form").addEventListener("submit", (event) => {
        event.preventDefault();
        hideFormError();

        if (!validateForm()) return;

        createService({
            name: document.getElementById("field-name").value.trim(),
            phone: document.getElementById("field-phone").value.trim(),
            address: document.getElementById("field-address").value.trim(),
            cpf: document.getElementById("field-cpf").value.trim(),
            model: document.getElementById("field-model").value.trim(),
            color: document.getElementById("field-color").value.trim(),
            imei: document.getElementById("field-imei").value.trim(),
            value: document.getElementById("field-value").value.trim(),
            date: document.getElementById("field-date").value,
            technicalReport: document.getElementById("field-technical-report").value.trim(),
            observations: document.getElementById("field-observations").value.trim(),
        });

        closeFormModal();
        renderCards();
    });

    cardList.addEventListener("click", (event) => {
        if (event.target.closest(".btn-delete-card")) {
            openDeleteModal(event.target.closest(".btn-delete-card").dataset.id);
            return;
        }

        if (event.target.closest(".btn-edit-card")) {
            openEditModal(event.target.closest(".btn-edit-card").dataset.id);
            return;
        }

        if (event.target.closest(".btn-export-card")) {
            generateServicePDF(event.target.closest(".btn-export-card").dataset.id);
            return;
        }

        const card = event.target.closest(".service-card");
        if (card) {
            openDetailModal(card.dataset.id);
        }
    });

    document.getElementById("btn-logout").addEventListener("click", () => {
        clearSession();
        window.location.replace("login.html");
    });

    document.getElementById("search-input").addEventListener("input", renderCards);
    document.getElementById("status-filter").addEventListener("change", renderCards);

    renderCards();
});