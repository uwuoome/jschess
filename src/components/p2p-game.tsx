// src/components/P2PGame.jsx
import { useRef, useState, type ComponentType } from 'react';
import { Button } from './ui/button';
import HostSelector from './host-selector.tsx';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/index.ts';
import { useP2P } from '@/hooks/use-p2p.ts';
import { setMyID } from '@/store/settingsSlice.ts';
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";
import { Link } from "react-router-dom";



type ConnectorProps = {
  game: ComponentType<{ mode: any; player: any; sendMessage: any; currentMessage: any }>;
  requesterToken: string;
  requesterID: string;
  seekingID: string | null;
  onCancel: () => void;
}

export function P2PConnector({game, requesterToken, requesterID, seekingID, onCancel}: ConnectorProps){
  const Game = game;
  const [currentMessage, setCurrentMessage] = useState<any>(null);
  const {gameReady, leaveGame, sendMessage} = useP2P({
    myid: requesterID, 
    mytoken: requesterToken,
    seekingID, 
    gameID: game.name,
    onOpponentLeave,
    onMessage: setCurrentMessage
  });
  function onOpponentLeave(){
    // only alert if game is not over
    if(gameReady != -1) alert("Opponent Left");
    onCancel();
  }
  function onLeave(){
    leaveGame();
    onCancel();
  }
  return (!gameReady) ? (
      <div>
        <p>Attempting to join host...</p>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
  ) : (
      <div>
        <Game mode="network" player={gameReady-1} sendMessage={sendMessage} currentMessage={currentMessage}   />
        <Button onClick={onLeave}>Leave</Button>
      </div>
  );
}

type P2PGameProps = {
  game: ComponentType<{ mode: any; player: any; sendMessage: any; currentMessage: any }>;
} 

const validHandle = (handle: string) => /^[a-zA-Z0-9_]+$/.test(handle);

export default function P2PGame({game}: P2PGameProps) {
  const Game = game;
  const [seeking, setSeeking] = useState<null | string>(null);
  const myid = useSelector((state: RootState) => state.friends.myid);
  const mytoken = useSelector((state: RootState) => state.friends.mytoken);

  const myIdRef = useRef<HTMLInputElement>(null);
  const [isUpdating, setIsUpdating] = useState(false); // New state variable
  const dispatch = useDispatch();   

  async function updateID(){
    if(isUpdating) return;
    const id = myIdRef?.current?.value.trim();
    if(! id) return alert("No ID set");
    if(! validHandle(id)) return alert("User handle must be composed of alphanumeric characters or underscores");
    setIsUpdating(true);
    try{
      const response = await fetch('http://localhost:3000/adduser', {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({handle: id})
      });
      const result = await response.json();
      if(result?.token){
        dispatch(setMyID({id, token: result.token}));
        //TODO: display token
      }else if(result?.error){
        alert(result.error);
      }
    }catch(error){
      console.log(error);
    }finally{
      setIsUpdating(false);
    }
  }
  function deleteID(){
    if(! confirm("Delete your handle?")) return;
    // TODO: post delete to server
    dispatch(setMyID(null));
  }

  if(seeking){
    return <P2PConnector game={Game} requesterID={myid} requesterToken={mytoken} seekingID={seeking} 
      onCancel={() => setSeeking(null)} />
  }
  return (
    <div className="p-2">
      <h2>Peer to Peer Connection Setup</h2>
      <div className="flex items-center space-x-2" style={{display: myid? "none": "flex"}}>
          <Label htmlFor="myhandle">Your ID:</Label>
          <Input ref={myIdRef} id="myhandle" className="w-80 mt-2" placeholder="Enter a handle..." /> 
          <Button className="mt-2" onClick={updateID}>Set</Button>
      </div>
      <div className="mt-2 mb-2" style={{display: myid? "block": "none"}}>
        <span>MyID: {myid} </span>
        <Button className="mr-2" onClick={deleteID }>x</Button>
        <Button className="mr-2" disabled={!myid} onClick={() => setSeeking("anyone")}>Play Anyone</Button>
        <span className="m-2">or</span>
        <HostSelector onJoin={(peerID: string) => setSeeking(peerID)} />
        <Button className="ml-2"><Link to="/friends">Configure Friends</Link></Button>
      </div>
    </div>   
  );
};
