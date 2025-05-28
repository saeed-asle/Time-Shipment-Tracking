const express = require('express');

routers=require('')

 
const app = express();

app.get('/',(req,res)=>res.send('Hellow'));
app.listen(3000,()=>console.log('server started on port 3000'))