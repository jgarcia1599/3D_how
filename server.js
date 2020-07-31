// create express web server
const express = require('express'); 
const app = express();
const router = require('./routes.js')

//choose port
const port = 3000;
const server = app.listen(process.env.PORT || port);


app.use('',router)

console.log('Server Running in Port: ',port);