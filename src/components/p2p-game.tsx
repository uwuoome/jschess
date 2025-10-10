// src/components/P2PGame.jsx
import { useRef, useState, type ComponentType } from 'react';
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from './ui/button';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/index.ts';
import { useP2P } from '@/hooks/use-p2p.ts';
import { setLastOpponent, setMyID } from '@/store/settingsSlice.ts';
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";
import { validHandle, validToken } from '@/lib/utils.ts';

const pairingServer =  import.meta.env.VITE_PAIRING_SERVER;

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
        <p className="text-blue-200">Attempting to join host...</p>
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

function showMessage(title: string | null, success: boolean, message: string){
  return (
      <Alert variant={success? "default": "destructive"}>
        {success && <CheckCircle2Icon /> || <AlertCircleIcon />}
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>
          {message}
        </AlertDescription>
      </Alert>
  );
}

export default function P2PGame({game}: P2PGameProps) {
  const Game = game;
  const [seeking, setSeeking] = useState<null | string>(null);
  const myid = useSelector((state: RootState) => state.profile.myid);
  const mytoken = useSelector((state: RootState) => state.profile.mytoken);
  const lastop = useSelector((state: RootState) => state.profile.lastOpponent);
  const myIdRef = useRef<HTMLInputElement>(null);
  const [isUpdating, setIsUpdating] = useState(false); // New state variable
  const [alertMessage, setAlertMessage] = useState<{ title: string | null, success: boolean, message: string } | null>(null);
  const dispatch = useDispatch();   

  const [opHandle, setOpHandle] = useState<string>(lastop || "");

  async function restoreID(hash: string){
    try{
      setIsUpdating(true);
      const response = await fetch(`${pairingServer}/restoreuser`, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token: hash})
      });
      const result = await response.json();
      if(result?.handle){
        dispatch(setMyID({id: result.handle, token: result.token}));
        const message = `Your handle, ${result.handle}, has been restored.`;
        setAlertMessage({title: "User Handle Restored", success: true, message});
      }else if(result?.error){
        setAlertMessage({title: "Failure: ", success: false, message: result.error});
        alert(result.error);
      }
    }catch(error){
      console.log(error);
      setAlertMessage({title: "Failure: ", success: false, message: "Something went wrong."});
    }finally{
      setIsUpdating(false);
    }
  }

  async function updateID(id: string){
    try{
      setIsUpdating(true);
      const response = await fetch(`${pairingServer}/adduser`, {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({handle: id})
      });
      const result = await response.json();
      if(result?.token){
        dispatch(setMyID({id, token: result.token}));
        const message = `${result.handle}, your handle has been created. Please save your token, which can be used to transfer
                        to other devices or restore after clearing cache. Do not share your token. Your token is: ${result.token}`;
        setAlertMessage({title: "User Handle Created", success: true, message});
      }else if(result?.error){
        setAlertMessage({title: "Failure: ", success: false, message: result.error});
        alert(result.error);
      }
    }catch(error){
      console.log(error);
      setAlertMessage({title: "Failure: ", success: false, message: "Something went wrong."});
    }finally{
      setIsUpdating(false);
    }
  }

  function setPlayer(){
    if(isUpdating) return;
    const id = myIdRef?.current?.value.trim();
    if(! id){
      return setAlertMessage({title: "No ID or Token provided.", success: false,  message: ""});
    }else if(validToken(id)){
      return restoreID(id);
    }else if(! validHandle(id)){
      const message = `User handle must be between 3 and 16 characters long, composed of alphanumeric characters or underscores. \n\r
          Or an existing 60 character token must be supplied.`;
      return setAlertMessage({title: "Invalid Handle or Token", success: false, message});
    }
    updateID(id);
  }

  async function deleteID(){
    if(! confirm("Delete your handle?")) return;
    // TODO: post delete to server
    dispatch(setMyID(null));
  }

  function findOpponent(){
    const h =  opHandle.trim();
    if(! h) return;
    dispatch(setLastOpponent(h));
    setSeeking(h)
  }

  if(seeking){
    return <P2PConnector game={Game} requesterID={myid} requesterToken={mytoken} seekingID={seeking} 
      onCancel={() => setSeeking(null)} />
  }
  return (
    <div className="p-2 text-blue-200">
      <h2>Peer to Peer Connection Setup</h2>
      {alertMessage && showMessage(alertMessage.title, alertMessage.success, alertMessage.message)}
      <div className="flex items-center space-x-2" style={{display: myid? "none": "flex"}}>
          <Label htmlFor="myhandle">Your ID:</Label>
          <Input ref={myIdRef} id="myhandle" className="w-80 mt-2 bg-white text-black" 
            placeholder="Enter a new handle or existing account token..." /> 
          <Button className="mt-2" onClick={setPlayer}>Set</Button>
      </div>
      <div className="mt-2 mb-2" style={{display: myid? "block": "none"}}>
        <span>Hello <b>{myid}</b></span>
        <Button className="mr-2" onClick={deleteID }>x</Button>
        <Button className="mr-2" disabled={!myid} onClick={() => setSeeking("anyone")}>Play Anyone</Button>
        <div className="m-2">or play against:</div>
        <Input className="bg-white text-black w-50 inline-block" placeholder="Opponent's handle..."  
          onChange={(evt) => setOpHandle(evt.target.value)} value={opHandle || ""} />
        <Button onClick={findOpponent}>Find Opponent</Button>
        {/*
        <HostSelector onJoin={(peerID: string) => setSeeking(peerID)}  />
        <Link to="/profile"><Button className="ml-2">Configure Friends</Button></Link>
        */}
      </div>
    </div>   
  );
};
