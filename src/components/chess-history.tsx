import type { RootState } from "@/store";
import { useSelector } from "react-redux";
import React, { useState } from "react";
import { background, piece } from "./chess";
import { parseMove } from "@/lib/chess-logic";
import { Button } from "./ui/button";

type HistoricBoardProps = {
    board: string[];
    irBlack: boolean;
    turn: number;
}

type HistoricInfoProps = HistoricBoardProps & {
    closer: (event: React.MouseEvent) => void
}
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

function buildBoard(moveHistory: string[], turn: number){
    const board = [...initialBoard];
    for(let i=0; i<moveHistory.length && i<turn; i++){
        const [from, to] = parseMove(moveHistory[i]) as [number, number];
        if(moveHistory[i] == "e8g8"){                           // handle castling
            board[7] = " ";
            board[5] = "r";
        }else if(moveHistory[i] == "e8c8"){
            board[0] = " ";
            board[3] = "r";
        }else if(moveHistory[i] == "e1g1"){
            board[63] = " ";
            board[61] = "R";
        }else if(moveHistory[i] == "e1c1"){
            board[56] = " ";
            board[59] = "r";
        }else{
            board[to] = board[from];
        }
        if(board[from] == "p" || board[from] == "P"){           // handle promotion
            const rowTo = Math.floor(to / 8);
            if(rowTo == 0 || rowTo == 7){
                board[to] = board[from] == "p"? "q": "Q";
            }
        }
        board[from] = " ";
    }
    return board;
}

export default function MoveHistory() {
    const mode = useSelector((state: RootState) => state.chess.mode);
    const activePlayer = useSelector((state: RootState) => state.chess.activePlayer);
    const myPlayerNumber = useSelector((state: RootState) => state.chess.myPlayer);
    const history = useSelector((state: RootState) => state.chess.movesMade);
    function turnName(moveIndex: number){
        const t = Math.floor(moveIndex / 2)+1;
        const c = moveIndex % 2 == 1? "Black": "White";
        return t+" "+c;
    }
    function goto(moveIndex: number){
        if(selected == moveIndex){
            setSelected(-1);
        }else{
            setSelected(moveIndex);
        }
    }
    function closer(){
        setSelected(-1);
    }
    const [selected, setSelected] = useState(-1);
    const irBlack = (mode == "hotseat" && activePlayer == 1) || (mode == "network" && myPlayerNumber == 1);
    function hilite(moveIndex: number){
        return moveIndex == selected? "bg-lime-400":"";
    }
    const board = buildBoard(history, selected+1);
    return (
        <>
            <div className="w-40 ml-2 mr-2 border-black border-2 select-none">
                <div className="w-1/2 inline-block text-center font-bold bg-gray-200">Turn</div>
                <div className="w-1/2 inline-block text-center font-bold bg-gray-200">Move</div>
                {history.map((mm, i) => (
                    <div className={`no-select cursor-pointer border-b-1 ${hilite(i)}`} onClick={goto.bind(null, i)}>
                        <div className="w-1/2 inline-block pl-2">
                            {turnName(i)}
                        </div>
                        <div className="w-1/2 inline-block pl-2">
                            {mm}
                        </div>
                    </div>
                ))}
            </div>
            {selected != -1 && 
            <div>
                <HistoricBoard board={board} turn={selected+1} irBlack={irBlack} />
                <HistoricInfo board={board} turn={selected+1} irBlack={irBlack} closer={closer}  />
            </div>}
        </>
    );
}


function HistoricBoard(props: HistoricBoardProps){
    const isFlipped = props.irBlack;
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
                    <div className={`w-16 h-16 content-center ${background(isBackgroundBlack, index)}`}>
                    {props.board[index] !== " " && (
                        <img src={`/chess/${piece(props.board[index])}`} className="w-12 h-12 ml-2" />
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


function HistoricInfo(props: HistoricInfoProps){
    const activePlayer = props.turn % 2 == 0? 1: 0;
    const turnClass = activePlayer == 1? 'bg-black text-white': 'text-black bg-white';
    function exportBoard(board: string[]){
        console.log(board);
    }
    return (
        <div className="mt-2 p-2 border-solid border-2 border-gray-500 w-136 font-bold select-none">
            <span className={`m-1 pl-2 pr-2 border-solid border-1 border-gray-500 rounded-sm ${turnClass}`}>
                Previous Board State
            </span>
            <span className={`m-1 pl-2 pr-2 border-solid border-1 border-gray-500 rounded-sm ${turnClass}`}>
                Turn {props.turn} {activePlayer? "Black": "White"}
            </span>
            <Button className="h-6 float-right ml-2" onClick={props.closer}>Close</Button>
            <Button className="h-6 float-right ml-2" onClick={exportBoard.bind(null, props.board)}>Export</Button>
        </div>
    );
}
