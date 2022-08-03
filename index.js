/* eslint-disable no-console */
const http = require('http');
const finalhandler = require('finalhandler');
const serveStatic = require('serve-static');
const express = require("express");
const fetch = require("node-fetch");
const iconv = require("iconv-lite");
const app = express();
const cors = require("cors");
//Enable  CORS
app.use(cors());

// utilize the same pattern for exiting port and cache settings
const serverPortNumber = process.env.SERVER_PORT || 8888;
const args = process.argv.slice(2);
const disableCache = Array.isArray(args) && args.includes('--no-cache');

// disable cache
const setCustomCacheControl = (res, path) => {
  console.log(`[HTTP Server] serving resource: ${path}`);

  if (disableCache) {
    res.setHeader('Cache-Control', 'public, max-age=0');
  }
};

// serve root folder supporting relative path for accessing resources and cache settings
/*
const serve = serveStatic('./', {
  setHeaders: setCustomCacheControl,
});
*/ // Calling Static with express method
app.use(express.static('./'));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.listen(serverPortNumber);

app.post("/proxy/*", async (req, res) => {
  let url = req.url.split("/proxy/")[1];
  let options = {
    method: req.body.method
  };

  if (req.body.token) {
    options["headers"] = {
      Authorization: `Bearer ${req.body.token}`
    };
  }

  try {
    let data;
    let response = await fetch(url, options);
    if (req.body.encoding && req.body.encoding !== "") {
      let buffer = await response.arrayBuffer();
      data = iconv.decode(new Buffer(buffer), req.body.encoding).toString();
    } else {
      data = await response.text();
    }
    response.ok ? res.send(data) : res.send({ error: response.statusText });
    return;
  } catch (error) {
    res.send({ error: error.message });
    return;
  }
});
/*
const httpServer = http.createServer((req, res) => {
  serve(req, res, finalhandler(req, res));
});
httpServer.listen(serverPortNumber);
*/

console.log(`[HTTP Server] serving at: http://localhost:${serverPortNumber.toString().trim()}/Simulator/index.html`);
console.log(`[HTTP Server] disable serving resources with cache: ${disableCache}`);
