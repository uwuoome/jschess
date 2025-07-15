import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import SimplePeer from 'simple-peer/simplepeer.min.js';

const SERVER_URL = 'http://localhost:3000';
const DEBUG_P2P = true;

type ConnectionProps = {
    myid: string;
    seekingID: string | null;
    onOpponentLeave: Function | undefined | null; 
}

export const WebRTCTask = {
	Begin: 'Begin',
    Do: 'Do',
    End: 'End',
};
export type WebRTCTaskType = typeof WebRTCTask[keyof typeof WebRTCTask];

export type WebRTCMessage = {
    task: WebRTCTaskType;
    data: any;
}

export function useP2P({myid, seekingID, onOpponentLeave}: ConnectionProps) {
    const socketRef = useRef<any>(null);      // our socket ref
    const peerRef = useRef<any>(null);        // peer WebRTC Handle
    const peerSocketRef = useRef<any>(null);  // peer socket ref
    const [gameReady, setGameReady] = useState(false);

    const sendMessage = (msg: string | undefined) => {
        if (peerRef.current && peerRef.current.connected) {
            DEBUG_P2P && console.log("sending", msg); 
            peerRef.current.send(msg);
        }
    };

    // TODO: add window.addEventListener('beforeunload', handleBeforeUnload); to close connections before page lave/reload

    function closeConnections(initiator=true){
        DEBUG_P2P && console.log("Cleaning up peer and socket connections");
        // if peer exists tell it you are leaving
        if(initiator && peerRef.current?.connected){
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
                const msg = JSON.parse(data);
                if(msg.task == WebRTCTask.Begin){
                    setGameReady(true);
                }else if(msg.task == WebRTCTask.End){
                    closeConnections(false);
                }else{
                    console.log('Received:', data.toString());
                    // TODO: send to game specific handler
                }
            });
            peer.on('connect', () => {
                DEBUG_P2P && console.log('Peer connected (first peer)');
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
                    const msg = JSON.parse(data);
                    if(msg.task == WebRTCTask.End){
                        closeConnections(false);    
                    }else{
                        console.log('Received:', data.toString());
                        // TODO: send to game specific handler
                    }
                });
                peer.on('connect', () => {
                    DEBUG_P2P && console.log('Peer connected (second peer)');
                    peer.send(JSON.stringify({task: WebRTCTask.Begin}));
                    setGameReady(true);
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

        return closeConnections;
    }, []);

    return {
        sendMessage,                                    // sends message to opponent
        leaveGame: closeConnections.bind(null, true),   // for when user closed in UI
        gameReady                                       // ref signals when p2p connection is ready nd established
    };
}