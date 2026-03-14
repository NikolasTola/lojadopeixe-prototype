document.addEventListener("DOMContentLoaded", () => {
  const session = getSession();
  if (!session) {
    window.location.replace("login.html");
    return;
  }

  const form = document.getElementById("change-password-form");
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const errorMessage = document.getElementById("error-message");

  const rules = {
    length: (p) => p.length >= 5,
    upper: (p) => /[A-Z]/.test(p),
    lower: (p) => /[a-z]/.test(p),
    number: (p) => /[0-9]/.test(p),
    special: (p) => /[!@#$%&*]/.test(p),
  };

  newPasswordInput.addEventListener("input", () => {
    const password = newPasswordInput.value;
    Object.entries(rules).forEach(([key, fn]) => {
      const el = document.getElementById("rule-" + key);
      if (fn(password)) {
        el.classList.add("valid");
      } else {
        el.classList.remove("valid");
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorMessage.classList.remove("visible");

    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    const allValid = Object.values(rules).every((fn) => fn(newPassword));
    if (!allValid) {
      errorMessage.textContent = "A senha não cumpre todos os requisitos.";
      errorMessage.classList.add("visible");
      return;
    }

    if (newPassword !== confirmPassword) {
      errorMessage.textContent = "As senhas não coincidem.";
      errorMessage.classList.add("visible");
      return;
    }

    updateUserPassword(session.login, newPassword);
    window.location.replace("dashboard.html");
  });
});