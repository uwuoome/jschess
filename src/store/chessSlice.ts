import { validIndices } from "@/lib/chess-moves";
import { chunk } from "@/lib/utils";
import { createSlice } from "@reduxjs/toolkit";


export type GamePlayers = [string | null, string | null];
export type GameState = {
    status: string;
    players: GamePlayers;
    activePlayer: 0 | 1;
    turnNumber: number;
    inCheck: boolean;
    board: string[];
    selected: null | ChessMove;
    network: boolean;
}
export type ChessMove = {
    piece: string;
    from: number;
    options: number[];
};

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

const initialState: GameState = {
    status: "none",
    players: [null, null], // stores socketid for reconnect
    activePlayer: 0,
    turnNumber: 1,
    inCheck: false,
    board: initialBoard,
    selected: null,
    network: false,
}


const chessSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    selectPiece: (state, action) => {
      if(action.payload != null){
        if(action.payload.piece == null || action.payload.piece == " ") return; // no piece given
        const pieceOwner = action.payload.piece.toLowerCase() == action.payload.piece? 1: 0;
        if(pieceOwner != state.activePlayer) return;  // piece to move not owned by player                      
        const boardFlipped = state.network == false && state.activePlayer == 1; 
        action.payload.options = validIndices(action.payload.piece, action.payload.from, state.board, boardFlipped);
      }
      state.selected = action.payload;
    },
    movePiece: (state, action) => {
      const targetIndex = action.payload;
      if(state.selected?.options.includes(targetIndex)){
          const nextBoard = [...state.board];
          nextBoard[state.selected.from] = " ";
          // TODO: add any piece taken to a removed list, or it could be inferred from the board
          nextBoard[targetIndex] = state.selected.piece;
          state.activePlayer ^= 1;
          if(state.activePlayer == 0){
            state.turnNumber += 1;
          }
          if(! state.network){ // flip board
            state.board = chunk(nextBoard, 8).reverse().flat();
          } else{
            state.board = nextBoard;
          }
          // todo: progress to next player's turn
      }
      state.selected = null;
    }
  }
});

export const { selectPiece, movePiece} = chessSlice.actions;
export default chessSlice.reducer;