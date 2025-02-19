const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:8080'
}));

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use((req, res, next) => {
  if (req.path === '/login' || req.path === '/register') return next();
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Access denied. No token provided.');
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(400).send('Invalid token.');
    req.user = decoded;
    next();
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'secret' && password === 'secret') {
  const user = { id: 1, name: 'Admin' };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token }); 
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const response = await axios.post('http://user-service:4000/register', req.body);
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error calling user-service register');
  }
});

app.get('/api/user', async (req, res) => {
  try {
    const response = await axios.get('http://user-service:4000/user');
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error calling user-service');
  }
});

app.get('/api/task', async (req, res) => {
  try {
    const response = await axios.get('http://task-service:5000/task');
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error calling task-service');
  }
});

app.get('/api/analytics', async (req, res) => {
  try {
    const response = await axios.get('http://analytics-service:6000/analytics/tasks');
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error calling analytics-service');
  }
});

app.listen(3000, () => {
  console.log('API Gateway running on port 3000');
});
