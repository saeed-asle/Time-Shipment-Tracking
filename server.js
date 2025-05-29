//server.js
const express = require('express');
routers=require('./server/routes/url')
const path = require('path');

const app = express();
const port =3001;
app.use(express.static(path.join(__dirname, 'client')));

app.get('/list/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'list.html'));
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Content-Type validation middleware
app.use((req, res, next) => {
  if (req.method !== 'GET' && !req.is('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }
  next();
});

app.use("/", routers);

const server = app.listen(port,()=>{ console.log('server started on port %s',server.address().port)});
