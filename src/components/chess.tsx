import type { WebRTCMessage } from "@/hooks/use-p2p";
import { algebraicNotation, parseAlgebraic } from "@/lib/chess-logic";
import type { RootState } from "@/store";
import { initGame, endGame, movePiece, nextTurn, opponentMove, selectPiece, highlightLastMove } from "@/store/chessSlice";
import React, { useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MoveHistory from "./chess-history";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { Progress } from "@/components/ui/progress"
import { aiPlayerTitle } from "@/lib/utils";
import AISelector from "./ai-selector";
import { Home, Users } from "lucide-react";
import { generateChessboardPalette } from "@/lib/chess-palette";
import ChessTimer from "./chess-timer";
import useSound from "@/hooks/use-sound";

export type InitProps = {
    mode: "hotseat" | "network" | "ai";
    player: 0 | 1;
}

export type ChessProps = InitProps & {
    sendMessage?: (msg: WebRTCMessage) => void;// network transmit only for network mode
    currentMessage?: WebRTCMessage | null;     // current message network only
    mobile?: boolean;
}

export const AiWorker = new Worker(new URL("@/workers/ai-worker.ts", import.meta.url), {
  type: "module",
});

const DEBUG = 0;

export function piece(code: string){
    const upper = code.toUpperCase();
    const colour = code == upper? "W": "B";
    return `${colour}${upper}.svg`;
}   

const mobile = () =>  window.innerWidth < 600;

function ChessBoard({mode, player, sendMessage, currentMessage}: ChessProps){
    
    const myPlayerNumber = useSelector((state: RootState) => state.chess.myPlayer);
    const activePlayer = useSelector((state: RootState) => state.chess.activePlayer);
    const board = useSelector((state: RootState) => state.chess.board);
    const selected = useSelector((state: RootState) => state.chess.selected);
    const target = useSelector((state: RootState) => state.chess.target);
    const movesMade  = useSelector((state: RootState) => state.chess.movesMade);
    const aiLevel = useSelector((state: RootState) => state?.profile?.ailevel || 2);
    const lastMoveHilite = useSelector((state: RootState) => state.chess.lastMoveHilite); 
    const pieceStyle = useSelector((state: RootState) => state?.profile?.pieceStyle);
    const boardStyle = useSelector((state: RootState) => state?.profile?.boardStyle);
    const hiliteStyle = useSelector((state: RootState) => state?.profile?.hiliteStyle);
    const turnStart = useSelector((state: RootState) => state?.chess.turnStart);


    const [hilites, setHilites] = useState(new Set());
    const dispatch = useDispatch();
    const palette = generateChessboardPalette(boardStyle, hiliteStyle);
    const { play: playMyMove } = useSound('myMove');
    const { play: playOpMove } = useSound('opMove');
    const { play: playNotify } = useSound('notify');

    function move(index: number){ 
        if(mode != "hotseat" && myPlayerNumber != activePlayer) return;
        if(selected == null){
            dispatch( selectPiece(index) );
        }else{
            dispatch( movePiece(index) );
        }
    }
   
    // network play specific hooks
    const send = () => {
        if(mode != "network") return;
        if(! (sendMessage && selected && target)) return;
        sendMessage({data: {
            move: algebraicNotation(selected.from)+algebraicNotation(target),
            time: Math.round( (Date.now() - turnStart) / 1000)
        }});
    };
    const receive = () =>{
        if(mode != "network") return;
        if(!currentMessage) return;
        if(currentMessage.data == "concede"){
            dispatch(endGame(true));
        }else{
            dispatch(opponentMove(currentMessage.data.move));
            dispatch(nextTurn(currentMessage.data.time));
        }
    };
    useEffect(receive, [currentMessage]);
    useEffect(send, [selected, target]);

     // after a move has been made, highlight it temporarily
    useEffect(() => {      
        if(! movesMade.length) return;    
        const lastMove = movesMade[movesMade.length-1];
        const from = parseAlgebraic(lastMove.substring(0, 2));
        const to = parseAlgebraic(lastMove.substring(2, 4));
        // board has already updated so cant tell if capture right now
        activePlayer? playOpMove(): playMyMove();
        setHilites(new Set([from, to]));
        const timeout = setTimeout(setHilites.bind(null, new Set()), 1200);
        return () => clearTimeout(timeout); 
    }, [movesMade.length]);

    useEffect(() => {      
        if(movesMade.length === 0 || lastMoveHilite === false){
            setHilites(new Set([])); 
        }else{   
            const lastMove = movesMade[movesMade.length-1];
            const from = parseAlgebraic(lastMove.substring(0, 2));
            const to = parseAlgebraic(lastMove.substring(2, 4));
            setHilites(new Set([from, to]));
        }
    }, [lastMoveHilite]);

    useEffect(() => {
        dispatch(initGame({mode, player, aiLevel}));
    }, []);

    useEffect(() => {
        if(target == null) return () => null;
        // Create an artifical delay between players' turns to display move being made.
        // But cut the timer off at time of player action.
        const elapsedTime = Math.round( (Date.now() - turnStart) / 1000); 
        const timeout = setTimeout( () => {
            dispatch(nextTurn(elapsedTime));
        }, 800 );
        return () => clearTimeout(timeout); 
    }, [target, dispatch]);

    useEffect(() => {
        if(activePlayer == -1){
            playNotify(); // make a sound when the game is over
        }
    }, [activePlayer]);


    function background(isBlack:boolean, index:number, selected: any = null){
        const size = mobile()? "w-11 h-11": "w-16 h-16";
        const prefix = size+" content-center "; 
        const canMoveTo = selected?.options.includes(index);
        if(canMoveTo){
            const bg = isBlack? palette.hlight: palette.hdark; 
            const isSelectedBlack = board[selected.from].toUpperCase() != board[selected.from];
            if(isSelectedBlack){
                return `${prefix}${bg} border-8 border-solid border-transparent hover:border-black`;
            }
            return `${prefix}${bg} border-8 border-solid border-transparent hover:border-white`;
        }   
        const border = hilites.has(index) ? ` border-8 border-solid ${palette.border}`: "";
        const isSelectedBlack = board[index].toUpperCase() != board[index];
        if(index === selected?.from){
            if(! isSelectedBlack){
                return prefix+` ${palette.rdark} ${isBlack? palette.hlight: palette.hdark}`;
            }
            return prefix+` ${palette.rlight} ${isBlack? palette.hlight:  palette.hdark}`;
        }
        return prefix+(isBlack? palette.light:  palette.dark)+border;
    }


    function pieceHasOffset(index: number){
        return (selected?.options.includes(index) || hilites.has(index));
    }
    function pieceDisplay(index: number){
        const scale = () => mobile()? "w-8 h-8": "w-12 h-12";
        const offset = (index: number) =>  pieceHasOffset(index)? "ml-0": "ml-2";
        return `${scale()} ${offset(index)}`;
    }

    const isFlipped = (mode == "hotseat" && activePlayer == 1) || (mode == "network" && myPlayerNumber == 1);
    const files = isFlipped ? ["h","g","f","e","d","c","b","a"] : ["a","b","c","d","e","f","g","h"];
    const ranks = isFlipped ? ["1","2","3","4","5","6","7","8"] : ["8","7","6","5","4","3","2","1"];
    //grid-cols-[auto_repeat(8,_4rem)_auto] grid-rows-[auto_repeat(8,_4rem)_auto] 
    return (
    <div className="max-w-full overflow-auto mx-auto">
        <div className={`grid border-0 border-black w-fit select-none ${palette.light} font-mono`}
            style={{
                gridTemplateColumns: `auto repeat(8, minmax(2.5rem, 1fr)) auto`,
                gridTemplateRows: `auto repeat(8, minmax(2.5rem, 1fr)) auto`,
            }}
        >
            <div />
            {files.map((file, i) => (
            <div key={`file-top-${i}`} className="flex items-center justify-center text-xs font-semibold">
                {file}
            </div>
            ))}
            <div />

            {ranks.map((rank, rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
                <div className="flex items-center justify-center text-xs font-semibold p-1">
                {rank}
                </div>

                {files.map((_, colIndex) => {
                const row = isFlipped ? 7 - rowIndex: rowIndex;
                const col = isFlipped ? 7 - colIndex : colIndex;
                const index = row * 8 + col;
                const isBackgroundBlack = (row + col) % 2 === 0;

                return (
                    <div style={{ position: "relative" }} key={index}>
                        {DEBUG && (
                        <div style={{ position: "absolute", top: 0, left: "2px", fontSize: "10px", color: "red" }}>
                            {index}
                        </div>
                        ) || ""}
                        
                        <div className={`${background(isBackgroundBlack, index, selected)}`} onClick={() => move(index)}>
                        {board[index] !== " " &&
                            <img src={`/chess/${piece(board[index])}`} className={pieceDisplay(index)} />
                        }
                        {pieceStyle == "duo" && board[index] !== " " && 
                            <img src={`/chess/_${piece(board[index])}`} className={pieceDisplay(index)} style={{
                                position: "absolute", top: "8px", left: pieceHasOffset(index)? "8px": 0 
                            }} />
                        }
                        </div>
                    </div>
                );
                })}
                <div className="flex items-center justify-center text-xs font-semibold p-1">
                {rank}
                </div>
            </React.Fragment>
            ))}
            <div />
            {files.map((file, i) => (
            <div key={`file-top-${i}`} className="flex items-center justify-center text-xs font-semibold">
                {file}
            </div>
            ))}
            <div />
        </div>
    </div>
    );
}

function ChessInfo(){
    const activePlayer = useSelector((state: RootState) => state.chess.activePlayer);
    const turnNumber = useSelector((state: RootState) => state.chess.turnNumber);
    const message = useSelector((state: RootState) => state.chess.message);
    const movesMade  = useSelector((state: RootState) => state.chess.movesMade);
    const mode  = useSelector((state: RootState) => state.chess.mode);
    const aiLevel  = useSelector((state: RootState) => state.chess.aiLevel);
    const aiProgress = useSelector((state: RootState) => state.chess.aiProgress);
    const dispatch = useDispatch();


    const turnClass = activePlayer == 1? 'bg-black text-white': 'text-black bg-white';
    // TODO: sort out leaving and restarting in network mode
    function showLM(){
        dispatch(highlightLastMove(true));
    }
    function hideLM(){
       dispatch(highlightLastMove(false));
    }
    return (
        <div className="mt-2 p-2 border-solid border-0 border-gray-500 w-136 max-w-screen font-bold select-none  bg-gray-300">
            <span className={`m-1 pl-1 pr-1 border-solid border-1 border-gray-500 rounded-sm whitespace-nowrap ${turnClass}`}>
                <span className="font-normal">Turn</span> {turnNumber} {activePlayer? "Black": "White"}
            </span>
            <div className="m-1 border-solid border-1 border-gray-500 rounded-sm whitespace-nowrap inline-block">
                <ChessTimer className="p-0" />
            </div>
            {mode == "ai"  &&
                <span className="m-1 pl-1 pr-1 border-solid border-1 border-gray-500 rounded-sm whitespace-nowrap bg-white text-black">
                    <span className="font-normal">VS</span> {aiPlayerTitle(aiLevel)} <span className="font-normal">AI</span>
                </span>
            }
            {movesMade.length > 0 && 
                <span className="m-1 pl-1 pr-1 border-solid border-1 border-gray-500 rounded-sm hover:bg-lime-400 whitespace-nowrap bg-white text-black" 
                        onMouseOver={showLM} onMouseOut={hideLM}>
                    <span className="font-normal">Prev: </span>{movesMade[movesMade.length-1]} 
                </span>
            }

            {message  && 
                <div className="pl-2 pr-2 m-1 border-solid border-1 border-emerald-950 rounded-sm bg-emerald-800 font-bold text-white">
                    {message}
                    {message.indexOf("AI is searching") != -1 && <>
                        <Spinner key='infinite' variant='infinite' className="float-right" />
                        <div className="bg-gray-50 mb-1 border-1 border-r-2"> 
                            {message.indexOf("AI is searching") != -1 && <Progress value={aiProgress} />} 
                        </div>   
                    </>}
                </div>
            }
        </div>
    );
}

function ChessActions(props: ChessProps){
    const activePlayer = useSelector((state: RootState) => state.chess.activePlayer);
    const mode = useSelector((state: RootState) => state.chess.mode);
    const aiLevel = useSelector((state: RootState) => state?.profile?.ailevel || 2);
    const dispatch = useDispatch();
    function leave(){
        if(! confirm("Are you sure you want to concede?")) return;
        dispatch(endGame(true));
        if(props.mode == "network" && props.sendMessage){
            props.sendMessage({data: "concede"});
        }
    }
    function restart(){
        dispatch(endGame(true));
        dispatch(initGame({...props, aiLevel}));
    }
    function history(){
        alert("TODO: Show move history for mobile");
    }
    return (
        <div className={`${mobile()? "absolute bottom-2 right-2": ""}`}>
            {activePlayer >= 0 && <>
                {mobile() && <Button className="mr-2" onClick={history}>View History</Button>}
                <Button className="" onClick={leave}>Concede</Button>
            </> || <>
                <Link to="/"><Button className="mr-2">{mobile()? <Home />: "Home"}</Button></Link>
                <Button className="" onClick={restart}>New Game</Button>
                {mode == "ai" && <AISelector prefix="VS" suffix="AI" className="ml-2" /> }
                <Link to="/profile"><Button className="ml-2">{mobile()? <Users />: "Profile"}</Button></Link>
            </>}
        </div>
    )
}

export default function Chess(props: ChessProps) {
    return (
    <div className="flex">
        <div>
            <ChessBoard {...props}  />
            <ChessInfo />
            <ChessActions {...props} />
        </div>
        {window.innerWidth > 1200 &&
            <MoveHistory  />
        }
    </div>
    );
};


