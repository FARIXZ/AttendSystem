// Fake data generator for AttendSystem
// Usage: node fakedata.js (ensure MongoDB is running and MONGO_URI is set)

const { model, connect } = require('./db');
const crypto = require('crypto');
require('dotenv').config();

const NUM_USERS = 100;
const START_DATE = new Date('2025-01-01');
const END_DATE = new Date('2025-07-24');
const PASSWORD = '1234';

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomAttendanceEntries() {
  // Each user gets between 10 and 40 attendances, spread across the range
  const count = Math.floor(Math.random() * 31) + 10;
  const dates = [];
  for (let i = 0; i < count; i++) {
    dates.push({ timestamp: randomDate(START_DATE, END_DATE) });
  }
  // Sort by date ascending
  dates.sort((a, b) => a.timestamp - b.timestamp);
  return dates;
}

async function main() {
  await connect();
  await model.deleteMany({ role: 'user' });
  // Use crypto.pbkdf2Sync for password hashing (adjust to match your app's logic)
  const salt = crypto.createHash('sha256').update(PASSWORD).digest('hex');
  const passwordHash = `${salt}`;
  const users = [];
  for (let i = 1; i <= NUM_USERS; i++) {
    const id = `U${i.toString().padStart(4, '0')}`;
    const name = `User ${i}`;
    const email = `user${i}@example.com`;
    users.push({
      id,
      name,
      email,
      password: passwordHash,
      role: 'user',
      attendance: randomAttendanceEntries(),
    });
  }
  await model.insertMany(users);
  console.log(`Inserted ${users.length} fake users with attendances.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
