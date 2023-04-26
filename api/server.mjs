"use strict";

import express from "express";
import cors from "cors";
import http from "http";
import TorrentSearchApi from "torrent-search-api";

TorrentSearchApi.enablePublicProviders();

const getMagnet = async (torrent, calback = () => {}) => {
  await TorrentSearchApi.getMagnet(torrent).then((magnet) => {
    calback(magnet);
  });
};

const torrentSearch = async (query, type, calback = () => {}) => {
  const torrent = await TorrentSearchApi.search(query, type, 1);
  getMagnet(torrent[0], calback);
};

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
const server = http.createServer(app);
server.timeout = 30000;
server.listen(80);

app.get("/api/torrent/magnet-search", (req, resp) => {
  const query = req.query.query;
  const type = req.query.type;
  if (query && type) {
    try {
      torrentSearch(query, type, (result) => {
        resp.send({
          status: "OK",
          msg: `Magnet search by type - ${type} and query - ${query} processed successfully`,
          result: result,
        });
      });
    } catch (error) {
      resp.send({
        status: "BAD",
        msg: `Magnet search by type - ${type} and query - ${query} filed`,
        result: null,
      });
    }
  } else {
    resp.send({
      status: "BAD",
      msg: `Please provide query and type`,
      result: null,
    });
  }
});

app.get("/api/torrent/webtor", (req, resp) => {
  const query = req.query.query;
  const type = req.query.type;
  if (query && type) {
    try {
      torrentSearch(query, type, (result) => {
        let htmlPage = `
          <!doctype html>
            <html>
              <head>
                <title>Webtor Player</title>
                <meta charset="utf-8">
                <meta content="width=device-width, initial-scale=1" name="viewport">
                <meta content="ie=edge" http-equiv="x-ua-compatible">
                <style>
                  html, body, iframe {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                  }
                </style>
                <script src="https://cdn.jsdelivr.net/npm/@webtor/embed-sdk-js/dist/index.min.js" charset="utf-8" async></script>
              </head>
              <body>
                <video controls src="${result}"></video>
              </body>
            </html>
        `;
        resp.send(htmlPage);
      });
    } catch (error) {
      resp.send({
        status: "BAD",
        msg: `Magnet search by type - ${type} and query - ${query} filed`,
        result: null,
      });
    }
  } else {
    resp.send({
      status: "BAD",
      msg: `Please provide query and type`,
      result: null,
    });
  }
});
