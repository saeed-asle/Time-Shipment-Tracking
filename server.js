const express = require('express');
const routers = require('./server/routes/url');
const path = require('path');

const app = express();
const port = 3001;

// Serve static files from 'client' directory
app.use(express.static(path.join(__dirname, 'client')));

// Serve specific HTML file for route /list/:id
app.get('/list/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'html','list.html'));
});

// Parse incoming JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure non-GET requests use application/json Content-Type
app.use((req, res, next) => {
  if (req.method !== 'GET' && !req.is('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }
  next();
});

// Use defined routers for route handling
app.use("/", routers);

// Start server
const server = app.listen(port, () => {
  console.log('server started on port %s', server.address().port);
});
