

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
    if(action.type == 'game/nextTurn'){
        const state = store.getState();
        localStorage.setItem(`chess_state_${state.chess.mode}`, JSON.stringify(state.chess));
    }else if(action.type == 'game/endGame'){
        const state = store.getState();
        localStorage.removeItem(`chess_state_${state.chess.mode}`);
    }
    return result;
}   

export {chessStorageMiddleware}