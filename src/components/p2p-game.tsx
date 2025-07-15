// src/components/P2PGame.jsx
import { useState, type MouseEvent } from 'react';
import { Button } from './ui/button';
import HostSelector from './host-selector.tsx';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/index.ts';
import { useP2P } from '@/hooks/use-p2p.ts';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

type ConnectorProps = {
  requesterID: string;
  seekingID: string | null;
  onCancel: () => void;
}

function P2PConnector({requesterID, seekingID, onCancel}: ConnectorProps){
  const {gameReady, leaveGame} = useP2P({myid: requesterID, seekingID, onOpponentLeave});
  function onOpponentLeave(){
    alert("Opponent Left");
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
        <p>Game Goes Here</p>
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
