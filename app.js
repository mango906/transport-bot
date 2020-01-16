const express = require("express");
const app = express();
const http = require("http").createServer(app);

http.listen(4000, function() {
  console.log("server on!");
});

module.exports = app;
