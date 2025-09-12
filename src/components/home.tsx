import { Button } from "./ui/button";
import { Link } from "react-router-dom";




export default function Home(){
    return (
        <div className="p-2">
            <div className="flex border-1 rounded-md max-w-[400px]" style={{backgroundColor: "#FAF8F4"}}>
                <img src="/pwa-192x192.png" alt="JS" className="" />
                <div className="mr-4 mt-20">
                    <h1 className="">Chess</h1>
                </div>
            </div>
            <div className="m-2 p-1 border-l-8 border-lime-400">
                A free chess game written in Javascript.
            </div>
            <div className="m-2 p-1 border-l-8 border-lime-400">
                 Open source.
            </div>
            <div className="m-2 p-1 border-l-8 border-lime-400">
                No ads.
            </div>
            <div className="m-2 p-1 border-l-8 border-lime-400">   
                 No personal information collected.
            </div>
            <div className="m-2 p-1 border-l-8 border-lime-400">
                Play against AI, friends or randos.
            </div>
            <div className="m-2 p-1 border-l-8 border-lime-400">
                
            </div>
            <div className="flex border-1 rounded-md p-2 relative content-center max-w-[400px] bg-gradient-to-r from-lime-400 from-10%  to-emerald-500 to-90%">
                <div className="absolute top-1 left-4 font-bold">Play: </div>
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


        </div>
    );
}