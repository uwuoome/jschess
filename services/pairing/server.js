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
  DEBUG > 0 && console.log(`client connected: ${socket.id}`);

  socket.on('join', ({requesterID, seekingID, gameID}) => {
    //console.log(`pairinig ${seekingID} with ${requesterID}`);
    requesterID = requesterID.toLowerCase(); 
    seekingID ??= "anyone";                   
    seekingID = seekingID?.toLowerCase();

    // if seekingID doesnt exist, create a room and wait for the seeking player to arrive
    const opponentSocketID = waitingPlayers.get(`${gameID}-${seekingID}`);
    if(! opponentSocketID){
      DEBUG > 1 && console.log(`${requesterID} waiting for ${seekingID} to play ${gameID}`);
      if(seekingID == "anyone"){              
        waitingPlayers.set(`${gameID}-${seekingID}`, socket.id);       // peer will be seeking first game available
      }else{
        waitingPlayers.set(`${gameID}-${requesterID}`, socket.id);     // peer will be seeking this person
      }
    }else{
      // create a room for reconnection and to track games in progress
      console.log(`creating ${gameID} game between ${seekingID} and ${requesterID}`);
      //console.log(`my socket ${socket.id}`);
      //console.log(`opponent socket ${opponentSocketID}`);
      io.to(opponentSocketID).emit('new-peer', socket.id);
      waitingPlayers.delete(seekingID);
    }
  });

  socket.on('signal', data => {
    //DEBUG > 1 && console.log("SIGNALLING");
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


function calculateElo(playerRating, opponentRating, score, kFactor=32) {
  /*
  // Example usage:
  const myRating = 1600;
  const opponentRating = 1500;
  const result = 1; // You won
  const newRating = calculateElo(myRating, opponentRating, result);
  console.log("New rating:", newRating); //1607
  */
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  const newRating = playerRating + kFactor * (score - expectedScore);
  return Math.round(newRating);
}