const mongoose = require('mongoose');
const chalk = require('chalk');
const express = require('express');
const router = express.Router();
const { attendModel } = require('../db');

router.get('/all', async (req, res) => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Find users with at least one attendance entry for today
    const users = await attendModel.find({
      'attendance.timestamp': { $gte: start, $lt: end },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/add', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'User ID is required.' });

  try {
    const attendanceEntry = { timestamp: new Date() };

    // Update the user's attendance
    await attendModel.updateOne({ id }, { $push: { attendance: attendanceEntry } });

    res.status(201).json({ message: 'Attendance recorded successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
