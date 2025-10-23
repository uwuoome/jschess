import {vi, expect, test, describe, beforeEach } from 'vitest'
import {parseAlgebraic as alg, validIndices, getCheckState} from '@/lib/chess-logic.ts'
import { configureStore } from '@reduxjs/toolkit';
import chessReducer, {initGame, selectPiece, movePiece, nextTurn} from '@/store/chessSlice.js';

const initialBoard = () => [
  "r", "n", "b", "q", "k", "b", "n", "r",
  "p", "p", "p", "p", "p", "p", "p", "p",
  " ", " ", " ", " ", " ", " ", " ", " ",
  " ", " ", " ", " ", " ", " ", " ", " ",
  " ", " ", " ", " ", " ", " ", " ", " ",
  " ", " ", " ", " ", " ", " ", " ", " ",
  "P", "P", "P", "P", "P", "P", "P", "P",
  "R", "N", "B", "Q", "K", "B", "N", "R",
];
const blankBoard = () => Array(64).fill(" ");

describe('Pawn', () => {
    let store;
    beforeEach(() => {
        store = configureStore({reducer: {chess: chessReducer}});
    });

    test('Double Start', () => {
        const moves = validIndices(51, initialBoard(), false, 3);
        expect(moves).toEqual([43, 35]);
    });
    test('Capture by White', () => {
        const board = blankBoard();
        board[alg("e5")] = "P";
        board[alg("d4")] = "p";
        const moves = validIndices(alg("e5"), board, true, 3);
        expect(moves).toEqual([alg("e4"), alg("d4")]);
    });
    test.todo('Capture by Black');
    test('Promotion White', () => {
        const board = blankBoard();
        board[alg("b7")] = "P";
        board[alg("c8")] = "p";
        store.dispatch(initGame({board}));
        store.dispatch(selectPiece(alg("b7")));
        store.dispatch(movePiece(alg("c8")));
        const result = store.getState().chess.board[alg("c8")];
        expect(result).toBe("Q");
    });
    test('Promotion Black', () => {
        const board = blankBoard();
        board[alg("d2")] = "p";
        store.dispatch(initGame({board}));
        store.dispatch(nextTurn({elapsed: 0}));
        store.dispatch(selectPiece(alg("d2")));
        store.dispatch(movePiece(alg("d1")));
        const result = store.getState().chess.board[alg("d1")];
        expect(result).toBe("q");
    });
});

describe('Knight', () => {
    test('From Center', () => {
        // find all moves except d2 and g5 which contains friendly pawns
        const board = blankBoard();
        board[alg("e4")] = "N";
        board[alg("d2")] = "P";
        board[alg("f6")] = "p";
        board[alg("g5")] = "P";
        const moves = validIndices(alg("e4"), board, false, 3).sort();
        const expected = [alg("f2"), alg("g3"), alg("f6"), alg("d6"), alg("c5"), alg("c3")].sort();
        expect(moves).toEqual(expected);
    });

    test('From Corner', () => {
        const board = blankBoard();
        board[alg("a1")] = "N";
        const moves = validIndices(alg("a1"), board, false, 3).sort();
        expect(moves).toEqual([alg("c2"), alg("b3")].sort());
    });

    test('Capture', () => {
        const store = configureStore({reducer: {chess: chessReducer}});
        const board = blankBoard();
        board[alg("e4")] = "N";
        board[alg("e3")] = "P";
        board[alg("c3")] = "p";
        store.dispatch(initGame({board}));
        store.dispatch(selectPiece(alg("e4")));
        store.dispatch(movePiece(alg("c3")));  
        const result = store.getState().chess.board;
        expect(result[alg("e4")]).toBe(" ");
        expect(result[alg("e3")]).toBe("P");
        expect(result[alg("c3")]).toBe("N");
    });
});

describe('Bishop', () => {
    test('From Center', () => {
        const board = blankBoard();
        board[alg("e4")] = "B";
        board[alg("d3")] = "R";
        board[alg("f5")] = "p";
        board[alg("c3")] = "R";
        const moves = validIndices(alg("e4"), board, false, 3).sort();
        const expected = ["d5", "c6", "b7", "a8", "f5", "f3", "g2", "h1"].map(alg).sort();
        expect(moves).toEqual(expected);
    });

    test('From Corner', () => {
        const board = blankBoard();
        board[alg("h8")] = "B";
        const moves = validIndices(alg("h8"), board, false, 3).sort();
        const expected = ["g7", "f6", "e5", "d4", "c3", "b2", "a1"].map(alg).sort();  
        expect(moves).toEqual(expected);      
    });

    test('Capture', () => {
        const store = configureStore({reducer: {chess: chessReducer}});
        const board = blankBoard();
        board[alg("c4")] = "B";
        board[alg("g8")] = "p";
        store.dispatch(initGame({board}));
        store.dispatch(selectPiece(alg("c4")));
        store.dispatch(movePiece(alg("g8")));  
        const result = store.getState().chess.board;
        expect(result[alg("c4")]).toBe(" ");
        expect(result[alg("g8")]).toBe("B");
    });
});


describe('Rook Moves', () => {
    test('From Center', () => {
        const board = blankBoard();
        board[alg("d3")] = "R";
        board[alg("d4")] = "B";
        board[alg("g3")] = "p";
        const moves = validIndices(alg("d3"), board, false, 3).sort();
        const expected = ["d1", "d2", "a3", "b3", "c3", "e3", "f3", "g3"].map(alg).sort();
        expect(moves).toEqual(expected);
    });
    test('From Corner', () => {
        const board = blankBoard();
        board[alg("a8")] = "R";
        board[alg("d8")] = "K";
        const moves = validIndices(alg("a8"), board, false, 3).sort();
        const expected = ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "b8", "c8"].map(alg).sort();  
        expect(moves).toEqual(expected);    
    });
});


describe('Queen Moves', () => {
    test('From Center', () => {
        const board = blankBoard();
        board[alg("e4")] = "Q";
        board[alg("d4")] = "P";
        board[alg("b2")] = "R";
        board[alg("e7")] = "p";
        board[alg("g6")] = "P";
        const moves = validIndices(alg("e4"), board, false, 0).sort();
        const expected = [
            "d3", "c2", "b1", "e5", "e6", "e7", "d5", "c6", "b7", "a8",
            "f3", "g2", "h1", "f5", "e3", "e2", "e1", "f4", "g4", "h4"
        ].map(alg).sort();
        expect(moves).toEqual(expected);
    });
    test('From Corner', () => {
        const board = blankBoard();
        board[alg("h8")] = "Q";
        board[alg("h6")] = "K";
        board[alg("f6")] = "p";
        const moves = validIndices(alg("h8"), board, false, 3).sort();
        const expected = ["h7", "g7", "f6", "g8", "f8", "e8", "d8", "c8", "b8", "a8"].map(alg).sort();  
        expect(moves).toEqual(expected);    
    });
});


describe('Check', () => {
    //getCheckState(irBlack: boolean, board: string[], flipped: boolean, movesAvailable: boolean | null = null)
    test('Cannot Expose King', () => {
        // tests player cannot move piece to expose check
        const board = blankBoard();
        board[alg("e4")] = "K";
        board[alg("d5")] = "R";
        board[alg("b7")] = "b";
        board[alg("d1")] = "q";
        board[alg("c1")] = "k";
        const rookMoves = validIndices(alg("d5"), board, false, 0);
        expect(rookMoves.length).toBe(0); 
        const kingMoves = validIndices(alg("e4"), board, false, 0).sort();
        const expected = [alg("e3"), alg("f4"), alg("f5"), alg("e5")].sort();
        expect(kingMoves).toEqual(expected);
    });

    test('Can Obstruct Check', () => {
        // tests that a piece can be placed infront of a checking piece to remove check
        const board = blankBoard();
        board[alg("e4")] = "K";
        board[alg("d6")] = "R";
        board[alg("b7")] = "b";
        board[alg("d1")] = "q";
        board[alg("c1")] = "k";
        const rookMoves = validIndices(alg("d6"), board, false, 0).sort();
        const expected = [alg("d5"), alg("c6")].sort();
        expect(rookMoves).toEqual(expected); 
    });

    test('Remove Offender', () => {    

    });

    test('Double Check', () => {
        const store = configureStore({reducer: {chess: chessReducer}});
        const board = blankBoard();
        board[alg("h8")] = "k";
        board[alg("f7")] = "p";
        board[alg("g7")] = "p";
        board[alg("h4")] = "N";
        board[alg("h3")] = "R";
        board[alg("f8")] = "q";
        board[alg("e6")] = "b";
        store.dispatch(initGame({board}));
        store.dispatch(selectPiece(alg("h4")));
        store.dispatch(movePiece(alg("g6")));  
        store.dispatch(nextTurn({elapsed: 0}));
        // white has has just placed black into double check
        const nextBoard = store.getState().chess.board;
        // can't move pawn to take knight because rook checks king
        const pawnMoves = validIndices(alg("f7"), nextBoard, false, 0);
        expect(pawnMoves.length).toBe(0);
        // can't move bishop to take rook because knight checks king
        const bishopMoves = validIndices(alg("e6"), nextBoard, false, 0);
        expect(bishopMoves.length).toBe(0); 
    });

    test('Checkmate', () => {
        const board = blankBoard();
        board[alg("f2")] = "Q";
        board[alg("h2")] = "R";
        board[alg("h1")] = "k";
        const kingMoves = validIndices(alg("h1"), board, false, 0);
        expect(kingMoves.length).toBe(0);
        expect(getCheckState(true, board, false)).toBe(2);
    });

    test('Stalemate', () => {
        const board = blankBoard();
        board[alg("f2")] = "Q";
        board[alg("h1")] = "k";
        const kingMoves = validIndices(alg("h1"), board, false, 0);
        expect(kingMoves.length).toBe(0);
        expect(getCheckState(true, board, false)).toBe(3);
    });
});


describe('Castling', () => {
    test.todo('Already Moved');
    test.todo('Through Obstruction');
    test.todo('Through Check Left');
    test.todo('Through Check Right');
    test.todo('In Check');
    test.todo('Clear Left');
    test.todo('Clear Right');
});
