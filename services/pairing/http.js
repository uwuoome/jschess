import url from 'url';
import {createPlayer, getPlayerByName} from './database.mjs'

function defaultMsg(code){
    return {
        200: "OK",
        404: "Not found",
        500: "Server Error"
    }[code] || "";
}

function httperr(res, code, msg){
    if(! msg) msg = defaultMsg(code);
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: msg }));
}

function httpok(res, payload){
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
}

export function check(req, res){
    const parsedUrl = url.parse(req.url, true);
    if(! handle) return httperr(res, 200, "no handle");
    return httpok(res, {available: handleAvailable(handle)});
}

export function info(req, res){
    httpok(res, {
        message: 'Pairing server is up',
        timestamp: new Date().toISOString()
    });
}

export function join(req, res){
    console.log('Received data:', req.body);
    const handle = (req.body.handle || "").trim();
    console.log("handle", handle);
    if(handle == "") return httperr(res, 200, "no handle");
    if(! handleAvailable(handle)) return httperr(res, 200, "in use");
    const hash = createPlayer(handle);
    if(hash == null) return httperr(res, 500, "database error");
    return httpok(res, {handle, token: hash});
}

const  handleAvailable = (handle) => !getPlayerByName(handle);