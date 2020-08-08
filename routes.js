const express = require('express');
const router = express.Router();
// use static files to serve to client that reside on public folder
router.use(express.static('public'));
// Home page route.
router.get('/', function (req, res) {
  res.sendFile(__dirname+'/public/index.html');
})

// Display Mode page route.
router.get('/displaymode', function (req, res) {
  res.sendFile(__dirname+'/public/display-mode.html');
})

module.exports = router;