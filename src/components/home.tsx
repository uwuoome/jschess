import { Button } from "./ui/button";
import { Link } from "react-router-dom";


export default function Home(){
    return (
        <div className="p-2 select-none">
            <div className="p-1 flex border-1 rounded-md max-w-[400px]" style={{backgroundColor: "#FAF8F4"}}>
                <img src="/pwa-192x192.png" alt="JS" className="" />
                <div className="mr-4 mt-20">
                    <h1 className="">Chess</h1>
                </div>
            </div>
            <div className="m-2 p-1 border-l-8 border-yellow-300 bg-white max-w-[380px] rounded-r-lg border-solid border-1">
                A free chess game written in Javascript.
            </div>
            <div className="m-2 p-1 border-l-8 border-yellow-300 bg-white max-w-[380px] rounded-r-lg border-solid border-1">
                 Open source.
            </div>
            <div className="m-2 p-1 border-l-8 border-yellow-300 bg-white max-w-[380px] rounded-r-lg border-solid border-1">
                No ads.
            </div>
            <div className="m-2 p-1 border-l-8 border-yellow-300 bg-white max-w-[380px] rounded-r-lg border-solid border-1">   
                 No personal information collected.
            </div>
            <div className="m-2 p-1 border-l-8 border-yellow-300 bg-white max-w-[380px] rounded-r-lg border-solid border-1">
                Play against AI, friends or randos.
            </div>
            <div className="flex border-1 rounded-md p-2 relative content-center max-w-[400px] bg-yellow-300">
                <div className="absolute top-1 text-sm flex-center">Select a game mode:</div>
                <Link to="/chess/ai"  className="m-1 mt-6 grow  w-1/3">
                    <Button className="w-full">
                        AI
                    </Button>
                </Link>
                <Link to="/chess/hotseat" className="m-1 mt-6 grow  w-1/3">
                    <Button  className="w-full">
                        Hotseat
                    </Button>
                </Link>
                <Link to="/chess/p2p" className="m-1 mt-6 grow  w-1/3">
                    <Button className="w-full">
                        Network
                    </Button>
                </Link>
            </div>
            <div className="absolute bottom-1 text-gray-300 w-full flex justify-between pr-4">
                <span>2025 Michael Grundel</span>
                <span> - </span>
                <Link to="/about">About</Link> 
                <span> - </span>
                <Link to="https://github.com/uwuoome/jschess" target="_blank">
                    Source <img src="/github-mark-white.svg" alt="Github" className="w-6 h-6 inline" />
                </Link>
            </div>

        </div>
    );
}