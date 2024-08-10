const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const Grievance = require('../models/Grievance'); // Import the Grievance model
const router = express.Router();

// Admin Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the credentials match the static credentials
  if (
    username === config.admin.username &&
    password === config.admin.password
  ) {
    const token = jwt.sign({ username }, config.jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ msg: 'Invalid credentials' });
  }
});

// Middleware to protect admin routes
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
};

// Example protected route to fetch grievances
router.get('/grievances', authMiddleware, (req, res) => {
  Grievance.find().then(grievances => res.json(grievances)).catch(err => res.status(500).json({ error: err.message }));
});

module.exports = router;
