document.addEventListener("DOMContentLoaded", () => {
    const session = getSession();
    if (!session || session.role !== "admin") {
        window.location.replace("dashboard.html");
        return;
    }

    document.getElementById("header-username").textContent = session.name;

    const userList = document.getElementById("user-list");
    const userFormModal = document.getElementById("user-form-modal");
    const passwordModal = document.getElementById("password-modal");
    const blockModal = document.getElementById("block-modal");
    const deleteUserModal = document.getElementById("delete-user-modal");

    let pendingBlockLogin = null;
    let pendingDeleteLogin = null;

    function getRoleLabel(role) {
        return role === "admin" ? "Admin" : "Manager";
    }

    function buildUserCard(user) {
        const isAdmin = user.login === "admin";
        const isCurrentUser = user.login === session.login;
        const showActions = !isAdmin && !isCurrentUser;
        const blockLabel = user.blocked ? "Desbloquear" : "Bloquear";

        const card = document.createElement("div");
        card.className = "user-card";
        card.dataset.login = user.login;

        card.innerHTML =
            '<div class="user-card-info">' +
                '<span class="user-card-name">' + user.name + '</span>' +
                '<span class="user-card-login">@' + user.login + '</span>' +
                '<div class="user-card-meta">' +
                    '<span class="user-card-role">' + getRoleLabel(user.role) + '</span>' +
                    '<span class="user-card-status ' + (user.blocked ? "blocked" : "active") + '">' +
                        (user.blocked ? "Bloqueado" : "Ativo") +
                    '</span>' +
                '</div>' +
                '<div class="user-card-dates">' +
                    '<span class="user-card-date">Criado em: ' + formatDateDisplay(user.createdAt) + '</span>' +
                    '<span class="user-card-date">Último login: ' + (user.lastLogin ? formatDateDisplay(user.lastLogin) : "Nunca") + '</span>' +
                '</div>' +
            '</div>' +
            (showActions ?
                '<div class="user-card-actions">' +
                    '<button class="btn-block-user" data-login="' + user.login + '">' + blockLabel + '</button>' +
                    '<button class="btn-delete-user" data-login="' + user.login + '">Excluir</button>' +
                '</div>'
                : '');

        return card;
    }

    function renderUsers() {
        const users = getUsers();
        userList.innerHTML = "";
        users.forEach((user) => {
            userList.appendChild(buildUserCard(user));
        });
    }

    function openUserFormModal() {
        document.getElementById("user-form").reset();
        document.getElementById("user-form-error").classList.remove("visible");
        userFormModal.classList.add("active");
    }

    function closeUserFormModal() {
        userFormModal.classList.remove("active");
    }

    function openPasswordModal(password) {
        document.getElementById("generated-password").textContent = password;
        passwordModal.classList.add("active");
    }

    function closePasswordModal() {
        passwordModal.classList.remove("active");
    }

    function openBlockModal(login) {
        const user = getUsers().find((u) => u.login === login);
        if (!user) return;
        pendingBlockLogin = login;
        const isBlocked = user.blocked;
        document.getElementById("block-modal-title").textContent =
            isBlocked ? "Desbloquear usuário" : "Bloquear usuário";
        document.getElementById("block-modal-message").textContent =
            (isBlocked ? "Deseja desbloquear o usuário " : "Deseja bloquear o usuário ") +
            user.name + "?";
        blockModal.classList.add("active");
    }

    function closeBlockModal() {
        pendingBlockLogin = null;
        blockModal.classList.remove("active");
    }

    function openDeleteUserModal(login) {
        const user = getUsers().find((u) => u.login === login);
        if (!user) return;
        pendingDeleteLogin = login;
        document.getElementById("delete-user-message").textContent =
            "Tem certeza que deseja excluir o usuário " + user.name + "? Esta ação não pode ser desfeita.";
        deleteUserModal.classList.add("active");
    }

    function closeDeleteUserModal() {
        pendingDeleteLogin = null;
        deleteUserModal.classList.remove("active");
    }

    document.getElementById("btn-new-user").addEventListener("click", openUserFormModal);
    document.getElementById("btn-close-user-form").addEventListener("click", closeUserFormModal);
    document.getElementById("btn-cancel-user-form").addEventListener("click", closeUserFormModal);

    document.getElementById("user-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const errorEl = document.getElementById("user-form-error");
        errorEl.classList.remove("visible");

        const name = document.getElementById("user-name").value.trim();
        const login = document.getElementById("user-login").value.trim();
        const role = document.getElementById("user-role").value;

        if (!name || !login) {
            errorEl.textContent = "Preencha todos os campos.";
            errorEl.classList.add("visible");
            return;
        }

        const existing = getUsers().find((u) => u.login === login);
        if (existing) {
            errorEl.textContent = "Esse login já está em uso.";
            errorEl.classList.add("visible");
            return;
        }

        const { password } = createUser({ name, login, role });
        closeUserFormModal();
        renderUsers();
        openPasswordModal(password);
    });

    document.getElementById("btn-close-password-modal").addEventListener("click", closePasswordModal);
    document.getElementById("btn-close-password-ok").addEventListener("click", closePasswordModal);

    document.getElementById("btn-copy-password").addEventListener("click", () => {
        const password = document.getElementById("generated-password").textContent;
        navigator.clipboard.writeText(password).then(() => {
            document.getElementById("btn-copy-password").textContent = "Copiado!";
            setTimeout(() => {
                document.getElementById("btn-copy-password").textContent = "Copiar";
            }, 2000);
        });
    });

    document.getElementById("btn-close-block").addEventListener("click", closeBlockModal);
    document.getElementById("btn-cancel-block").addEventListener("click", closeBlockModal);
    document.getElementById("btn-confirm-block").addEventListener("click", () => {
        if (pendingBlockLogin) {
            toggleBlockUser(pendingBlockLogin);
            renderUsers();
        }
        closeBlockModal();
    });

    document.getElementById("btn-close-delete-user").addEventListener("click", closeDeleteUserModal);
    document.getElementById("btn-cancel-delete-user").addEventListener("click", closeDeleteUserModal);
    document.getElementById("btn-confirm-delete-user").addEventListener("click", () => {
        if (pendingDeleteLogin) {
            deleteUser(pendingDeleteLogin);
            renderUsers();
        }
        closeDeleteUserModal();
    });

    userList.addEventListener("click", (event) => {
        const blockBtn = event.target.closest(".btn-block-user");
        if (blockBtn) {
            openBlockModal(blockBtn.dataset.login);
            return;
        }

        const deleteBtn = event.target.closest(".btn-delete-user");
        if (deleteBtn) {
            openDeleteUserModal(deleteBtn.dataset.login);
        }
    });

    document.getElementById("btn-logout").addEventListener("click", () => {
        clearSession();
        window.location.replace("login.html");
    });

    renderUsers();
});