import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import SimplePeer from 'simple-peer/simplepeer.min.js';

const SERVER_URL = 'http://localhost:3000';
const DEBUG_P2P = true;

type ConnectionProps = {
    myid: string;
    seekingID: string | null;
    onOpponentLeave: Function | undefined | null; 
    onMessage: Function | undefined | null;
    onInit?: Function; 
    onRespond?: Function;
}

export const WebRTCTask = {
	Begin: 'Begin',
    Do: 'Do',
    Complete: 'Complete',       // when a game is over
    End: 'End',
};
export type WebRTCTaskType = typeof WebRTCTask[keyof typeof WebRTCTask];

export type WebRTCMessage = {
    task?: WebRTCTaskType;
    data: any;
}

export function useP2P({myid, seekingID, onOpponentLeave, onMessage, onInit, onRespond}: ConnectionProps) {
    const socketRef = useRef<any>(null);      // our socket ref
    const peerRef = useRef<any>(null);        // peer WebRTC Handle
    const peerSocketRef = useRef<any>(null);  // peer socket ref
    const [gameReady, setGameReady] = useState(0);
    

    const sendMessage = (msg: string | WebRTCTaskType) => {
        if (peerRef.current && peerRef.current.connected) {
            DEBUG_P2P && console.log("sending", msg); 
            if(typeof msg == "string"){
                peerRef.current.send(msg);
            }else{
                peerRef.current.send(JSON.stringify(msg));
            }
        }
    };

    function closeConnections(initiator=true){
        DEBUG_P2P && console.log("Cleaning up peer and socket connections");
        // if a peer exists, and you are the first to disconnect, then tell it you are leaving if the game is not over yet
        if(initiator && peerRef.current?.connected && gameReady != -1){
            try{
                peerRef.current.send(JSON.stringify({task: WebRTCTask.End}));
            }catch(error){
                console.warn("Failed to send End message to peer:", error);
            }
        }
        peerRef.current?.removeAllListeners();
        peerRef.current?.destroy();
        socketRef.current?.removeAllListeners();
        socketRef.current.disconnect();
        // if in game, or establishing a connection and peer leaves inform the user
        if(!initiator && typeof onOpponentLeave == "function"){
            onOpponentLeave();
        }
    }

    useEffect(() => {
        if (!myid) return;
        socketRef.current = io(SERVER_URL);

        function onConnect() {
            console.log("On socket connect", myid, "to", seekingID);
            socketRef.current.emit('join', { requesterID: myid, seekingID });
        }

        function onPeerJoin(peerSocketID: string) {
            DEBUG_P2P && console.log("Creating peer on join");
            peerSocketRef.current = peerSocketID;
            const peer = new SimplePeer({ initiator: true, trickle: false });
            peer.on('signal', (signal) => {
                socketRef.current.emit('signal', { target: peerSocketID, signal });
            });
            peer.on('data', (data) => {
                const str = data.toString();
                const msg = JSON.parse(str);
                if(msg.task == WebRTCTask.Begin){
                    setGameReady(1);
                }else if(msg.task == WebRTCTask.Complete){
                    setGameReady(-1);
                }else if(msg.task == WebRTCTask.End){
                    closeConnections(false);
                }else{
                    DEBUG_P2P && console.log('Received:', str);
                    onMessage?.(msg);
                }
            });
            peer.on('connect', () => {
                DEBUG_P2P && console.log('Peer connected (first peer)');
                typeof onInit == "function" && onInit();
            });
            peerRef.current = peer;
        }
        function onSignal({ source, signal }: any) {
            if ((!peerRef.current)) {
                DEBUG_P2P && console.log("Creating peer on signal");
                peerSocketRef.current = source;
                const peer = new SimplePeer({ initiator: false, trickle: false });
                peer.on('signal', (signal) => {
                    socketRef.current.emit('signal', { target: source, signal });
                });
                peer.on('data', (data) => {
                    const str = data.toString();
                    const msg = JSON.parse(str);
                    if(msg.task == WebRTCTask.Complete){
                        setGameReady(-1);
                    }else if(msg?.task == WebRTCTask.End){
                        closeConnections(false);    
                    }else{
                        DEBUG_P2P && console.log('Received:', str);
                        onMessage?.(msg);
                    }
                });
                peer.on('connect', () => {
                    DEBUG_P2P && console.log('Peer connected (second peer)');
                    peer.send(JSON.stringify({task: WebRTCTask.Begin}));
                    typeof onRespond == "function" && onRespond();
                    setGameReady(2);
                });
                peer.signal(signal);
                peerRef.current = peer;
            }else{
                peerRef.current.signal(signal);
            }
        }

        socketRef.current.on('connect', onConnect);
        socketRef.current.on('new-peer', onPeerJoin);
        socketRef.current.on('signal', onSignal);
        window.addEventListener('beforeunload', closeConnections.bind(null, true));
        return closeConnections;
    }, []);

    return {
        sendMessage,                                    // sends message to opponent
        leaveGame: closeConnections.bind(null, true),   // for when user closed in UI
        gameReady,                                      // ref signals when p2p connection is ready nd established
    };
}