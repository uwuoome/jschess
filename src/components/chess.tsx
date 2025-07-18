import { validIndices } from "@/lib/chess-moves";
import type { RootState } from "@/store";
import { movePiece, selectPiece } from "@/store/chessSlice";
import { useDispatch, useSelector } from "react-redux";

const DEBUG = 0;


function ChessBoard(){

    const board = useSelector((state: RootState) => state.chess.board);
    const selected = useSelector((state: RootState) => state.chess.selected);
    const dispatch = useDispatch();

    function piece(code: string){
        const upper = code.toUpperCase();
        const colour = code == upper? "W": "B";
        return `${colour}${upper}.svg`;
    }

    function move(code: string, index: number, event: any){ 
        if(selected == null){   // select unit
            if(code == " ") return;
            // TODO: check piece is of active player's colour 
            dispatch(selectPiece({piece: code, from: index}));
        }else{                  // move unit
            dispatch(movePiece(index));
            /*
            if(selected.options.includes(index)){
                console.log("Move To", index);
                const nextBoard = [...board];
                nextBoard[selected.from] = " ";
                // TODO: add any piece taken to a removed list, or it could be inferred from the board
                nextBoard[index] = selected.piece;
                dispatch(setBoard(nextBoard));
            }else{
                console.log("Invalid Move");
            }
            dispatch(setSelected(null));
            */
        }
    }
    function getBackground(isBlack:boolean, index:number){
        const canMoveTo = selected?.options.includes(index);
        if(canMoveTo){
            const bg = isBlack? "bg-gray-500": "bg-gray-200"
            return `${bg} border-8 border-solid border-blue-200`;
        }   
        const bg = isBlack? "bg-gray-400": "bg-white"
        return bg;
    }
    return (
        <div className="grid grid-cols-8 border-2 border-black w-fit select-none">
        {board.map((cell, index) => {
            const isBlack = (Math.floor(index / 8) + (index % 8)) % 2 == 0;
            return (
                <div key={index} 
                        className={`w-16 h-16 content-center ${getBackground(isBlack, index)}` } 
                        onClick={move.bind(null, cell, index)} >
                    {DEBUG && <span style={{color:"red", fontSize: "10px"}}>{index}</span> || ""}       
                    {cell != " " && <img src={`chess/${piece(cell)}`} 
                        className={`${selected?.from == index? "w-12 h-12 ml-2 bg-blue-200": "w-12 h-12 ml-2" }`}
                    />}
                </div>
            );
        })}
        </div>
    );
}

function ChessInfo(){
    const activePlayer = useSelector((state: RootState) => state.chess.activePlayer);
    const turnNumber = useSelector((state: RootState) => state.chess.turnNumber);
    return (
        <div className="mt-2 p-2 border-solid border-2 border-gray-500 w-129 font-bold">
            Turn {turnNumber} {activePlayer? "Black": "White"}
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

