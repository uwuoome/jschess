import { validIndices } from "@/lib/chess-helper";
import { useState } from "react";

const initialBoard = [
  "r", "n", "b", "q", "k", "b", "n", "r",
  "p", "p", "p", "p", "p", "p", "p", "p",
  " ", " ", " ", " ", " ", " ", " ", " ",
  " ", " ", " ", " ", " ", " ", " ", " ",
  " ", " ", " ", " ", " ", " ", " ", " ",
  " ", " ", " ", " ", " ", " ", " ", " ",
  "P", "P", "P", "P", "P", "P", "P", "P",
  "R", "N", "B", "Q", "K", "B", "N", "R",
];

const DEBUG = 0;

type ChessMove = {
    piece: string;
    from: number;
    options: number[];
};

function ChessBoard(){
    const [board, setBoard] = useState(initialBoard);
    const [selected, setSelected] = useState<ChessMove | null>(null);

    function piece(code: string){
        const upper = code.toUpperCase();
        const colour = code == upper? "W": "B";
        return `${colour}${upper}.svg`;
    }

    function move(code: string, index: number, event: any){ 
        if(selected == null){   // select unit
            if(code == " ") return;
            // TODO: check piece is of active player's colour 
            console.log("Move From", code, index);
            setSelected({
                piece: code, 
                from: index, 
                options: validIndices(code, index, board)
            });
        }else{                  // move unit
            console.log(selected.options);
            if(selected.options.includes(index)){
                console.log("Move To", index);
                const nextBoard = [...board];
                nextBoard[selected.from] = " ";
                // TODO: add any piece taken to a removed list, or it could be inferred from the board
                nextBoard[index] = selected.piece;
                setBoard(nextBoard);
            }else{
                console.log("Invalid Move");
            }
            setSelected(null);
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
//style={selected && selected.from == index?{background: 'green'}:{}} 
export default function Chess() {

  return (
    <ChessBoard />
  );
};

