// src/components/P2PGame.jsx
import { useState, type ComponentType } from 'react';
import { Button } from './ui/button';
import HostSelector from './host-selector.tsx';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/index.ts';
import { useP2P } from '@/hooks/use-p2p.ts';

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
  return (
    <>
      {/*<h1 className="mb-4">{Game.name}</h1>*/}
      {seeking  &&
        <P2PConnector game={Game} requesterID={myid} seekingID={seeking} onCancel={() => setSeeking(null)} />
      || 
      <div>
        <span className="m-2">{myid}</span>
        <Button className="mr-2" onClick={() => setSeeking("anyone")}>Play Anyone</Button>
        {emailRegex.test(myid) && <>
        <span className="m-2">or</span>
        <HostSelector onJoin={(peerID: string) => setSeeking(peerID)} />
        </>
        || 
        <span className="m-2">or enter a valid email address to join a specific player in game.</span>}
      </div>}
    </>
  );
};
