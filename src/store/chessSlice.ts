import { isInCheck, validIndices } from "@/lib/chess-logic";
import { chunk } from "@/lib/utils";
import { createSlice } from "@reduxjs/toolkit";


export type GamePlayers = [string | null, string | null];
export type GameState = {
    status: string;
    players: GamePlayers;
    activePlayer: 0 | 1;
    turnNumber: number;
    inCheck: 0 | 1 | 2; // no | yes | checkmate
    board: string[];
    selected: null | ChessMove;
    target: null | number;
    network: boolean;
    movesMade: [number, number][];
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
    inCheck: 0,
    board: initialBoard,
    selected: null,
    target: null,
    network: false,
    movesMade: [],
}


const chessSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    selectPiece: (state, action) => {
      if(state.selected || state.target) return; 
      if(action.payload != null){
        const piece = state.board[action.payload];
        if(piece == null || piece == " ") return; // no piece given
        const pieceOwner = piece.toLowerCase() == piece? 1: 0;
        if(pieceOwner != state.activePlayer) return;  // piece to move not owned by player 
        const boardFlipped = state.network == false && state.activePlayer == 1;  
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
      if(! state.network){ // flip board
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
      const checkState = isInCheck(isBlackNext, state.board, (state.network && isBlackNext));
      if(checkState == 1) alert("In check");
      if(checkState == 2) alert("Checkmate");
    }
  }
});

export const { selectPiece, movePiece, nextTurn} = chessSlice.actions;
export default chessSlice.reducer;