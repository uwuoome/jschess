import type { WebRTCMessage } from "@/hooks/use-p2p";
import { algebraicNotation } from "@/lib/chess-logic";
import type { RootState } from "@/store";
import { movePiece, nextTurn, opponentMove, selectPiece, setModeAndPlayerNumber } from "@/store/chessSlice";
import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export type ChessProps = {
    mode: "hotseat" | "network" | "ai";
    player: 0 | 1;
    sendMessage?: (msg: WebRTCMessage) => void;// network transmit only for network mode
    currentMessage?: WebRTCMessage | null;     // current message network only
}

const DEBUG = 0;

function ChessBoard({mode, player, sendMessage, currentMessage}: ChessProps){

    const myPlayerNumber = useSelector((state: RootState) => state.chess.myPlayer);
    const activePlayer = useSelector((state: RootState) => state.chess.activePlayer);
    const board = useSelector((state: RootState) => state.chess.board);
    const selected = useSelector((state: RootState) => state.chess.selected);
    const target = useSelector((state: RootState) => state.chess.target);
    const dispatch = useDispatch();

    function piece(code: string){
        const upper = code.toUpperCase();
        const colour = code == upper? "W": "B";
        return `${colour}${upper}.svg`;
    }
    function move(index: number){ 
        if(mode != "hotseat" && myPlayerNumber != activePlayer) return;
        if(selected == null){
            dispatch( selectPiece(index) );
        }else{
            dispatch( movePiece(index) );
        }
    }

   
    if(mode == "network"){
        const init = () => {
            dispatch(setModeAndPlayerNumber({mode: "network", player}));
        };
        const send = () => {
            if(! (sendMessage && selected && target)) return;
            sendMessage({data: algebraicNotation(selected.from)+algebraicNotation(target)});
        };
        const receive = () =>{
            if(! currentMessage) return;
            console.log("recieved", currentMessage);
            dispatch(opponentMove(currentMessage.data))
        };
        useEffect(init, []); 
        useEffect(receive, [currentMessage]);
        useEffect(send, [selected, target]);
    }

    useEffect(() => {
        if(target == null) return () => null;
        console.log("setting timeout");
        const timeout = setTimeout( () => dispatch(nextTurn()), 800 );
        return () => clearTimeout(timeout); 
    }, [target, dispatch]);

    function background(isBlack:boolean, index:number){
        const canMoveTo = selected?.options.includes(index);
        const hilite = "border-blue-200"; // TODO: add themes
        if(canMoveTo){
            const light = "bg-gray-200";
            const dark = "bg-gray-500";
            const bg = isBlack? light: dark; 
            return `${bg} border-8 border-solid ${hilite}`;
        }   
        const light = "bg-white"
        const dark = "bg-gray-400";
        return isBlack? light: dark;
    }

    function pieceHilite(index: number){
        const canMoveTo = selected?.options.includes(index);
        const bg = selected?.from === index ? `bg-blue-200 ml-2` : "";
        if(bg) return bg;
        return canMoveTo? "ml-0": "ml-2";
    }

    const isFlipped = (mode == "hotseat" && activePlayer == 1) || (mode == "network" && myPlayerNumber == 1);
    const files = isFlipped ? ["h","g","f","e","d","c","b","a"] : ["a","b","c","d","e","f","g","h"];
    const ranks = isFlipped ? ["1","2","3","4","5","6","7","8"] : ["8","7","6","5","4","3","2","1"];
    return (
    <div className="grid grid-cols-[auto_repeat(8,_4rem)_auto] grid-rows-[auto_repeat(8,_4rem)_auto] border-2 border-black w-fit select-none bg-gray-200">
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

                    <div className={`w-16 h-16 content-center ${background(isBackgroundBlack, index)}`} onClick={() => move(index)}>
                    {board[index] !== " " && (
                        <img src={`/chess/${piece(board[index])}`} className={`w-12 h-12 ${pieceHilite(index)}`}
                        />
                    )}
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
    );
}

function ChessInfo(){
    const activePlayer = useSelector((state: RootState) => state.chess.activePlayer);
    const turnNumber = useSelector((state: RootState) => state.chess.turnNumber);
    const selected = useSelector((state: RootState) => state.chess.selected);
    const target = useSelector((state: RootState) => state.chess.target); 
    const message = useSelector((state: RootState) => state.chess.message);

    const turnClass = activePlayer == 1? 'bg-black text-white': 'text-black bg-white';
    return (
        <div className="mt-2 p-2 border-solid border-2 border-gray-500 w-136 font-bold select-none">
            <span className={`m-1 pl-2 pr-2 border-solid border-1 border-gray-500 rounded-sm ${turnClass}`}>
                Turn {turnNumber} {activePlayer? "Black": "White"}
            </span>
            {selected && <span className="m-1 pl-2 pr-2 border-solid border-1 border-gray-500 rounded-sm">
                {algebraicNotation(selected.from)} <span>: {target && algebraicNotation(target)}</span>
            </span>}
            {message  && <span className="m-1 pl-2 pr-2 border-solice border-1 border-red-950 rounded-sm bg-red-500 font-bold text-white">
                {message}
            </span>}
        </div>
    );
}

export default function Chess(props: ChessProps) {
    return (
    <>
        <ChessBoard {...props} />
        <ChessInfo />
    </>
    );
};

