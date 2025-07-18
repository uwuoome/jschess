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

function project(irBlack: boolean, row: number, col: number, board: string[], flipped: boolean, dr: number, dc: number) {
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
        return (!moveIntoCheck(rowTo, colTo)) && (!myPiece(irBlack, rowTo, colTo, board, flipped));
    }
    function moveIntoCheck(rowTo: number, colTo: number){
        return false; // TODO: implement
    }
    const result = [];
    console.log(row, col);
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