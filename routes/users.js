const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const chalk = require('chalk');
const crypto = require('crypto');
const { model } = require('../db');

router.get('/all', (req, res) => {
  model.find({}, (err, users) => {
    if (err) return res.status(500).json({ error: 'Internal server error' });
    res.json(users);
  });
});

router.get('/:id', (req, res) => {
  const userId = req.params.id;
  model.findById(userId, (err, user) => {
    if (err) return res.status(500).json({ error: 'Internal server error' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
});

router.post('/add', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });

  const user = await model.findOne({ email: email.toLowerCase() });
  if (user) return res.status(400).json({ error: 'User already exists' });

  const id = crypto.randomInt(100000, 999999).toString();
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  const newUser = new model({ id, name, email: email.toLowerCase(), password: hashedPassword });

  newUser.save((err, user) => {
    if (err) return res.status(500).json({ error: 'Internal server error' });
    let id = user.id;

    res.status(201).json({ user, message: `User created with ID: ${id}` });
  });
});

module.exports = router;
