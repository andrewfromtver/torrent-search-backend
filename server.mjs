'use strict';

import express from 'express';
import cors from 'cors';
import http from 'http';
import https from 'https';
import fs from 'fs';
import TorrentSearchApi from 'torrent-search-api';

TorrentSearchApi.enablePublicProviders();

const getMagnet = async (torrent, calback = () => {}) => {
    await TorrentSearchApi.getMagnet(torrent).then(magnet => {
        calback(magnet);
    });
}

const torrentSearch = async (query, type, calback = () => {}) => {
    const torrent = await TorrentSearchApi.search(query, type, 1);
    getMagnet(torrent[0], calback)
}

let options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
};

const app = express();
app.use(cors({
    origin: '*'
}));
const server = https.createServer(options, app);
server.timeout = 30000
server.listen(443);

app.get("/api/torrent-search", (req, resp) => {
    const query = req.query.q;
    const type = req.query.t;
    if (query && type) {
        try {
            torrentSearch(query, type, (result) => {
                resp.send({
                    status: "OK",
                    msg: `Magnet search by type - ${type} and query - ${query} processed successfully`,
                    result: result,
                });
            })
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