require('dotenv').config();
require('./server/db/mongoose'); 

const express = require('express');
const routers = require('./server/urls'); 
const path = require('path');
const app = express();
const port = 3001;

app.use(express.static(path.join(__dirname, 'client')));
app.get('/list', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'html', 'buisnesList.html'));
});
app.get('/list/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'html', 'packageList.html'));
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.method !== 'GET' && !req.is('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }
  next();
});

app.use("/", routers);

app.listen(port, () => {
  console.log('server started on port %s', port);
});
