const express = require('express');
const mongoose = require('mongoose');
const { log } = require('./middleware/log');
const { connect } = require('./db');
const env = require('dotenv').config();
const chalk = require('chalk');
const app = express();
const PORT = 3000;
// npm i chalk@4 dotenv mongoose express

// Connect to MongoDB
connect().then(() => {
  console.log(chalk.green('[>] Connecting to MongoDB...'));
});

// Routers
const userRouter = require('./routes/users');
const attendRouter = require('./routes/attend');
app.use('/users', userRouter);
app.use('/attend', attendRouter);

// Middlewares
app.use(log);
app.use(express.json());
app.use(express.static('site'));

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/site/index.html');
});
