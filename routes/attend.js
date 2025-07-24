const mongoose = require('mongoose');
const chalk = require('chalk');
const express = require('express');
const router = express.Router();
const { model, attendModel } = require('../db');

router.use(express.json());

router.get('/all', async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end date are required as query parameters.' });
    }
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ error: 'Invalid date format.' });
    }
    // Find users with at least one attendance entry in the range
    const users = await model.find({
      'attendance.timestamp': { $gte: startDate, $lt: endDate },
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
    // Get today's date range
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Find user
    const user = await model.findOne({ id });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Check if already attended today
    const alreadyAttended = user.attendance.some((entry) => {
      const ts = new Date(entry.timestamp);
      return ts >= start && ts < end;
    });
    if (alreadyAttended) {
      return res.status(400).json({ error: 'Attendance already marked for today.' });
    }

    // Add attendance
    const attendanceEntry = { timestamp: new Date() };
    await model.updateOne({ id }, { $push: { attendance: attendanceEntry } });

    res.status(201).json({ message: 'Attendance recorded successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
