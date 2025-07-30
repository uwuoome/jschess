import { useDispatch, useSelector } from "react-redux";
import { Input } from "./ui/input";
import { setMyID} from "@/store/settingsSlice";
import type { RootState } from "@/store";
import { Label } from "@radix-ui/react-label";
import WhiteRook from '@/assets/WR.svg?react';
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function Home(){
    const myid = useSelector((state: RootState) => state.friends.myid);
    const dispatch = useDispatch();   
    function updateID(email: string){
        // check is valid
        dispatch(setMyID(email));
    }
    const validEmail = emailRegex.test(myid);
    return (
        <div className="p-2">
            <div className="flex">
                <WhiteRook className="w-14 pr-2" />
                <h1>JS Chess</h1>
                <WhiteRook className="w-14 pl-2" />
            </div>
            <p>Yet another implementation of chess in Javascript featuring:</p>

            <div className="m-2 p-1 border-l-8 border-lime-400">
                React chess client, using Shadcn components and Tailwind for styling.
            </div>
            <div className="m-2 p-1 border-l-8 border-lime-400">
                Websocket pairing server connecting clients peer to peer over WebRTC.
            </div>
            <div className="m-2 p-1 border-l-8 border-lime-400">
                JavaScript rules engine composed of pure functions interacting with a Redux store.
            </div>
            <div className="m-2 p-1 border-l-8 border-lime-400">
                Minmax AI using alpha-beta and negamax, dispatched to a web worker.
            </div>
            <div className="m-2 p-1 border-l-8 border-lime-400">
                A hotseat mode for playing without network or AI.
            </div>
        
            <div className="flex items-center space-x-2">
                <Label htmlFor="myemail">ID:</Label>
                <Input id="myemail" className="w-80 mt-2" placeholder="Your email address..." value={myid} 
                    onChange={(e) => updateID(e.target.value)}  /> 
            </div>
            <div className="mt-2 mb-2">
            {validEmail &&  
                <p>With email set, you can join network games.</p>
             || 
                <p>Enter email address to join network games.</p>
            }
            </div>
            <div className="flex border-1 rounded-md p-2 relative content-center max-w-[400px] bg-gradient-to-r from-lime-400 from-10%  to-emerald-500 to-90%">
                <div className="absolute top-1 left-4 font-bold">Play</div>
                <Button disabled={!validEmail} className={`m-1 mt-6 grow ${!validEmail ? "pointer-events-none opacity-50" : ""}`} asChild>
                     <Link to="/chess/p2p">Network</Link>
                </Button>
                <Button className="m-1 mt-6 grow">AI</Button>
                <Button className="m-1 mt-6 grow">Hotseat</Button>
            </div>


        </div>
    );
}