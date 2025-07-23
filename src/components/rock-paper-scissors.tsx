import { Hand, Grab, HandHelping, TriangleAlert} from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useEffect, useRef, useState } from "react";
import { WebRTCTask, type WebRTCMessage } from "@/hooks/use-p2p";


type TimerProps = {
    duration: number;   // duration of the countdown timer
    callback: Function; // runs when the timer ends
};
type RockPaperScissorsMove = "r" | "p" | "s" | "x";
type RockPaperScissorsProps = {
    sendMessage: Function; // network transmit
    currentMessage: WebRTCMessage | null;
}

function CountdownTimer({duration, callback}: TimerProps){
    const [remaining, setRemaining] = useState<number>(duration);
    // TODO: get heatscale to work with any duration
    const heatScale = () => "text-red-"+(1000 - ((Math.floor(duration)-Math.floor(remaining)) * 100));
         //`rgba(${(255 / duration) * (duration-remaining)}, 0, 0, 0)`;
        //
    const timeout = useRef<any>(null);

    function ticker(){
        const start: number = Date.now();
        function countdown(){
            const delta = (Date.now()-start) / 1000;
            const timeLeft = duration- delta;
            if(timeLeft >= 0){
                setRemaining(timeLeft);
            }else{
                setRemaining(0);
                clearInterval(timeout.current);
                typeof callback == "function" && callback();
            }
        }
        timeout.current = setInterval(countdown, 50);
        return () => clearInterval(timeout.current);  
    }

    useEffect(ticker, []);
    return (
        <div className="font-extrabold text-3xl w-32">
            <span style={{color: heatScale()}}> 
                {remaining.toFixed(2)}
            </span>
            <span className="text-l text-gray-500">s</span>
        </div>
    );
}

export default function RockPaperScissors({sendMessage, currentMessage}: RockPaperScissorsProps){
    const myMove = useRef<RockPaperScissorsMove>('x');
    const opMove = useRef<RockPaperScissorsMove>('x');
    const [result, setResult] = useState<string>("");

    useEffect(() => {
        if(! currentMessage) return;
        opMove.current = currentMessage.data;
    }, [currentMessage]);

    function onSelect(val: RockPaperScissorsMove){
        myMove.current = val;
        sendMessage({data: val});
    }

    function showResults(){
        if(myMove.current == opMove.current){
            setResult("Draw");
        }else if(myMove.current == "x"){
            setResult("Lose");
        }else if(opMove.current == "x"){
            setResult("Win");
        }else if(myMove.current == "r"){
            setResult(opMove.current == "s"? "Win": "Lose");
        }else if(myMove.current == "p"){
            setResult(opMove.current == "r"? "Win": "Lose");
        }else{  // myMove.current == "s"
            setResult(opMove.current == "p"? "Win": "Lose");
        }
        sendMessage({task: WebRTCTask.Complete});
    }

    function iconFor(move: RockPaperScissorsMove){
        const MyIcon = {'r': Grab, 'p': Hand, 's': HandHelping, 'x': TriangleAlert}[move];
        return <MyIcon className="w-8 h-8" strokeWidth={2} />
    }

    return (
        <div className="border-1 m-8 p-4">
            {result? ( 
            <>
                <div className="flex">
                    {iconFor(myMove.current)} <span className="m-2">vs</span> {iconFor(opMove.current)}
                </div>
                <div>The result is: You {result}</div>
            </>
            ) : (
            <>
                <p>Select your move before the timer runs out</p>
                <div className="flex  items-center">
                    <CountdownTimer duration={5.0} callback={showResults} />
                    <ToggleGroup type="single" onValueChange={onSelect}>
                        <ToggleGroupItem value="r" className="h-12 w-12 flex items-center justify-center">
                            <Grab className="!w-8 !h-8 shrink-0" strokeWidth={2} />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="p" className="h-12 w-12 flex items-center justify-center">
                            <Hand className="!w-8 !h-8 shrink-0" strokeWidth={2} />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="s" className="h-12 w-12 ">
                            <HandHelping className="!w-8 !h-8 shrink-0" strokeWidth={2} />
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
            </>
            )}
        </div>
    );
}