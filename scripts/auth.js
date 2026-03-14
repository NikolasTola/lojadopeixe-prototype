const DEFAULT_USERS = [
  {
    name: "Admin",
    login: "admin",
    role: "admin",
    password: "Senhaforte@123",
    blocked: false,
    mustChangePassword: false,
    createdAt: "2000-01-01",
    lastLogin: null,
  },
  {
    name: "Manager",
    login: "manager",
    role: "manager",
    password: "Senhaforte@123",
    blocked: false,
    mustChangePassword: false,
    createdAt: "2000-01-01",
    lastLogin: null,
  },
];

function seedUsers() {
  const existing = localStorage.getItem("users");
  if (!existing) {
    localStorage.setItem("users", JSON.stringify(DEFAULT_USERS));
  }
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
  const user = users.find(
    (u) => u.login === loginValue && u.password === passwordValue
  );
  if (!user) return { success: false, reason: "invalid" };
  if (user.blocked) return { success: false, reason: "blocked" };
  return { success: true, user };
}



function generatePassword() {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%&*";
  const all = upper + lower + numbers + special;
  let password =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    special[Math.floor(Math.random() * special.length)];
  for (let i = 0; i < 4; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  return password.split("").sort(() => Math.random() - 0.5).join("");
}

function validatePasswordRules(password) {
  return (
    password.length >= 5 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%&*]/.test(password)
  );
}

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function createUser(data) {
  const users = getUsers();
  const password = generatePassword();
  const user = {
    name: data.name,
    login: data.login,
    role: data.role,
    password: password,
    blocked: false,
    mustChangePassword: true,
    createdAt: new Date().toISOString().split("T")[0],
    lastLogin: null,
  };
  users.push(user);
  saveUsers(users);
  return { user, password };
}

function deleteUser(login) {
  const users = getUsers().filter((u) => u.login !== login);
  saveUsers(users);
}

function toggleBlockUser(login) {
  const users = getUsers();
  const index = users.findIndex((u) => u.login === login);
  if (index === -1) return;
  users[index].blocked = !users[index].blocked;
  saveUsers(users);
}

function updateUserPassword(login, newPassword) {
  const users = getUsers();
  const index = users.findIndex((u) => u.login === login);
  if (index === -1) return;
  users[index].password = newPassword;
  users[index].mustChangePassword = false;
  saveUsers(users);
}

function updateLastLogin(login) {
  const users = getUsers();
  const index = users.findIndex((u) => u.login === login);
  if (index === -1) return;
  users[index].lastLogin = new Date().toISOString().split("T")[0];
  saveUsers(users);
}