"use strict";

import express from "express";
import cors from "cors";
import http from "http";
import torrentStream from "torrent-stream";

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
const server = http.createServer(app);
server.listen(80);

let stream;

const startStream = (magnet, callback = () => {}) => {
  let engine = torrentStream(magnet);
  engine.on("ready", function () {
    engine.files.forEach(function (file) {
      if (file.name.includes(".mp4")) {
        console.log("filename:", file.name);
        stream = file.createReadStream();
        callback("Stream started");
        return;
      }
    });
  });
};

app.get("api/torrent/init-stream", (req, resp) => {
  const magnet = req.query.magnet;
  if (magnet) {
    try {
      startStream(magnet, (result) => {
        resp.send(result);
      });
    } catch (error) {
      resp.send(error);
    }
  } else {
    resp.send("Please provide magnet");
  }
});

app.get("api/torrent/get-stream", (req, resp) => {
  if (stream) {
    stream.pipe(resp);
  } else {
    resp.send(null);
  }
});
