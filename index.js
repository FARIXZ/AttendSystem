const express = require('express');
const mongoose = require('mongoose');
const { log } = require('./middleware/log');
const app = express();
const PORT = 3000;

// Routers
const userRouter = require('./routes/users');
app.use('/users', userRouter);

// Middleware
app.use(log);

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.sendStatus(200);
});
