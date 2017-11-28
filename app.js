const express = require('express');

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.static(`${__dirname}/dist`));

app.get('*', (request, response) => {
  response.sendFile(`${__dirname}/dist/index.html`);
});

app.listen(PORT);
