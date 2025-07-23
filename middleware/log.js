const chalk = require('chalk');

exports.log = (req, res, next) => {
  console.log(chalk.blue(`[${new Date().toUTCString()}] Method: ${req.method} - URL: ${req.url} - IP: ${req.ip}`));
  next();
};
