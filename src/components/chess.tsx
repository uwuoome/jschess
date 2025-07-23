import type { WebRTCMessage } from "@/hooks/use-p2p";
import { algebraicNotation } from "@/lib/chess-logic";
import type { RootState } from "@/store";
import { movePiece, nextTurn, opponentMove, selectPiece, setModeAndPlayerNumber } from "@/store/chessSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export type ChessProps = {
    mode: "hotseat" | "network" | "ai";
    player: 0 | 1;
    sendMessage?: (msg: WebRTCMessage) => void;// network transmit only for network mode
    currentMessage?: WebRTCMessage | null;     // current message network only
}

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
            player == 0 && dispatch(setModeAndPlayerNumber({mode: "network", player:0}));
        };
        const respond = () => {
            player == 1 && dispatch(setModeAndPlayerNumber({mode: "network", player:1}));
        };
        const send = () => {
            if(! sendMessage) return;
            if(! (selected && target)) return; // not complete
            sendMessage({data: algebraicNotation(selected.from)+algebraicNotation(target)});
        };
        const receive = () =>{
            if(! currentMessage) return;
            console.log("recieved", currentMessage);
            dispatch(opponentMove(currentMessage.data))
        };
        useEffect(init, []); 
        useEffect(respond, [myPlayerNumber]);
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
        if(canMoveTo){
            const bg = isBlack? "bg-gray-200": "bg-gray-500"
            return `${bg} border-8 border-solid border-blue-200`;
        }   
        return isBlack? "bg-white": "bg-gray-400"
    }

    return (
        <div className="grid grid-cols-8 border-2 border-black w-fit select-none">
        {board.map((cell, index) => {
            const isFlipped = ((mode == "hotseat" && activePlayer == 1) || myPlayerNumber == 1)? 1: 0;
            const isBackgroundBlack = (Math.floor(index / 8) + (index % 8)) % 2 == isFlipped;
            const tileIndex = isFlipped? index: ( (7 - Math.floor(index / 8)) * 8 + (index % 8));
            return (
                <div style={{position:"relative"}} key={tileIndex}>
                    <div style={{position:"absolute", top: 0, left: "2px", fontSize: "10px", color:"red"}}>
                        {tileIndex}  
                    </div>
                    <div style={{position:"absolute", top: 0, right: "2px", fontSize: "10px", color:"red"}}>
                        {algebraicNotation(tileIndex)}
                    </div>
                    <div className={`w-16 h-16 content-center ${background(isBackgroundBlack, index)}`} onClick={move.bind(null, index)}>
                        {cell != " " && <img src={`chess/${piece(cell)}`} 
                            className={`${selected?.from == index? "w-12 h-12 ml-2 bg-blue-200": "w-12 h-12 ml-2" }`}
                        />}
                    </div>
                </div>
            );
        })}
        </div>
    );
}

function ChessInfo(){
    const activePlayer = useSelector((state: RootState) => state.chess.activePlayer);
    const turnNumber = useSelector((state: RootState) => state.chess.turnNumber);
    const selected = useSelector((state: RootState) => state.chess.selected);
    const target = useSelector((state: RootState) => state.chess.target); 
    const message = useSelector((state: RootState) => state.chess.message);

    return (
        <div className="mt-2 p-2 border-solid border-2 border-gray-500 w-129 font-bold select-none">
            <span className="m-1 pl-2 pr-2 border-solid border-1 border-gray-500 rounded-sm">
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

