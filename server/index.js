const express = require('express');

//const config = require('./config.json')[process.env.NODE_ENV=development];
const cors = require('cors');
const route = require('./route');
const app = express();
const port = 3333;

app.use(cors());

app.use('/', route);

//The 404 Route (ALWAYS Keep this as the last route)
app.use(function(req, res) {
  res.status(404).send('PAGE NOT FOUND!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
