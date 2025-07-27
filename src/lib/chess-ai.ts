import { algebraicNotation, isInCheck, pieceName, validIndices } from "./chess-logic";

const EMPTY = " ";

// all the potential moves a piece at index 'from' can move 'to'
type PiecePotential = {
    from: number;
    to: number[];
};

type ScoredTarget = {
    score: number;
    index: number;
}

type RankedPieceMoves = {
    from: number;
    to: ScoredTarget[],
};

function getPlayerMoveAvailable(isBlack: boolean, board: string[]): PiecePotential[]{
    const pieceCodes = isBlack? "prnbkq": "PRNBKQ";
    const pieceIndices = board.reduce((acc, cur, i: number) => {
        if(pieceCodes.includes(cur)) acc.push(i);
        return acc;
    }, [] as number[]);
    return pieceIndices.map((i: number) => {
        return {
            from: i,
            to: validIndices(i, board, false, 0) // don't include castling moves for now
        };
    }).filter(r => r?.to?.length > 0);
}

function getTable(pieceName: string){
    // table values measured in centipawns, or 100th of a pawn's value
    // from black's perspective
    const pawnTable = [
        0,   0,   0,   0,   0,   0,   0,   0,
        5,  10,  10, -20, -20,  10,  10,   5,
        5,  -5, -10,   0,   0, -10,  -5,   5,
        0,   0,   0,  20,  20,   0,   0,   0,
        5,   5,  10,  25,  25,  10,   5,   5,
        10,  10,  20,  30,  30,  20,  10,  10,
        50,  50,  50,  50,  50,  50,  50,  50,
        0,   0,   0,   0,   0,   0,   0,   0
    ];
    const knightTable = [
        -50, -40, -30, -30, -30, -30, -40, -50,
        -40, -20,   0,   5,   5,   0, -20, -40,
        -30,   5,  10,  15,  15,  10,   5, -30,
        -30,   0,  15,  20,  20,  15,   0, -30,
        -30,   5,  15,  20,  20,  15,   5, -30,
        -30,   0,  10,  15,  15,  10,   0, -30,
        -40, -20,   0,   0,   0,   0, -20, -40,
        -50, -40, -30, -30, -30, -30, -40, -50
    ];
    const bishopTable = [
        -20, -10, -10, -10, -10, -10, -10, -20,
        -10,   5,   0,   0,   0,   0,   5, -10,
        -10,  10,  10,  10,  10,  10,  10, -10,
        -10,   0,  10,  10,  10,  10,   0, -10,
        -10,   5,   5,  10,  10,   5,   5, -10,
        -10,   0,   5,  10,  10,   5,   0, -10,
        -10,   0,   0,   0,   0,   0,   0, -10,
        -20, -10, -10, -10, -10, -10, -10, -20
    ];
    const rookTable = [
        0,   0,   5,  10,  10,   5,   0,   0,
        -5,   0,   0,   0,   0,   0,   0,  -5,
        -5,   0,   0,   0,   0,   0,   0,  -5,
        -5,   0,   0,   0,   0,   0,   0,  -5,
        -5,   0,   0,   0,   0,   0,   0,  -5,
        -5,   0,   0,   0,   0,   0,   0,  -5,
        5,  10,  10,  10,  10,  10,  10,   5,
        0,   0,   0,   0,   0,   0,   0,   0
    ];
    const queenTable = [
        -20, -10, -10, -5, -5, -10, -10, -20,
        -10,   0,   0,  0,  0,   0,   0, -10,
        -10,   5,   5,  5,  5,   5,   0, -10,
          0,   0,   5,  5,  5,   5,   0, -5,
        -5,    0,   5,  5,  5,   5,   0, -5,
        -10,   0,   5,  5,  5,   5,   0, -10,
        -10,   0,   0,  0,  0,   0,   0, -10,
        -20, -10, -10, -5, -5, -10, -10, -20
    ];
    const kingTable = [
         20,  30,  10,   0,   0,  10,  30,  20,
         20,  20,   0,   0,   0,   0,  20,  20,
        -10, -20, -20, -20, -20, -20, -20, -10,
        -20, -30, -30, -40, -40, -30, -30, -20,
        -30, -40, -40, -50, -50, -40, -40, -30,
        -30, -40, -40, -50, -50, -40, -40, -30,
        -30, -40, -40, -50, -50, -40, -40, -30,
        -30, -40, -40, -50, -50, -40, -40, -30
    ];
    const positionValues: Record<string, number[]> = {
        "P": pawnTable,
        "N": knightTable,
        "B": bishopTable,
        "R": rookTable,
        "Q": queenTable,
        "K": kingTable 
    };
    // TODO: adjust if AI is playing white
    const table = positionValues[pieceName.toUpperCase()];

    return (index: number) => table[index];
}


const squareMirror = (index: number) => index ^ 56;             // reverses row on mirrored 64 element boards using XOR
const sum = (arr: number[]) => arr.reduce((acc, cur) => acc+cur, 0);

// Assesses a board state and gives it a weight, dependent on the number of pieces and their placement on the board
// Move evaluation as described by: https://medium.com/dscvitpune/lets-create-a-chess-ai-8542a12afef
function weighBoard(board: string[]){
    const pc = piecesOnBoard(board);
    // AI is black only for now
    // number of each piece type multipled by its value.
    const material = 100*(pc["p"].length-pc["P"].length) + 320*(pc["n"].length-pc["N"].length) + 
                        330*(pc["b"].length-pc["B"].length) + 500*(pc["r"].length-pc["R"].length) + 
                        900*(pc["q"].length-pc["Q"].length); 
    const pawnTable = getTable("P");  
    const knightTable = getTable("N"); 
    const bishopTable = getTable("B");  
    const rookTable = getTable("R");  
    const queenTable = getTable("Q"); 
    const kingTable = getTable("K");
    const pLocValue = sum(pc["p"].map(pawnTable)) - sum(pc["P"].map(squareMirror).map(pawnTable));
    const nLocValue = sum(pc["n"].map(knightTable)) - sum(pc["N"].map(squareMirror).map(knightTable)); 
    const bLocValue = sum(pc["b"].map(bishopTable)) - sum(pc["B"].map(squareMirror).map(bishopTable)); 
    const rLocValue = sum(pc["r"].map(rookTable)) - sum(pc["R"].map(squareMirror).map(rookTable));
    const qLocValue = sum(pc["q"].map(queenTable)) - sum(pc["Q"].map(squareMirror).map(queenTable));
    const kLocValue = kingTable(pc["k"][0]) - kingTable(pc["K"][0]);
    return material + pLocValue + nLocValue + bLocValue +rLocValue + qLocValue + kLocValue;
}

function rankAIMoves(moves: PiecePotential[], board: string[]): RankedPieceMoves[]{
    
    function scoreTarget(aiTurn: boolean, board: string[], from: number, to: number){
        // create an affected board state 
        const nextBoard = [...board];
        nextBoard[to] = nextBoard[from];
        nextBoard[from] = EMPTY;

        
        // checking if white player, board not flipped
        const checkState = isInCheck(false, nextBoard, false);
        if(checkState == 2) return {  // wins or loses game
            score: aiTurn? 9999: -9999, 
            index: to
        }; 
        // TODO: test for stalement, or insufficient material and return draw
        // TODO: work out what to do with castling and promotion
        return {
            score: weighBoard(nextBoard),
            index: to
        };
    }
    return moves.map(piece => {
        // copy the board with the move effected then pass to 
        return {
            from: piece.from,
            to: piece.to.map(scoreTarget.bind(null, true, board, piece.from))
        };
    });

}

// used for weighing capture (less pieces on board hold greater weight)
function piecesOnBoard(board: string[]){
    const pieces: Record<string, number[]> = {
        "P": [], "N": [], "B": [], "R": [], "Q": [], "K": [],
        "p": [], "n": [], "b": [], "r": [], "q": [], "k": [],
    };
    board.forEach((p: string, i: number) => {
        if(p in pieces) pieces[p].push(i);
    });
    return pieces;
}

export function getNextMove(isBlack: boolean, board: string[]): string{
    const aiMoves =  getPlayerMoveAvailable(isBlack, board);
    const rankedAIMoves = rankAIMoves(aiMoves, board);
    const pieces = piecesOnBoard(board);
    function bestMoveForPiece(move: RankedPieceMoves){
        const pickBest = (acc: ScoredTarget, cur: ScoredTarget) => acc.score > cur.score? acc: cur;
        const best = move.to.reduce(pickBest, {score:  -99999, index: -1});
        return {
            from: move.from,
            to: best.index,
            score: best.score
        };
    }
    const bestPieceToMove = (move: any, acc: any) => move.score > acc.score? move: acc;
    const bestMove = rankedAIMoves.map(bestMoveForPiece).reduce(bestPieceToMove);
    debugInfo(board, pieces, aiMoves, rankedAIMoves, bestMove);
    return algebraicNotation(bestMove.from)+algebraicNotation(bestMove.to);
}

function debugInfo(board: string[], pieces: Record<string, number[]>, aiMoves: PiecePotential[], 
                    rankedAIMoves: RankedPieceMoves[], bestMove: {from: number, to: number, score: number}){
    console.log("piece counts", pieces);
    console.log(aiMoves.length, "pieces can move");
    function printMoveScore(moveTo: {index: number, score: number}){
        return `${algebraicNotation(moveTo.index)}[${moveTo.score}]`; 
    }
    rankedAIMoves.forEach(p => {
      console.log(pieceName(board[p.from]), "at", algebraicNotation(p.from), 
                "can move to: ", p.to.map(printMoveScore).join(", "));
    });
    console.log("Best Move Found: ", algebraicNotation(bestMove.from)+algebraicNotation(bestMove.to), "scores", bestMove.score);
}