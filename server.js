// app1/server.js
import express from 'express';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch'; // node 18+ hat fetch global, ansonsten npm install node-fetch

const PORT = 3001;
const AUTH_URL = 'http://localhost:4000';
const JWT_SECRET = 'secretkey'; // MUSS gleich sein wie im auth-service

const app = express();
app.use(express.json());

// Homepage (GET /)
app.get('/', (req, res) => {
  res.send(`
    <h1>App1</h1>
    <p>Try:</p>
    <ul>
      <li>POST /login  (forward to Auth-Service)</li>
      <li>GET  /dashboard (protected)</li>
    </ul>
  `);
});

// Login: leitet Credentials an Auth-Service weiter und gibt Token zurück
app.post('/login', async (req, res) => {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });
  const json = await response.json();
  return res.status(response.status).json(json);
});

// Auth-Middleware
const authenticate = (req, res, next) => {
  const auth = req.headers['authorization'];
  const token = auth?.split(' ')[1];
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
