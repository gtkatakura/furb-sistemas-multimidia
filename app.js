const express = require('express');

const port = process.env.PORT || 3000;
const app = express.createServer();

app.get('/', (request, response) => {
  response.sendfile(`${__dirname}/dist/index.html`);
}).configure(() => {
  app.use('/', express.static(`${__dirname}/dist/`));
}).listen(port);
