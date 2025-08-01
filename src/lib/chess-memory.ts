import { parseMove } from "./chess-logic";

type ChessGameMode = "network" | "ai" | "hotseat";


export function saveChessState(mode: ChessGameMode, data: any){
    localStorage.setItem(`chess_state_${mode}`, JSON.stringify(data));
}

export function getSavedChessState(mode: ChessGameMode){
    const state = localStorage.getItem(`chess_state_${mode}`);
    if(typeof state  == "string") return JSON.parse(state);
    return state;
}

export function clearChessState(mode: ChessGameMode){
    localStorage.removeItem(`chess_state_${mode}`);
}

/**
 * Reconstructs a board state from a move list, up until the given turn number or last turn.
 */
export function reconstructBoard(moveHistory: string[], turn: number = 9999){
    const board = [
        "r", "n", "b", "q", "k", "b", "n", "r",
        "p", "p", "p", "p", "p", "p", "p", "p",
        " ", " ", " ", " ", " ", " ", " ", " ",
        " ", " ", " ", " ", " ", " ", " ", " ",
        " ", " ", " ", " ", " ", " ", " ", " ",
        " ", " ", " ", " ", " ", " ", " ", " ",
        "P", "P", "P", "P", "P", "P", "P", "P",
        "R", "N", "B", "Q", "K", "B", "N", "R",
    ];
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