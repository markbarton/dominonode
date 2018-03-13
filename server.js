const express = require("express");
const path = require("path");
const pjson = require("./package.json");
const port = ("port", process.env.PORT || 8088);
const app = express();



// Image Properties
app.post("/color", upload.single("file"), function(req, res, next) {
  
    client
    .imageProperties(req.file.path)
    .then(results => {
      // send result data
      res.send(results);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});

// Serve static files
app.use(express.static('public'))

const server = app.listen(port);
console.log(`😁  ${pjson.name} running → PORT ${server.address().port}`);
