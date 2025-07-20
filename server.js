require('dotenv').config(); // load .env file (for secret settings)
require('./server/db/mongoose'); // connect to MongoDB

const express = require('express'); // bring express library
const routers = require('./server/urls'); // get routes (API paths)
const path = require('path'); // bring path library for file paths
const app = express(); // make express app
const port = 3001; // server will run on this port

// serve static files from 'client' folder
app.use(express.static(path.join(__dirname, 'client')));

// if user goes to /list, send buisnesList.html file
app.get('/list', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'html', 'buisnesList.html'));
});

// if user goes to /list/something, send packageList.html file
app.get('/list/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'html', 'packageList.html'));
});

// this helps server read JSON body
app.use(express.json());
// this helps server read form data (URL encoded)
app.use(express.urlencoded({ extended: true }));

// check that all non-GET requests send JSON
app.use((req, res, next) => {
  if (req.method !== 'GET' && !req.is('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }
  next(); // go next if OK
});

// use routers for API paths (from server/urls.js)
app.use("/", routers);

// start the server and listen on port
app.listen(port, () => {
  console.log('server started on port %s', port);
});
