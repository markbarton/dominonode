const express = require("express");
const path = require("path");
const pjson = require("./package.json");
const port = ("port", process.env.PORT || 8088);
const app = express();
const rp = require("request-promise");

const bodyParser = require("body-parser");
const setCookie = require("set-cookie-parser");

app.use(bodyParser.json());

app.get("/demo", function(req, res, next) {
  const options = {
    uri: "http://Egghead1/nodejs.nsf/api/data/collections/name/all",
    resolveWithFullResponse: true
  };

  rp(options)
    .then(function(response) {
      const { headers, body } = response;
      if ("dominoauthenticationfailure" in headers) {
        // Authentication Failure - lets bat it back
        return res.status(401).send(headers.dominoauthenticationfailure);
      }
      return res.send(response.body);
    })
    .catch(function(err) {
      return res.status(err.response.statusCode).send(err.response.body);
    });
});

app.post("/login", function(req, res, next) {

  const{Username, Password} = req.body;
  const options = {
    uri: "http://Egghead1/names.nsf?login",
    resolveWithFullResponse: true,
    form: { Username, Password },
    simple: false
  };

  rp
    .post(options)
    .then(function(response) {
      const { headers, body } = response;
      const dominoauthenticationfailure = headers.dominoauthenticationfailure;

      // Check for any Domino login errors
      if (!dominoauthenticationfailure) {
        // Authentication Failure - lets bat it back
        return res.status(401).send(dominoauthenticationfailure);
      }

      // Decode cookies from Domino response using set-cookie-parser library
      const cookies = setCookie.parse(response, {
        decodeValues: true // default: true
      });

      //Filter cookies to only DomAuthSessId
      const domino_auth_cookie = cookies.filter(function(cookie) {
        return cookie.name === "DomAuthSessId";
      });

      // now send it back
      if(domino_auth_cookie.length > 0){
        return res.send(domino_auth_cookie[0].value);
      }
     
      return res.send({});
    })
    .catch(function(err) {
      return res.send(err);
    });
});

app.get("/dominodata", function (req,res,next){

  // Descontruct - headers are lowercased
  const {nodedomauthsessid} = req.headers;
  console.log(nodedomauthsessid);
  // Check for nodedomauthsessid
  if (!nodedomauthsessid) {
    // Authentication Failure - lets bat it back
    return res.status(401).send(`No NodeDomAuthSessId header`);
  }

  // attempt to get Domino Data - passing header
  const options = {
    uri: "http://Egghead1/nodejs.nsf/api/data/collections/name/all",
    resolveWithFullResponse: true,
    headers:{
     'Cookie': `DomAuthSessId=${nodedomauthsessid}`
    }
   
  };

  rp(options)
    .then(function(response) {
      const { headers, body } = response;
      if ("dominoauthenticationfailure" in headers) {
        // Authentication Failure - lets bat it back
        return res.status(401).send(headers.dominoauthenticationfailure);
      }
      return res.send(response.body);
    })
    .catch(function(err) {
      return res.status(err.response.statusCode).send(err.response.body);
    });

})

// Serve static files
app.use(express.static("public"));

const server = app.listen(port);
console.log(`😁  ${pjson.name} running → PORT ${server.address().port}`);
