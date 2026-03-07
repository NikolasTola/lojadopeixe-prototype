const DEFAULT_USERS = [
  {
    name: "Admin",
    login: "admin",
    role: "admin",
    password: "Senhaforte@123",
  },
  {
    name: "Manager",
    login: "manager",
    role: "manager",
    password: "Senhaforte@123",
  },
];

function seedUsers() {
  const existing = localStorage.getItem("users");
  if (!existing) {
    localStorage.setItem("users", JSON.stringify(DEFAULT_USERS));
  }
}

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function createSession(user) {
  const session = {
    name: user.name,
    login: user.login,
    role: user.role,
  };
  localStorage.setItem("session", JSON.stringify(session));
}

function getSession() {
  return JSON.parse(localStorage.getItem("session"));
}

function clearSession() {
  localStorage.removeItem("session");
}

function authenticate(loginValue, passwordValue) {
  const users = getUsers();
  return (
    users.find(
      (user) => user.login === loginValue && user.password === passwordValue
    ) || null
  );
}