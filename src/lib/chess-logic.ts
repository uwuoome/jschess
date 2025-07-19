/**
 * Provides logic for handling games of chess. 
 * Generates lists of valid moves for given pieces, see: validIndices
 * Checks for check and checkmate: isInCheck
 * And converts indices to algebraic notation: algebraicNotation
 * Board representation is a 64 element array of char codes:
   const exampleStartingBoard = [
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
const EMPTY = " ";

const rowColToIndex = (rc: any[]) => parseInt(rc[0]) * 8 + rc[1];

function onBoard(row: number, col: number) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function myPiece(irBlack: boolean, row: number, col: number, board: string[], flipped: boolean){
    const index = row * 8 + col;
    if(board[index] == EMPTY) return false;
    const toTakeIsBlack = board[index].toUpperCase() != board[index];
    if(flipped) return irBlack != toTakeIsBlack;
    return irBlack == toTakeIsBlack;
}
function opPiece(irBlack: boolean, row: number, col: number, board: string[], flipped: boolean){
    const index = row * 8 + col;
    if(board[index] == EMPTY) return false;
    const toTakeIsBlack = board[index].toUpperCase() != board[index];
    if(flipped) return irBlack == toTakeIsBlack;
    return irBlack != toTakeIsBlack;
}

function project(irBlack: boolean, row: number, col: number, board: string[], flipped: boolean, dr: number, dc: number): number[][] {
    const result = [];
    let r = row + dr;
    let c = col + dc;
    while(onBoard(r, c)){
        const idx = r * 8 + c;
        if(board[idx] === EMPTY){
            result.push([r, c]);
        }else if(opPiece(irBlack, r, c, board, flipped)){
            result.push([r, c]);
            return result; // stop after capturing opponent's piece
        }else if (myPiece(irBlack, r, c, board, flipped)){
            return result; // blocked by own piece
        }else{
            throw Error("Error unhandled state projecting possible moves.");
        }
        r += dr;
        c += dc;
    }
    return result;
}

function kingMoves(irBlack: boolean, row: number, col: number, board: string[], flipped: boolean){
    function validate(rowTo: number, colTo: number){
        return !myPiece(irBlack, rowTo, colTo, board, flipped); // target isnt an owned piece
    }
    const result = [];
    if(row > 0){
        if(col > 0 && validate(row-1, col-1)) result.push([row-1, col-1]);
        if(validate(row-1, col)) result.push([row-1, col]);
        if(col < 7 && validate(row-1, col+1)) result.push([row-1, col+1]);
    }
    if(col > 0 && validate(row, col-1)) result.push([row, col-1]);
    if(col < 7 && validate(row, col+1)) result.push([row, col+1]); 
    if(row < 7){
        if(col > 0 && validate(row+1, col-1)) result.push([row+1, col-1]);
        if(validate(row+1, col)) result.push([row+1, col]);
        if(col < 7 && validate(row+1, col+1)) result.push([row+1, col+1]);
    }
    return result.map(rowColToIndex);;
}

function queenMoves(irBlack: boolean, row: number, col: number, board: string[], flipped: boolean){
    const projectDir = project.bind(null, irBlack, row, col, board, flipped);
    return [
        projectDir(-1, 0), 
        projectDir(1, 0),
        projectDir(0, -1),
        projectDir(0, 1),
        projectDir(-1, -1), 
        projectDir(-1, 1),
        projectDir(1, -1),
        projectDir(1, 1)
    ].flat().map(rowColToIndex);
}

function rookMoves(irBlack: boolean, row: number, col: number, board: string[], flipped: boolean){
    const projectDir = project.bind(null, irBlack, row, col, board, flipped);
    return [
        projectDir(-1, 0), 
        projectDir(1, 0),
        projectDir(0, -1),
        projectDir(0, 1)
    ].flat().map(rowColToIndex);
}

function bishopMoves(irBlack: boolean, row: number, col: number, board: string[], flipped: boolean){
    const projectDir = project.bind(null, irBlack, row, col, board, flipped);
    return [
        projectDir(-1, -1), 
        projectDir(-1, 1),
        projectDir(1, -1),
        projectDir(1, 1)
    ].flat().map(rowColToIndex);
}

function knightMoves(irBlack: boolean, row: number, col: number, board: string[], flipped: boolean){
    const validMove = (rc: number[]) => onBoard(rc[0], rc[1]) && (!myPiece(irBlack, rc[0], rc[1], board, flipped));
    return [
        [row-1, col+2],
        [row-1, col-2],
        [row+1, col+2],
        [row+1, col-2],
        [row-2, col+1],
        [row-2, col-1],
        [row+2, col+1],
        [row+2, col-1]
    ].filter(validMove).map(rowColToIndex);
}
function pawnMoves(irBlack: boolean, row: number, col: number, board: string[], flipped: boolean){
    const result = [];
    function scanAhead(nextRow: number){
        if(board[nextRow * 8 + col] == " ") result.push([nextRow, col]);
        if(col > 0 && opPiece(irBlack, nextRow, col-1, board, flipped)) result.push([nextRow, col-1]);
        if(col < 7 && opPiece(irBlack, nextRow, col+1, board, flipped)) result.push([nextRow, col+1]);
    }
    if(irBlack){
        //if(row < 7){ // TODO: at end of board turns to queen, so this check can then be removed
        scanAhead(row + 1);
        if(row == 1 && board[16 + col] == " " && board[24 + col] == " ") result.push([3, col]);
    }else{  //irWhite
        scanAhead(row - 1);
        if(row == 6 && board[40 + col] == " " && board[32 + col] == " ") result.push([4, col]);
    }
    return result.map(rowColToIndex);
}

/**
 * @param code char code of piece to move. K, Q, R, B, N, P or the same in lower case for black pieces.
 * @param index one dimensional board index of piece to move.
 * @param board 64 element array containing board tiles.
 * @param flipped if set, this flag denotes that the board has been turned upside down for black player playing locally.
 * @return an array of indices coresponding to valid move locations.
 */
export function validIndices(code: string, index: number, board: string[], flipped: boolean){
    const ignoringCheckStatus = _validIndices(code, index, board, flipped); 
    const irBlack = code.toUpperCase() != code; 
    function notMovingIntoCheck(moveIndex: number){
        const nextBoard = [...board];
        nextBoard[index] = EMPTY;
        nextBoard[moveIndex] = code;
        const kingIndex = nextBoard.indexOf(irBlack?  "k": "K");
        const checkFrom: number = pieceThatCanTake(irBlack, nextBoard, flipped, kingIndex);
        return checkFrom == -1;
    }
    return ignoringCheckStatus.filter(notMovingIntoCheck);
}

function _validIndices(code: string, index: number, board: string[], flipped: boolean){
    const [row, col] = [Math.floor(index / 8), index % 8];
    const upperCode = code.toUpperCase();
    const isBlack = flipped? upperCode == code: upperCode != code;
    switch(code.toUpperCase()){
        case "K": return kingMoves(isBlack, row, col, board, flipped);
        case "Q": return queenMoves(isBlack, row, col, board, flipped);
        case "R": return rookMoves(isBlack, row, col, board, flipped);
        case "B": return bishopMoves(isBlack, row, col, board, flipped);
        case "N": return knightMoves(isBlack, row, col, board, flipped);
        case "P": return pawnMoves(isBlack, row, col, board, flipped);
        default: return [];
    }
}

/**
 * @param index Once dimensional index (0 to 63).
 * @return 2 character representation in standard chess notation, of char (a to h) followed by digit (1 to 8).
 */
export function algebraicNotation(index: number){
    if(index < 0 || index > 63) return "N/A";
    const [row, col] = [Math.floor(index / 8),  index % 8];
    return "abcdefgh"[col]+(row+1);
}

function openAdjacent(irBlack: boolean, from: number, board: string[]){
    if(from < 0 || from > 63) return [];
    const result: number[] = [];
    const [row, col] = [Math.floor(from / 8), from % 8];
    function valid(tile: string){
        if(tile == EMPTY) return true;
        const pieceIsBlack = tile.toLowerCase() == tile;
        return pieceIsBlack != irBlack;
    }
    if(row > 0){ // scan above
        if(col > 0 && valid(board[from-7])) result.push(from-7);
        if(valid(board[from-8])) result.push(from-8);
        if(col < 7 && valid(board[from-9])) result.push(from-9);  
    }    
    if(col > 0 && valid(board[from-1])) result.push(from-1);
    if(col < 7 && valid(board[from+1])) result.push(from+1);
    if(row < 7){ // scan below
        if(col > 0 && valid(board[from+7])) result.push(from+7);
        if(valid(board[from+8])) result.push(from+8);
        if(col < 7 && valid(board[from+9])) result.push(from+9);  
    }   
    return result;
}

function pieceThatCanTake(irBlack: boolean, board: string[], flipped: boolean, positionIndex: number){
    return board.findIndex((piece, i) => {
        if(piece == EMPTY) return false;          // no piece at tile
        const pieceIsBlack = piece.toUpperCase() != piece;
        if(pieceIsBlack == irBlack) return false; // not opponent's
        const pieceMoves = _validIndices(piece, i, board, flipped);
        return pieceMoves.includes(positionIndex);
    });
}

function allPiecesThatCanTake(irBlack: boolean, board: string[], flipped: boolean, positionIndex: number){
    return board.reduce((attackers: number[], piece, i) => {
        if (piece === EMPTY) return attackers;          // no piece at tile
        const pieceIsBlack = piece.toUpperCase() != piece;
        if (pieceIsBlack === irBlack) return attackers; // not opponent's
        // for pawns do I have to flip flipped
        const moves = _validIndices(piece, i, board, flipped);
        if (moves.includes(positionIndex)) {
            attackers.push(i);
        }
        return attackers;
    }, []);
}

/** 
 * @param irBlack whether of not the player to test for check is black; false is white.
 * @param board 64 element array containing board tile state.
 * @param flipped true if teh board is flipped upside down (from black player's perspective).
 * @return 0 not in check, 1 check, 2 checkmate.
 */
export function isInCheck(irBlack: boolean, board: string[], flipped: boolean) {
    const kingIndex = board.indexOf(irBlack?  "k": "K");
    if(kingIndex == -1) throw Error("In Check Error: No King on the board.");
    const checkFrom = pieceThatCanTake(irBlack, board, flipped, kingIndex);
    if(checkFrom == -1) return 0;                           // not in check
    // finding all pieces that can remove the piece causing check
    const checkRemovedBy = allPiecesThatCanTake(!irBlack, board, flipped, checkFrom); 
    const canTakePieceToRemoveCheck = checkRemovedBy.some((removedByIndex: number) => {
        // need to test for double check here, or if the king captures, that he is not moving into check.
        const newBoard = [...board];
        newBoard[removedByIndex] = " ";
        newBoard[checkFrom] = board[removedByIndex];
        const newCheckFrom = pieceThatCanTake(irBlack, newBoard, flipped, kingIndex);
        return newCheckFrom == -1;
    });
    if(canTakePieceToRemoveCheck) return 1; 
    // no piece can effectively capture the opponent's piece causing the check, so look if we can move our king
    const adjacentTiles = openAdjacent(irBlack, kingIndex, board);
    if(adjacentTiles.length == 0) return 2;                    // in check with no adjacent free tiles.   
    const checkFromIndices = adjacentTiles.map(pieceThatCanTake.bind(null, irBlack, board, flipped));
    if(checkFromIndices.includes(-1)) return 1;                // in check but there's an escape tile 
    return 2;                                                   
}
