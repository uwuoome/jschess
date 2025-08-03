import WhiteRook from '@/assets/WR.svg?react';
import { Button } from "./ui/button";
import { Link } from "react-router-dom";



export default function Home(){
    return (
        <div className="p-2">
            <div className="flex">
                <WhiteRook className="w-14 pr-2" />
                <h1>JS Chess</h1>
                <WhiteRook className="w-14 pl-2" />
            </div>
            <p className="mt-2 mb-2">Yet another implementation of chess in Javascript featuring:</p>

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
            <p className="mt-2 mb-2">Free, open source, no ads, and no personal information collected.</p>
            <div className="flex border-1 rounded-md p-2 relative content-center max-w-[400px] bg-gradient-to-r from-lime-400 from-10%  to-emerald-500 to-90%">
                <div className="absolute top-1 left-4 font-bold">Play</div>
                <Button className="m-1 mt-6 grow">
                     <Link to="/chess/p2p">Network</Link>
                </Button>
                <Button className="m-1 mt-6 grow">
                    <Link to="/chess/ai">AI</Link>
                </Button>
                <Button className="m-1 mt-6 grow">
                    <Link to="/chess/hotseat">Hotseat</Link>
                </Button>
            </div>


        </div>
    );
}