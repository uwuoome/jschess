import { AiWorker } from "@/components/chess";
import { nextTurn, opponentMove } from "@/store/chessSlice";

const chessStorageMiddleware = (store: any) => (next: any) => (action: any) => {
    
    if(action.type == 'game/initGame'){
        const mode = action.payload?.mode;
        if(! mode) throw new Error("Game mode required to initialise Chess");
        const gameInProgress = localStorage.getItem(`chess_state_${mode}`);
        if(gameInProgress){    
            action.payload = typeof gameInProgress == "string"? JSON.parse(gameInProgress): gameInProgress;
            return next(action);
        }else{
            return next(action);
        }
    }

    const result = next(action);
    const state = store.getState();
    if(state.chess.mode == "network"){  // network games don't currently save state, if a player reloads the page the game ends.
        return result;
    }
    if(action.type == 'game/nextTurn'){
        localStorage.setItem(`chess_state_${state.chess.mode}`, JSON.stringify(state.chess));
    }else if(action.type == 'game/endGame'){
        localStorage.removeItem(`chess_state_${state.chess.mode}`);
    }
    return result;
}   

const chessAIMiddleware = (store: any) => (next: any) => (action: any) => {
    const searchDepth = 6;
    if(action.type == 'game/endGame'){
        AiWorker.postMessage({ stop: true });
        return next(action);
    }
    const result = next(action);
    const state = store.getState();

    const aiStarts = action.type == 'game/initGame' &&  state.chess.activePlayer == 1;
    if(action.type == 'game/nextTurn' || aiStarts){
        if(state.chess.mode == "ai" && state.chess.activePlayer == 1){
            const start = Date.now();
            AiWorker.onmessage = (e) => {
                const aiMove = e.data.move;
                const seconds = ((Date.now() - start) / 1000).toFixed(3);
                console.log(`${seconds} seconds to find move at search depth ${searchDepth} with js minmax ai.`);
                store.dispatch(opponentMove(aiMove));
                store.dispatch(nextTurn());
            };
            AiWorker.onerror = (err) => {
                console.error("AI worker failed:", err);
            };
            AiWorker.postMessage({board: state.chess.board, depth: searchDepth });
        }
    }
    return result;
}



export {chessStorageMiddleware, chessAIMiddleware}