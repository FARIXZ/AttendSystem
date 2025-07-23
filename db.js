const mongoose = require('mongoose');
const chalk = require('chalk');

const attendanceEntrySchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true },
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  attendance: { type: [attendanceEntrySchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

const model = mongoose.model('User', employeeSchema);
const attendModel = mongoose.model('Attendance', attendanceEntrySchema);

// Functions ----------------

async function connect() {
  mongoose.connect(process.env.MONGO_URI);

  mongoose.connection.on('connected', () => {
    console.log(chalk.green('[>] Connected to MongoDB successfully.'));
  });

  mongoose.connection.on('error', (err) => {
    console.error(chalk.red('[!] Error connecting to MongoDB:', err));
  });
}

module.exports = { connect, model, attendModel };
