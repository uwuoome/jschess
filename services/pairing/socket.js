import {io} from './server.js';
import {getPlayerByHash} from './database.mjs';

const DEBUG = 2;

// need to store requester ids
// player send name request, if not exists create account and send a hash back for their login
// retreival? player info saved to file.
const waitingPlayers = new Map();


function socketHandlerOld(socket) {
  DEBUG > 0 && console.log(`client connected: ${socket.id}`);

  socket.on('join', ({requesterID, seekingID, gameID}) => {
    requesterID = requesterID.toLowerCase(); 
    seekingID ??= "anyone";                   
    seekingID = seekingID?.toLowerCase();
    console.log(requesterID, seekingID, gameID);
    const opponentSocketID = waitingPlayers.get(`${gameID}-${seekingID}`);
    if(! opponentSocketID){
      DEBUG > 1 && console.log(`${requesterID} waiting for ${seekingID} to play ${gameID}`);
      if(seekingID == "anyone"){              
        waitingPlayers.set(`${gameID}-${seekingID}`, socket.id);       // peer will be seeking first game available
      }else{
        waitingPlayers.set(`${gameID}-${requesterID}`, socket.id);     // peer will be seeking this person
      }
    }else{
      console.log(`creating ${gameID} game between ${seekingID} and ${requesterID}`);
      io.to(opponentSocketID).emit('new-peer', socket.id);
      waitingPlayers.delete(seekingID);
    }
  });

  socket.on('signal', data => {
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
}

// using player hashes for initiating game
export default function socketHandler(socket) {
    DEBUG > 0 && console.log(`client connected: ${socket.id}`);

    socket.on('join', ({requesterToken, seekingID, gameID}) => {
        const requester = getPlayerByHash(requesterToken);
        if(requester == null) return;

        const requesterID = requester.name.toLowerCase(); 
        seekingID ??= "anyone";                   
        seekingID = seekingID?.toLowerCase();

        const opponentSocketID = waitingPlayers.get(`${gameID}-${seekingID}`);
        if(! opponentSocketID){
            DEBUG > 1 && console.log(`${requesterID} waiting for ${seekingID} to play ${gameID}`);
            if(seekingID == "anyone"){              
                waitingPlayers.set(`${gameID}-${seekingID}`, socket.id);       // peer will be seeking first game available
                // todo: have a by elo pairing option
            }else{
                waitingPlayers.set(`${gameID}-${requesterID}`, socket.id);     // peer will be seeking this person
            }
        }else{
            console.log(`creating ${gameID} game between ${seekingID} and ${requesterID}`);
            io.to(opponentSocketID).emit('new-peer', socket.id);
            waitingPlayers.delete(seekingID);
        }
    });

    socket.on('signal', data => {
        io.to(data.target).emit('signal', {source: socket.id, signal: data.signal});
    });

    socket.on('disconnect', () => {
        DEBUG > 0 && console.log(`Client disconnected: ${socket.id}`);
        for (const [key, value] of waitingPlayers?.entries()) {
            if (value === socket.id) {
                waitingPlayers.delete(key);
                console.log(`Removed ${key} from waitingPlayers`);
                break;
            }
        }
    });
}