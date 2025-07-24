import { isInCheck, parseMove, validIndices } from "@/lib/chess-logic";
import { chunk } from "@/lib/utils";
import { createSlice } from "@reduxjs/toolkit";


export type GamePlayer = {
  name: string,                      // player name
  socket: number | null,             // stores socketid for reconnect
  castling: CastlingAvailability,    // if rooks or king has moved to determine if castling is possible
}; 
export type GameState = {
    mode: "network" | "hotseat" | "ai";   // basic game mode / opponent type
    players: [GamePlayer, GamePlayer];    // player specific info        
    myPlayer: 0 | 1;                      // player ID  (not used in hotseat games)   
    activePlayer: 0 | 1 | -1;             // active player index, or -1 to lock out both players
    turnNumber: number;                   // chess turn number
    inCheck: 0 | 1 | 2;                   // no | yes | checkmate
    board: string[];                      // 64 element char array describing board state
    selected: null | ChessMove;           // selection made
    target: null | number;                // target tile to move to after selection 
    movesMade: [number, number][];        // log of moves made, for replay or history browsing
    message: string;                      // message presented to user
}
export type ChessMove = {
    piece: string;
    from: number;
    options: number[];
};

export type CastlingAvailability = 0 | 1 | 2 | 3; // none, left only, right only, both
/*
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
*/
const initialBoard = [
  "r", " ", " ", " ", "k", " ", " ", "r",
  "p", "p", "b", "p", "p", " ", "p", "p",
  " ", " ", " ", " ", " ", "P", " ", " ",
  " ", " ", " ", " ", " ", " ", " ", " ",
  " ", " ", "P", " ", " ", " ", " ", " ",
  " ", " ", " ", " ", " ", " ", " ", " ",
  "P", "P", " ", "P", "P", " ", "P", "P",
  "R", " ", " ", " ", "K", " ", " ", "R",
];



const initialState: GameState = {
    mode: "hotseat",
    players: [{
      name: "Player 1",
      socket: null,
      castling: 3
    }, {
      name: "Player 2",
      socket: null,
      castling: 3
    }],
    myPlayer: 0,
    activePlayer: 0,
    turnNumber: 1,
    inCheck: 0,
    board: initialBoard,
    selected: null,
    target: null,
    movesMade: [],
    message: ""
}


const getHomeRow = (reversed: boolean) => reversed? 0: 7;

// Only called when completing a move. Checks if a rook or the king has moved, and if so logs the action.
// If the move to perform is castling, it performs the move too, and returns true signalling the board update.
function castling(state: GameState, target: number){
  if(state.activePlayer == -1 || state.selected == null || target == null){
    throw new Error("Invalid state for castling");
  }
  const castlingAvailable = state.players[state.activePlayer].castling;

  // affect future castling potential
  const reversed = (state.mode == "hotseat" && state.activePlayer == 1) || (state.mode == "network" && state.myPlayer == 1);  
  const homeRow = getHomeRow(reversed);
  const moveFrom = state.selected?.from;
  if(moveFrom == null) return; 
  const [row, col] = [Math.floor(moveFrom / 8), moveFrom % 8];
  if(row != homeRow) return;
  if(col == 4){
    state.players[state.activePlayer].castling = 0;  // no castling
  }else if(col == 0){
    state.players[state.activePlayer].castling &= 2; // turn off the 1 bit for lhs
  }else if(col == 7){
    state.players[state.activePlayer].castling &= 1; // turn off the 2 bit for rhs
  }

  // perform castling if that is the move 
  const home = homeRow * 8;
  const [lrook, king, rrook] = [home, home+4, home+7];
  if((state.selected.from == lrook && target == king) || (state.selected.from == king && target == lrook)){
    if(castlingAvailable & 1){  
      const nextBoard = [...state.board];
      nextBoard[king-1] = nextBoard[lrook];
      nextBoard[king-2] = nextBoard[king];
      nextBoard[king] = " ";
      nextBoard[lrook] = " ";
      state.board = nextBoard;
      return true;
    }
  }else if((state.selected.from == rrook && target == king) || (state.selected.from == king && target == rrook)){
    if(castlingAvailable & 2){  
      const nextBoard = [...state.board];
      nextBoard[king+1] = nextBoard[rrook];
      nextBoard[king+2] = nextBoard[king];
      nextBoard[king] = " ";
      nextBoard[rrook] = " ";
      state.board = nextBoard;
      return true;
    }
  }
  return false;
}

// returns the piece passed in, unless it is a pawn that has reached the last row, in which case it becomes a queen
// TODO: will we need selection? The unit could also become a knight, rook or bishop.
// TODO: this can be moved into logic, conbvert mode to flipped in that
function promotion(player: 0 | 1, piece: string, moveTo: number, mode: string){
  if(piece.toUpperCase() != "P") return piece;
  const homeRow = getHomeRow(player == 1);
  const row = Math.floor(moveTo / 8);
  const moveRow = (mode == "hotseat" &&  player == 1)? 7-row : row;
  if(homeRow == 7 && moveRow == 0) return player == 0? "Q": "q";
  if(homeRow == 0 && moveRow == 7) return player == 0? "Q": "q";
  return piece;
}

function endTurn(state: GameState){
  state.selected = null;
  state.target = null;
  state.activePlayer ^= 1;
  if(state.activePlayer == 0){
    state.turnNumber += 1;
  }
  // test for check or check and check mate
  const isBlackNext = !!state.activePlayer;
  const flipped = (state.mode == "hotseat" && isBlackNext) || state.myPlayer == 1;
  const checkState = isInCheck(isBlackNext, state.board, flipped);
  if(checkState == 1){
    state.message = `You are in Check.`;
  }else if(checkState == 2){
    state.message = `Checkmate: ${isBlackNext? 'White': 'Black'} Wins!`;
    state.activePlayer = -1;
  }else{
    state.message = ``;
  }
}

const chessSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setModeAndPlayerNumber: (state, action) => {
      const {mode, player} = action.payload;
      if(! ["network", "hotseat", "ai"].includes(mode)){
        throw Error("Invalid Game Mode: "+mode+" (value must be network, hotseat or ai)");
      }
      if(! [0, 1].includes(player)){
        throw Error("Invalid Player: "+player+" (value must be 0 or 1)");
      }
      state.mode = mode;
      state.myPlayer = player;
    },
    selectPiece: (state, action) => {
      if(state.selected || state.target) return; 
      if(state.activePlayer == -1) return;    
      if(action.payload != null){
        const piece = state.board[action.payload];
        if(piece == null || piece == " ") return; // no piece given
        const pieceOwner = piece.toLowerCase() == piece? 1: 0;
        if(pieceOwner != state.activePlayer) return;  // piece to move not owned by player 
        const boardFlipped = false;
        const castling = state.players[state.activePlayer].castling;
        state.selected = {
          piece,
          from: action.payload,
          options: validIndices(piece, action.payload, state.board, boardFlipped, castling)
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
          if(! castling(state, targetIndex) ) {
            const nextBoard = [...state.board];
            nextBoard[state.selected.from] = " ";
            // TODO: add any piece taken to a removed list, or it could be inferred from the board
            nextBoard[targetIndex] = promotion(state.activePlayer, state.selected.piece, targetIndex, state.mode);
            state.board = nextBoard;
          }  
          state.target = targetIndex;
          state.selected.options = [];
          state.movesMade.push([state.selected.from, targetIndex]);
      }else{
        state.selected = null; 
      }
    },
    nextTurn: endTurn,
    opponentMove: (state, action) =>{
      if((!action.payload) || action.payload == "0000"){
        return endTurn(state);
      }
      const move = parseMove(action.payload);
      if(move == null){
        throw Error("Invalid move: "+action.payload);
      }
      let [from, to, extra] = move as [number, number, string];
      const opponentIsBlack = state.myPlayer == 0;
      const opponentQueen = opponentIsBlack? "q": "Q";
      //TODO: need to detect castling here!
        const nextBoard = [...state.board];
        const moving = nextBoard[from];
        nextBoard[from] = " ";
        nextBoard[to] = extra == "p"? opponentQueen: moving;
        state.board = nextBoard;
      //}
      state.activePlayer ^= 1;
      if(state.activePlayer == 0){
        state.turnNumber += 1;
      }
      // test for check or check and check mate
      const isBlackNext = !!state.activePlayer;
      const flipped = (state.mode == "hotseat" && isBlackNext) || (state.mode == "network" && state.myPlayer == 1);
      const checkState = isInCheck(isBlackNext, state.board, flipped);
      if(checkState == 1){
        state.message = `Your are in Check.`;
      }else if(checkState == 2){
        state.message = `Checkmate: ${isBlackNext? 'White': 'Black'} Wins!`;
        state.activePlayer = -1;
      }
    }
  }
});

export const { setModeAndPlayerNumber, selectPiece, movePiece, nextTurn, opponentMove} = chessSlice.actions;
export default chessSlice.reducer;