import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import SimplePeer from 'simple-peer/simplepeer.min.js';

const SERVER_URL = import.meta.env.VITE_PAIRING_SERVER;
const DEBUG_P2P = import.meta.env.VITE_DEBUG_LEVEL || 0;
const RECONNECT_PERIOD = 5000;// ms
const RECONNECT_ATTEMPTS = 8;

type ConnectionProps = {
    mytoken: string;
    myid: string;
    seekingID: string | null;
    gameID: string | null;
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

export function useP2P({myid, mytoken, seekingID, gameID, onOpponentLeave, onMessage, onInit, onRespond}: ConnectionProps) {
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
            socketRef.current.emit('join', { requesterToken: mytoken, seekingID, gameID });
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
            peer.on('close', () => {
                DEBUG_P2P && console.log('Peer connection closed');
                attemptReconnect();
            });
            peer.on('error', (err) => {
                console.error('Peer connection error:', err);
                attemptReconnect();
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
                peer.on('close', () => {
                    DEBUG_P2P && console.log('Peer connection closed');
                    attemptReconnect();
                });
                peer.on('error', (err) => {
                    console.error('Peer connection error:', err);
                    attemptReconnect();
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

    // This attempts peer reconnection during network hiccups. 
    // If the page is accidentally reloaded, we need to attempt reconnection via the pairing server. 
    let retryCount = 0;
    function attemptReconnect(){
        retryCount++;
        if (retryCount >= RECONNECT_ATTEMPTS) {
            console.warn("Max reconnect attempts reached");
            closeConnections(false);
            return;
        }

        DEBUG_P2P && console.log("Attempting reconnection...");
        peerRef.current?.removeAllListeners(); // Clean up the previous peer
        peerRef.current?.destroy();
        peerRef.current = null;

        if (peerSocketRef.current) {
            const newPeer = new SimplePeer({ initiator: true, trickle: false });
            newPeer.on('signal', (signal) => {
                socketRef.current.emit('signal', { target: peerSocketRef.current, signal });
            });
            newPeer.on('data', (data) => {
                const str = data.toString();
                const msg = JSON.parse(str);
                if (msg.task == WebRTCTask.End) {
                    closeConnections(false);
                } else {
                    onMessage?.(msg);
                }
            });
            newPeer.on('connect', () => {
                DEBUG_P2P && console.log('Reconnected with peer');
                typeof onInit == "function" && onInit();
            });
            newPeer.on('close', attemptReconnect);
            newPeer.on('error', (err) => {
                console.warn('Reconnection error:', err);
                setTimeout(attemptReconnect, RECONNECT_PERIOD);  
            });
            peerRef.current = newPeer;
        } else {
            console.warn("No peerSocketRef available to reconnect to.");
        }
    }

    return {
        sendMessage,                                    // sends message to opponent
        leaveGame: closeConnections.bind(null, true),   // for when user closed in UI
        gameReady,                                      // ref signals when p2p connection is ready nd established
    };
}