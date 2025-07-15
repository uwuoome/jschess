import { Server } from 'socket.io';
import http from 'http';

const PORT = 3000;
const DEBUG = 2;

// Optional: You can attach this to an HTTP server
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust this in production
    methods: ['GET', 'POST']
  }
});

const waitingPlayers = new Map();

io.on('connection', socket => {
  DEBUG > 0 && console.log(`Client connected: ${socket.id}`);

  socket.on('join', ({requesterID, seekingID}) => {
    console.log(`pairinig ${seekingID}-${requesterID}`);
    requesterID = requesterID.toLowerCase(); 
    seekingID ??= "anyone";                   
    seekingID = seekingID?.toLowerCase();

    // if seekingID doesnt exist, create a room and wait for the seeking player to arrive
    const opponentSocketID = waitingPlayers.get(seekingID);
    if(! opponentSocketID){
      DEBUG > 1 && console.log(`${requesterID} awaiting opponent ${seekingID}`);
      if(seekingID == "anyone"){              
        waitingPlayers.set(seekingID, socket.id);       // peer will be seeking first game available
      }else{
        waitingPlayers.set(requesterID, socket.id);     // peer will be seeking this person
      }
    }else{
      // create a room for reconnection and to track games in progress
      /*
      const room = `room-${seekingID}-${requesterID}`; // seekingID will have got here first, so ordered as such
      socket.join(room);
      io.to(opponentSocketID).socketsJoin(room);
      */
      console.log(`creating game ${seekingID}-${requesterID}`);
      console.log(`my socket ${socket.id}`);
      console.log(`opponent socket ${opponentSocketID}`);
      io.to(opponentSocketID).emit('new-peer', socket.id);
      //io.to(socket.id).emit('new-peer', opponentSocketID);
      waitingPlayers.delete(seekingID);
    }
  });

  socket.on('signal', data => {
    DEBUG > 1 && console.log("SIGNALLING");
    io.to(data.target).emit('signal', {source: socket.id, signal: data.signal});
  });

  socket.on('disconnect', () => {
    DEBUG > 0 && console.log(`Client disconnected: ${socket.id}`);
    for (const [key, value] of waitingPlayers.entries()) {
      if (value === socket.id) {
        waitingPlayers.delete(key);
        console.log(`Removed ${key} from waitingPlayers`);
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Signaling server running on http://localhost:${PORT}`);
});