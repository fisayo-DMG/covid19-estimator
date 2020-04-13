/* eslint-disable no-console */
const http = require('http');
const url = require('url');
const fs = require('fs');
const builder = require('xmlbuilder');
const estimate = require('./src/utils');

const PORT = process.env.PORT || 5000;

const server = http.createServer();
let currentTime = null;

server.on('request', (req, res) => {
  currentTime = Date.now();
  const parsedUrl = url.parse(req.url, true);

  req.on('error', (err) => console.error(err, 'request error'));
  res.on('error', (err) => console.error(err, 'response error'));
  res.on('close', () => {
    let timeDiff = Date.now() - currentTime;
    if (timeDiff < 10) {
      timeDiff = `0${timeDiff}`;
    }
    const logText = `${req.method}\t\t${parsedUrl.pathname}\t\t${res.statusCode}\t\t${timeDiff}ms\n`;
    fs.appendFile('./src/log.txt', logText, (err) => {
      if (err) throw err;
    });
  });

  if (req.method === 'GET' && parsedUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream('./src/index.html').pipe(res);
    console.log(parsedUrl.pathname);
  } else if (req.method === 'GET' && parsedUrl.pathname === '/about') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream('./src/about.html').pipe(res);
    console.log(parsedUrl.pathname);
  } else if (
    req.method === 'POST'
    && (parsedUrl.pathname === '/api/v1/on-covid-19'
      || parsedUrl.pathname === '/api/v1/on-covid-19/json')
  ) {
    const body = [];
    req
      .on('data', (chunk) => {
        body.push(chunk);
      })
      .on('end', () => {
        const data = Buffer.concat(body);
        const parsedJSON = JSON.parse(data);
        const estimatedData = estimate(parsedJSON);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(estimatedData));
        res.end();
      });
  } else if (
    req.method === 'POST'
    && parsedUrl.pathname === '/api/v1/on-covid-19/xml'
  ) {
    const body = [];
    req
      .on('data', (chunk) => {
        body.push(chunk);
      })
      .on('end', () => {
        const data = Buffer.concat(body);
        const parsedJSON = JSON.parse(data);
        const estimatedData = estimate(parsedJSON);
        const xmlBuild = builder.create(estimatedData).end({ pretty: false });

        res.writeHead(200, { 'Content-Type': 'application/xml' });
        res.write(xmlBuild);
        res.end();
      });
  } else if (req.method === 'GET' && parsedUrl.pathname === '/api/v1/on-covid-19/logs') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=us-ascii' });
    fs.createReadStream('./src/log.txt').pipe(res);
  } else {
    res.writeHead(404, {
      'X-Powered-By': 'Node'
    });
    res.end();
  }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
