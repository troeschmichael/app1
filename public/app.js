const loginForm = document.getElementById('login-form');
const userInfo = document.getElementById('user-info');
const registerFormDiv = document.getElementById('register-form');

let token = localStorage.getItem('token');
let username = localStorage.getItem('username');

const logoutBtn = document.getElementById('logout-btn');
const userSpan = document.getElementById('username-display');

const allowedUsers = ['admin', 'Mike'];
const usersTableBody = document.querySelector('#users-table tbody');

const AUTH_PROXY = '/auth'; // Nginx leitet /auth/ an Auth-Service weiter

// --- Benutzerliste laden ---
const loadUsers = async () => {
  if (!token) return; // nur wenn eingeloggt
  try {
    const res = await fetch(`${AUTH_PROXY}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Fehler beim Laden der Benutzer');
    const users = await res.json();
    usersTableBody.innerHTML = '';
    users.forEach(u => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${u.id}</td><td>${u.username}</td><td>${u.password_hash}</td>`;
      usersTableBody.appendChild(row);
    });
  } catch (e) {
    console.error('Fehler beim Laden der Benutzer', e);
  }
};

// --- UI anzeigen ---
const showUser = () => {
  if (token && username) {
    userSpan.textContent = username;
    registerFormDiv.style.display = 'block';
    logoutBtn.style.display = 'inline-block';
  } else {
    userSpan.textContent = '';
    registerFormDiv.style.display = 'none';
    logoutBtn.style.display = 'none';
  }
};

// --- Logout ---
logoutBtn.onclick = () => {
  token = null;
  username = null;
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  showUser();
  usersTableBody.innerHTML = '';
};

// --- Login ---
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const usernameInput = document.getElementById('username').value;
  const passwordInput = document.getElementById('password').value;

  if (!allowedUsers.includes(usernameInput)) {
    alert('Dieser Benutzer darf sich nicht einloggen');
    return;
  }

  try {
    const res = await fetch(`${AUTH_PROXY}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput, password: passwordInput })
    });

    const data = await res.json();
    if (res.ok && data.token) {
      token = data.token;
      username = usernameInput;
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      showUser();
      loadUsers();
    } else {
      alert('Login fehlgeschlagen');
    }
  } catch (err) {
    console.error(err);
    alert('Fehler beim Login');
  }
});

// --- Register ---
document.getElementById('register-btn').addEventListener('click', async () => {
  const newUsername = document.getElementById('new-username').value;
  const newPassword = document.getElementById('new-password').value;

  try {
    const res = await fetch(`${AUTH_PROXY}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ username: newUsername, password: newPassword })
    });

    const text = await res.text();
    alert(text);
    loadUsers(); // nach Register Liste aktualisieren
  } catch (e) {
    console.error(e);
    alert('Fehler beim Registrieren');
  }
});

// --- Initialisierung ---
showUser();
if (token) loadUsers();
