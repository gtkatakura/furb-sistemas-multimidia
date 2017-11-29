const { createServer } = require('./server/bootstrap');

createServer(`${__dirname}/dist`);
