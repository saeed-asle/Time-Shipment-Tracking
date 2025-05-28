const express = require('express');
routers=require('./server/routes/url')

const app = express();
const port =3001;

app.use(express.json());
app.use(express.urlencoded({ extended:true}))

app.use("/",routers)

const server = app.listen(port,()=>{ console.log('server started on port %s',server.address().port)});
