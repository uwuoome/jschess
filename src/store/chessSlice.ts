import { algebraicMove, getCheckState, parseMove, validIndices } from "@/lib/chess-logic";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";


export type GamePlayer = {
  name: string,                      // player name
  socket: number | null,             // stores socketid for reconnect
  castling: CastlingAvailability,    // if rooks or king has moved to determine if castling is possible
  time: number;                      // remaining seconds
}; 
export type GameState = {
    mode: "network" | "hotseat" | "ai";   // basic game mode / opponent type
    players: [GamePlayer, GamePlayer];    // player specific info        
    myPlayer: 0 | 1;                      // player ID  (not used in hotseat games)   
    activePlayer: 0 | 1 | -1;             // active player index, or -1 to lock out both players
    turnNumber: number;                   // chess turn number
    //inCheck: 0 | 1 | 2 | 3;               // no | yes | checkmate | stalemate
    board: string[];                      // 64 element char array describing board state
    selected: null | ChessMove;           // selection made
    target: null | number;                // target tile to move to after selection 
    movesMade: string[];                  // log of moves made in algebraic notation, for replay or history browsing
    message: string;                      // message presented to user
    aiLevel: 1 | 2 | 3;                   // ai skill level in the game
    aiProgress: number;                   // ai search completion progress in percent
    lastMoveHilite: boolean;              // if set higlights move
    turnStart: number;                    // timestamp of when the turn started
    turnTimeIncrement: number;            // number of seconds added to player's timer after making each move
}
export type ChessMove = {
    piece: string;
    from: number;
    options: number[];
};

export type CastlingAvailability = 0 | 1 | 2 | 3; // none, left only, right only, both



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
/*
const initialBoard = [
  " ", " ", " ", " ", " ", " ", " ", "k",
  " ", " ", " ", " ", "R", " ", " ", " ",
  " ", " ", " ", " ", " ", " ", " ", " ",
  " ", "q", " ", " ", " ", " ", "Q", " ",
  " ", " ", " ", " ", " ", " ", " ", " ",
  " ", " ", " ", " ", " ", " ", " ", " ",
  " ", " ", " ", "r", " ", " ", " ", " ",
  "K", " ", " ", " ", " ", " ", " ", " ",
];
*/


const initialState: GameState = {
    mode: "hotseat",
    players: [{
      name: "Player 1",
      socket: null,
      castling: 3,
      time: 90*60
    }, {
      name: "Player 2",
      socket: null,
      castling: 3,
      time: 90*60
    }],
    myPlayer: 0,
    activePlayer: 0,
    turnNumber: 1,
    board: initialBoard,
    selected: null,
    target: null,
    movesMade: [],
    message: "",
    aiLevel: 2,
    aiProgress: 0,
    lastMoveHilite: false,    
    turnStart: Date.now(),
    turnTimeIncrement: 30,               
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
  if(state.selected.from == king && target == home+2){
    if(castlingAvailable & 1){  
      const nextBoard = [...state.board];
      nextBoard[king-1] = nextBoard[lrook];
      nextBoard[king-2] = nextBoard[king];
      nextBoard[king] = " ";
      nextBoard[lrook] = " ";
      state.board = nextBoard;
      return true;
    }
  }else if(state.selected.from == king && target == home+6){
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
function promotion(player: 0 | 1, piece: string, moveTo: number){
  if(piece.toUpperCase() != "P") return piece;
  const homeRow = getHomeRow(player == 1);
  const row = Math.floor(moveTo / 8);
  if(homeRow == 7 && row == 0) return player == 0? "Q": "q";
  if(homeRow == 0 && row == 7) return player == 0? "Q": "q";
  return piece;
}


function endTurn(state: GameState){
  state.selected = null;
  state.target = null;
  if(state.activePlayer == -1) {
    throw Error("Can't pass turn with no active player.");
  }
  // adjust current player's clock, then start set time for next turn start
  const elapsed = Math.floor( (Date.now()-state.turnStart) / 1000);
  const timeLeft = state.players[state.activePlayer].time - elapsed + state.turnTimeIncrement
  state.players[state.activePlayer].time = timeLeft;
  state.turnStart = Date.now();

  //toogle active player and increment turn after black
  state.activePlayer ^= 1;
  if(state.activePlayer == 0){
    state.turnNumber += 1;
  }
  // test for check or check and check mate
  const isBlackNext = !!state.activePlayer;
  const flipped = (state.mode == "hotseat" && isBlackNext) || (state.mode == "network" && state.myPlayer == 1);
  
  const checkState = getCheckState(isBlackNext, state.board, flipped);
  if(checkState == 1){
    if(state.mode == "network"){
      state.message = `Opponent is in Check.`;
    }else if(state.mode == "ai" && state.activePlayer == 1){
      state.message = `AI is in Check.`;
    }else{
      state.message = `You are in Check.`;
    }
  }else if(checkState == 2){
    state.message = `Checkmate: ${isBlackNext? 'White': 'Black'} Wins!`;
    state.activePlayer = -1;
  }else if(checkState == 3){
    state.message = `Stalemate: Draw`;
    state.activePlayer = -1;
  }else{
    state.message = ``;
  }
  
  if(state.mode == "ai" && state.activePlayer == 1 && checkState < 2){
    state.message += " AI is searching for next move...";
  }

}

function handleOpponentMove(state: GameState, action: PayloadAction<string>) {
  if(action.payload == "" || action.payload == "0000"){
    throw Error("Move required");
  }
  const move = parseMove(action.payload);
  if(move == null){
    throw Error("Invalid move: "+action.payload);
  }
  let [from, to, extra] = move as [number, number, string];
  const opponentIsBlack = state.myPlayer == 0;
  
  const isBlackNext = !!state.activePlayer;
  const flipped = (state.mode == "hotseat" && isBlackNext) || (state.mode == "network" && state.myPlayer == 1);
  const getPieceAfterPromotion = (moving: string, force: boolean) =>{
    if(force) return opponentIsBlack? "q": "Q";
    if(moving.toUpperCase() != "P") return moving;
    if(getHomeRow(flipped) != Math.floor(to / 8)) return moving;
    return opponentIsBlack? "q": "Q";
  }

  const nextBoard = [...state.board];
  if(opponentIsBlack){                    // if castling move rook first
    if(action.payload == "e8g8"){         // kingside castling
      nextBoard[7] = " ";
      nextBoard[5] = "r";
    }else if(action.payload == "e8c8"){   // queenside castling
      nextBoard[0] = " ";
      nextBoard[3] = "r";
    }
  }else{
    if(action.payload == "e1g1"){         // kingside
      nextBoard[63] = " ";
      nextBoard[61] = "R";
    }else if(action.payload == "e1c1"){   // queenside                  
      nextBoard[56] = " ";
      nextBoard[59] = "R";
    }
  }
  const moving = nextBoard[from];
  nextBoard[from] = " ";
  nextBoard[to] = getPieceAfterPromotion(moving, extra == "q");
  state.board = nextBoard;
  state.movesMade.push(algebraicMove(from, to));
}

const chessSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    initGame: (_state, action) => {
      const message = action.payload.movesMade? "Restored game in progress. "+(action.payload.message || "")  :"";
      const props = {mode: action.payload.mode, myPlayer: action.payload.player, aiLevel: action.payload.aiLevel}
      const args = (action.payload.player == null)? action.payload: props;
      return { ...initialState, ...args, message};
    },
    endGame: (state, action) => {
      const concede = !!action.payload;
      if(concede && state.mode == "ai"){
        state.message = "You have conceded.";
      }else{
        const activeName = state.activePlayer == 1? "Black": "White";
        state.message = concede? activeName+" concedes.": activeName+" left.";
      }
      state.activePlayer = -1;
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
          options: validIndices(action.payload, state.board, boardFlipped, castling)
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
            nextBoard[targetIndex] = promotion(state.activePlayer, state.selected.piece, targetIndex);
            state.board = nextBoard;
          }  
          state.target = targetIndex;
          state.selected.options = [];
          state.movesMade.push(algebraicMove(state.selected.from, targetIndex));
      }else{
        state.selected = null; 
      }
    },
    nextTurn: endTurn,
    opponentMove: handleOpponentMove,
    highlightLastMove: (state, action) => {
      state.lastMoveHilite = (!!action.payload);
    },
    setAIProgress: (state, action) => {
      const progress = parseInt(action.payload);
      if(isNaN(progress)) throw Error("Invalid Progess Value", action.payload);
      state.aiProgress = Math.min(100, Math.max(0, progress));
    },
    outOfTime: (state) => {
      const loser = state.activePlayer == 0? 'White': 'Black';
      const winner = state.activePlayer == 1? 'White': 'Black';
      state.message = `${loser} is out of time: ${winner} Wins!`;
      state.activePlayer = -1;
    }
  }
});

export const { 
  initGame, endGame, 
  selectPiece, movePiece, nextTurn, 
  opponentMove, 
  highlightLastMove, 
  setAIProgress,
  outOfTime,
} = chessSlice.actions;
export default chessSlice.reducer;