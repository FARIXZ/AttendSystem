const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const chalk = require('chalk');
const crypto = require('crypto');
const { model } = require('../db');
const { appendFile } = require('fs');

router.use(express.json());

router.get('/all', async (req, res) => {
  try {
    let users = await model.find();
    return res.json(users);
  } catch (err) {
    console.error(chalk.red('[3] Error fetching users:', err));
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await model.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(chalk.red('[4] Error fetching user:', err));
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const user = await model.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ success: false, message: 'User not found' });

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    if (user.password === hashedPassword) return res.json({ success: true });
    else return res.json({ success: false, message: 'Incorrect password' });
  } catch (err) {
    console.error(chalk.red('[1] Error fetching user:', err));
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/add', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });

  const user = await model.findOne({ email: email.toLowerCase() });
  if (user) return res.status(400).json({ error: 'User already exists' });

  const id = crypto.randomInt(100000, 999999).toString();
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  const newUser = new model({ id, name, email: email.toLowerCase(), password: hashedPassword });

  try {
    let createdUser = await newUser.save();
    res.status(201).json({ message: `User created with ID: ${id}` });
  } catch (err) {
    console.error(chalk.red('[2] Error saving user:', err));
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
