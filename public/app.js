const loginForm = document.getElementById('login-form');
const userInfo = document.getElementById('user-info');
const registerFormDiv = document.getElementById('register-form');
const dashboardDiv = document.getElementById('dashboard');

let token = localStorage.getItem('token');
let username = localStorage.getItem('username');

const allowedUsers = ['admin', 'Mike'];

const usersTableBody = document.querySelector('#users-table tbody');

// Funktion: Benutzerliste laden
const loadUsers = async () => {
  try {
    const res = await fetch('/users');
    const users = await res.json();
    usersTableBody.innerHTML = ''; // Tabelle leeren
    users.forEach(u => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${u.id}</td><td>${u.username}</td><td>${u.password_hash}</td>`;
      usersTableBody.appendChild(row);
    });
  } catch (e) {
    console.error('Fehler beim Laden der Benutzer', e);
  }
};

// Nach Login: Benutzerliste laden
if (token) loadUsers();

// Nach Register: Benutzerliste aktualisieren
document.getElementById('register-btn').addEventListener('click', async () => {
  const newUsername = document.getElementById('new-username').value;
  const newPassword = document.getElementById('new-password').value;

  const res = await fetch('/register', {  // <-- hier nur App1
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: newUsername, password: newPassword })
  });

  const text = await res.text();
  alert(text);
});


const showUser = () => {
  if (token && username) {
    userInfo.innerHTML = `Eingeloggt als ${username} <button id="logout">Logout</button>`;
    document.getElementById('logout').onclick = () => {
      token = null;
      username = null;
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      registerFormDiv.style.display = 'none';
      location.reload();
    };
    registerFormDiv.style.display = 'block';
  } else {
    userInfo.innerHTML = '';
    registerFormDiv.style.display = 'none';
  }
};

showUser();

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const usernameInput = document.getElementById('username').value;
  const passwordInput = document.getElementById('password').value;
  
  // Nur erlaubte Benutzer
  if (!allowedUsers.includes(usernameInput)) {
    alert('Dieser Benutzer darf sich nicht einloggen');
    return;
  }

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: usernameInput, password: passwordInput })
  });

  const data = await res.json();
  if (data.token) {
    token = data.token;
    username = usernameInput;
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    showUser();
    loadUsers(); // Benutzerliste nach Login laden
  } else {
    alert('Login fehlgeschlagen');
  }
});

// Register neuer Benutzer
document.getElementById('register-btn').addEventListener('click', async () => {
  const newUsername = document.getElementById('new-username').value;
  const newPassword = document.getElementById('new-password').value;

  const res = await fetch(`${window.location.origin.replace('3001','4000')}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: newUsername, password: newPassword })
  });

  const text = await res.text();
  alert(text);
});
