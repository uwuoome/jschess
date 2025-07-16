// src/components/P2PGame.jsx
import { useState } from 'react';
import { Button } from './ui/button';
import HostSelector from './host-selector.tsx';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/index.ts';
import { useP2P } from '@/hooks/use-p2p.ts';
import RockPaperScissors from './rock-paper-scissors.tsx';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

type ConnectorProps = {
  requesterID: string;
  seekingID: string | null;
  onCancel: () => void;
}

export function P2PConnector({requesterID, seekingID, onCancel}: ConnectorProps){
  const [currentMessage, setCurrentMessage] = useState<any>(null);
  const {gameReady, leaveGame, sendMessage} = useP2P({myid: requesterID, seekingID, onOpponentLeave, onMessage: setCurrentMessage});
  function onOpponentLeave(){
    // only alert if game is not over
    console.log(gameReady);
    if(gameReady < 2) alert("Opponent Left");
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
        <RockPaperScissors sendMessage={sendMessage} currentMessage={currentMessage}  />
        <Button onClick={onLeave}>Leave</Button>
      </div>
  );
}


export default function P2PGame() {
  const [seeking, setSeeking] = useState<null | string>(null);
  const myid = useSelector((state: RootState) => state.friends.myid);
  return (
    <>
      <h1>P2P Game</h1>
      {seeking  &&
        <P2PConnector requesterID={myid} seekingID={seeking} onCancel={() => setSeeking(null)} />
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
