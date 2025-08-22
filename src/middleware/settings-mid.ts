
import { setMyID, setPreferredGame, addFriend, removeFriend, type SettingsState } from "@/store/settingsSlice";

function saveFriendList(state: SettingsState) {
    try {
        const serialized = JSON.stringify(state);
        localStorage.setItem( 'friendsList', serialized);
    } catch (e) {
        console.warn('Could not save state', e);
    }
}

const settingsMiddleware = (store: any) => (next: any) => (action: any) => {
    const result = next(action);
    const state = store.getState();    
    const onSaveActions = [setMyID.type, setPreferredGame.type, addFriend.type, removeFriend.type];
    if(onSaveActions.includes(action.type)){ 
        saveFriendList(state.friends);
    }
    return result;
}

export {settingsMiddleware};