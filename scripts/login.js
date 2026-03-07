document.addEventListener("DOMContentLoaded", () => {
  seedUsers();

  const session = getSession();
  if (session) {
    window.location.href = "dashboard.html";
    return;
  }

  const form = document.getElementById("login-form");
  const loginInput = document.getElementById("login");
  const passwordInput = document.getElementById("password");
  const errorMessage = document.getElementById("error-message");

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add("visible");
  }

  function hideError() {
    errorMessage.classList.remove("visible");
  }

  function validateFields() {
    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();

    if (!login || !password) {
      showError("Preencha todos os campos para continuar.");
      return false;
    }

    return true;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    hideError();

    if (!validateFields()) return;

    const loginValue = loginInput.value.trim();
    const passwordValue = passwordInput.value;
    const user = authenticate(loginValue, passwordValue);

    if (!user) {
      showError("Login ou Senha inválidos. Tente novamente.");
      return;
    }

    createSession(user);
    window.location.href = "dashboard.html";
  });

  [loginInput, passwordInput].forEach((input) => {
    input.addEventListener("input", hideError);
  });
});