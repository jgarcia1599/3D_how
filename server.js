// create express web server
var express = require('express'); 
var app = express();
//choose port
var port = 3000;
var server = app.listen(process.env.PORT || port);
// use static files to serve to client that reside on public folder
app.use(express.static('public'));

console.log('Server Running in Port: ',port);