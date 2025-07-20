import { algebraicNotation } from "@/lib/chess-logic";
import type { RootState } from "@/store";
import { movePiece, nextTurn, selectPiece } from "@/store/chessSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";


function ChessBoard(){

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
        if(selected == null){
            dispatch( selectPiece(index) );
        }else{
            dispatch( movePiece(index) );
        }
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
            const bg = isBlack? "bg-gray-500": "bg-gray-200"
            return `${bg} border-8 border-solid border-blue-200`;
        }   
        return isBlack? "bg-gray-400": "bg-white"
    }
    
    return (
        <div className="grid grid-cols-8 border-2 border-black w-fit select-none">
        {board.map((cell, index) => {
            const isBlack = (Math.floor(index / 8) + (index % 8)) % 2 == 0;
            return (
                <div style={{position:"relative"}} key={index}>
                    <div style={{position:"absolute", top: 0, left: "2px", fontSize: "10px", color:"red"}}>{index}</div>
                    <div className={`w-16 h-16 content-center ${background(isBlack, index)}`} onClick={move.bind(null, index)}>
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

export default function Chess() {
    return (
    <>
        <ChessBoard />
        <ChessInfo />
    </>
    );
};

