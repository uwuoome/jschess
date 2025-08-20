import repl from 'repl';

import {numPlayerHandles, listPlayerHandles, createPlayer, getPlayerByName, resetDatabase} from './database.mjs';


export function startReplServer(server){
    const replServer = repl.start({
        prompt: '> ',
    });
    replServer.context.count = numPlayerHandles;
    replServer.context.list = listPlayerHandles;
    replServer.context.resetAllPlayers = resetDatabase;
    replServer.context.add = createPlayer;
    replServer.context.show = getPlayerByName;
    replServer.context.stop = () => {
        console.log('Stopping server...');
        server.close(() => {
            console.log('Server stopped.');
            replServer.close(); 
            process.exit(0);
        });
    };
}