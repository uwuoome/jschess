
import { 
    setMyID, 
    setPreferredGame, 
    setAiDifficulty, 
    addFriend, 
    removeFriend, 
    setPreferredStyle, 
    type SettingsState 
} from "@/store/settingsSlice";

function saveProfile(state: SettingsState) {
    try {
        const serialized = JSON.stringify(state);
        localStorage.setItem('profile', serialized);
    } catch (e) {
        console.warn('Could not save state', e);
    }
}

const settingsMiddleware = (store: any) => (next: any) => (action: any) => {
    const result = next(action);
    const state = store.getState();    
    const onSaveActions = [
        setMyID.type, 
        setPreferredGame.type, 
        setAiDifficulty.type, 
        addFriend.type, 
        removeFriend.type, 
        setPreferredStyle.type];
    if(onSaveActions.includes(action.type)){ 
        saveProfile(state.profile);
    }
    return result;
}

export {settingsMiddleware};