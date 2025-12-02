import express from 'express';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';


const PORT = 3001;
const AUTH_URL = '/auth';  // oder volle URL: https://127.0.0.1/auth
const JWT_SECRET = 'secretkey';

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Proxy für /users
app.get('/users', async (req, res) => {
  try {
    const response = await fetch(`${AUTH_URL}/users`);
    const users = await response.json();
    res.json(users);
  } catch (e) {
    res.status(500).send('Fehler beim Abrufen der Benutzer');
  }
});

// Proxy für /register
app.post('/register', async (req, res) => {
  try {
    console.log('Forwarding Register:', req.body); // Debug
    const response = await fetch(`${AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const text = await response.text();
    res.status(response.status).send(text);
  } catch(e) {
    console.error('Fehler bei Register Proxy:', e);
    res.status(500).send('Fehler bei Register');
  }
});


// Login-Proxy
app.post('/login', async (req, res) => {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });
  const json = await response.json();
  return res.status(response.status).json(json);
});

// Dashboard (JWT-geschützt)
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).send('No token');

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = user;
    next();
  });
};

app.get('/dashboard', authenticate, (req, res) => {
  res.send(`Hallo ${req.user.username}, willkommen auf App1!`);
});

app.listen(PORT, () => {
  console.log(`App1 läuft auf http://localhost:${PORT}/`);
});
