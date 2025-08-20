import { Server } from 'socket.io';
import http from 'http';
import {join, check, info} from './http.js';
import express from 'express';
import cors from 'cors';
import socketHandler from './socket.js';
import {startReplServer} from './repl.js';

const PORT = 3000;
const USE_REPL = true;
const corsOptions = {
  origin: '*', // change in production
  methods: ['GET', 'POST']
}


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cors(corsOptions));

app.post('/adduser', join);
app.get('/check', check)
app.get('/', info);

const server = http.createServer(app);
if(USE_REPL) startReplServer(server);

export const io = new Server(server, {
  cors: corsOptions
});
io.on('connection', socketHandler);

server.listen(PORT, () => {
  console.log(`Signaling server running on http://localhost:${PORT}`);
});

