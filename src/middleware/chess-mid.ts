import { AiWorker } from "@/components/chess";
import type { TimerType } from "@/components/chess-timer";
import { nextTurn, opponentMove, setAIProgress } from "@/store/chessSlice";

export function saveKey(mode: string, aiWasm: boolean){
    if(mode == "ai" && aiWasm){
        return `chess_state_${mode}_wasm`;
    }
    return `chess_state_${mode}`;
}

const chessStorageMiddleware = (store: any) => (next: any) => (action: any) => {
    
    if(action.type == 'game/initGame'){
        const mode = action.payload?.mode;
        const wasm = action.payload?.aiWasm;
        if(! mode) throw new Error("Game mode required to initialise Chess");
        const gameInProgress = localStorage.getItem(saveKey(mode, wasm));
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
        localStorage.setItem(saveKey(state.chess.mode, state.chess.aiWasm), JSON.stringify(state.chess));
    }else if(action.type == 'game/saveChessTimer'){ 
    //      // problem when calling on beforeunload when moving between wasm and non wasm ai
        //localStorage.setItem(saveKey(state.chess.mode, aiWasm), JSON.stringify(state.chess));
    }else if(action.type == 'game/endGame'){
        // TODO: save result of match?
        localStorage.removeItem(saveKey(state.chess.mode, state.chess.aiWasm));
    }
    return result;
}   

const chessAIMiddleware = (store: any) => (next: any) => (action: any) => {
    if(action.type == 'game/endGame'){
        AiWorker.postMessage({ action: "stop" });
        return next(action);
    }
    
    const result = next(action);
    const state = store.getState();
    
    function getSearchDepth(aiLevel: number, timerMode: TimerType){
        aiLevel ||= 1;
        if(timerMode == "standard" || timerMode == "none"){
            return aiLevel * 2;
        }
        return aiLevel;
    }

    const aiStarts = action.type == 'game/initGame' &&  state.chess.activePlayer == 1;
    if(action.type == 'game/nextTurn' || aiStarts){
        if(state.chess.mode == "ai" && state.chess.activePlayer == 1){
            const chessState = store.getState().chess;
            const searchDepth = getSearchDepth(chessState.aiLevel, chessState.timer);
            const start = Date.now();
            store.dispatch(setAIProgress(0));
            AiWorker.onmessage = (e) => {
                if(e.data.progress){
                    store.dispatch(setAIProgress(e.data.progress));
                    return;
                }else if(e.data.error){
                    console.error(e.data.error);
                    return;
                }
                const aiMove = e.data.move;
                const seconds = ((Date.now() - start) / 1000).toFixed(3);
                const aiType = state.chess.aiWasm? "wasm": "js";
                console.log(`${seconds} seconds to find move at search depth ${searchDepth} with ${aiType} minmax ai.`);
                store.dispatch(opponentMove(aiMove));
                store.dispatch(nextTurn({elapsed: null}));
            };
            AiWorker.onerror = (err) => {
                console.error("AI worker failed:", err);
            };
            AiWorker.postMessage({action: "search", wasm: state.chess.aiWasm, board: state.chess.board, depth: searchDepth });
        }
    }
    return result;
}



export {chessStorageMiddleware, chessAIMiddleware}