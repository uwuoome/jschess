// src/components/P2PGame.jsx
import { useState, type ComponentType } from 'react';
import { Button } from './ui/button';
import HostSelector from './host-selector.tsx';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/index.ts';
import { useP2P } from '@/hooks/use-p2p.ts';
import { setMyID } from '@/store/settingsSlice.ts';
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";
import { Link } from "react-router-dom";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

type ConnectorProps = {
  game: ComponentType<{ mode: any; player: any; sendMessage: any; currentMessage: any }>;
  requesterID: string;
  seekingID: string | null;
  onCancel: () => void;
}

export function P2PConnector({game, requesterID, seekingID, onCancel}: ConnectorProps){
  const Game = game;
  const [currentMessage, setCurrentMessage] = useState<any>(null);
  const {gameReady, leaveGame, sendMessage} = useP2P({
    myid: requesterID, 
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

export default function P2PGame({game}: P2PGameProps) {
  const Game = game;
  const [seeking, setSeeking] = useState<null | string>(null);
  const myid = useSelector((state: RootState) => state.friends.myid);
  const dispatch = useDispatch();   
  function updateID(email: string){
      // check is valid
      dispatch(setMyID(email));
  }
  const validEmail = emailRegex.test(myid);
  return (
    <>
      {/*<h1 className="mb-4">{Game.name}</h1>*/}

      {seeking  &&
        <P2PConnector game={Game} requesterID={myid} seekingID={seeking} onCancel={() => setSeeking(null)} />
      || 
      <div className="p-2">
        <h2>Peer to Peer Connection Setup</h2>
        <p className="mt-2 mb-2" style={{opacity: validEmail? "0": "1", transition: "opacity ease-in 0.5s"}}>
            Enter an email address to join network games. It can be any imaginary/unverified address, just needs to be unique.
        </p>
        <div className="flex items-center space-x-2">
            <Label htmlFor="myemail">Your ID:</Label>
            <Input id="myemail" className="w-80 mt-2" placeholder="Enter an email address..." value={myid} 
                onChange={(e) => updateID(e.target.value)}  /> 
        </div>
        <p className="mt-2 mb-2" style={{opacity: validEmail? "1": "0", transition: "opacity ease-in 0.5s" }}>
          With email set, you can now join network games.
        </p>
        <p className="mt-2 mb-2" style={{opacity: validEmail? "1": "0", transition: "opacity ease-in 0.5s", transitionDelay: "0.5s" }}>
          Get matched against any opponent available, or connect to a game with a specific friend. &nbsp;
        </p>
        <div className="mt-2 mb-2" style={{opacity: validEmail? "1": "0", transition: "opacity ease-in 0.5s", transitionDelay: "1s" }}>
          <Button className="mr-2" disabled={!emailRegex.test(myid)} onClick={() => setSeeking("anyone")}>Play Anyone</Button>
          <span className="m-2">or</span>
          <HostSelector onJoin={(peerID: string) => setSeeking(peerID)} />
          <Button className="ml-2"><Link to="/friends">Configure Friends</Link></Button>
        </div>
      </div>}
    </>
  );
};
