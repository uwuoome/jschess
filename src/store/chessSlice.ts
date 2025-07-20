import { isInCheck, validIndices } from "@/lib/chess-logic";
import { chunk } from "@/lib/utils";
import { createSlice } from "@reduxjs/toolkit";


export type GamePlayers = [string | null, string | null];
export type GameState = {
    mode: "network" | "hotseat" | "ai";
    sockets: GamePlayers;             // stores socketid for reconnect
    activePlayer: 0 | 1 | -1;         // active player index, or -1 to lock out both players
    turnNumber: number;               // chess turn number
    inCheck: 0 | 1 | 2;               // no | yes | checkmate
    board: string[];                  // 64 element char array describing board state
    selected: null | ChessMove;       // selection made
    target: null | number;            // target tile to move to after selection 
    movesMade: [number, number][];
    message: string;                  // message presented to user
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
    mode: "hotseat",
    sockets: [null, null], 
    activePlayer: 0,
    turnNumber: 1,
    inCheck: 0,
    board: initialBoard,
    selected: null,
    target: null,
    movesMade: [],
    message: ""
}


const chessSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    selectPiece: (state, action) => {
      if(state.selected || state.target) return; 
      if(state.activePlayer == -1) return;    
      if(action.payload != null){
        const piece = state.board[action.payload];
        if(piece == null || piece == " ") return; // no piece given
        const pieceOwner = piece.toLowerCase() == piece? 1: 0;
        if(pieceOwner != state.activePlayer) return;  // piece to move not owned by player 
        const boardFlipped = state.mode == "hotseat" && state.activePlayer == 1;  
        state.selected = {
          piece,
          from: action.payload,
          options: validIndices(piece, action.payload, state.board, boardFlipped)
        };
      }else{
        state.selected = null;
      }
    },
    movePiece: (state, action) => {
      if(state.target != null) return;      // move made, locked out until turn passed
      if(state.activePlayer == -1) return; 
      const targetIndex = action.payload;
      if(state.selected?.options.includes(targetIndex)){
          const nextBoard = [...state.board];
          nextBoard[state.selected.from] = " ";
          // TODO: add any piece taken to a removed list, or it could be inferred from the board
          nextBoard[targetIndex] = state.selected.piece;
          state.target = targetIndex;
          state.board = nextBoard;
          state.selected.options = [];
          state.movesMade.push([state.selected.from, targetIndex]);
      }else{
        state.selected = null; 
      }
    },
    nextTurn: (state) => {
      if(state.mode == "hotseat"){ // flip board
        state.board = chunk(state.board, 8).reverse().flat();
      }
      state.selected = null;
      state.target = null;
      state.activePlayer ^= 1;
      if(state.activePlayer == 0){
        state.turnNumber += 1;
      }
      // test for check or check and check mate
      const isBlackNext = !!state.activePlayer;
      const checkState = isInCheck(isBlackNext, state.board, (state.mode == "hotseat" && isBlackNext));
      if(checkState == 1){
        state.message = `Your are in Check.`;
      }else if(checkState == 2){
        state.message = `Checkmate: ${isBlackNext? 'White': 'Black'} Wins!`;
        state.activePlayer = -1;
      }
    }
  }
});

export const { selectPiece, movePiece, nextTurn} = chessSlice.actions;
export default chessSlice.reducer;