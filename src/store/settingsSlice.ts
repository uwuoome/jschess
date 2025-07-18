import { createSlice } from '@reduxjs/toolkit';


export type FriendData = {name: string, email: string}
type SettingsState = {
    myid: string;
    game: string;
    list: FriendData[];
};
const initialState: SettingsState = {
    myid: "",
    game: "chess",
    list: [],
};

const SAVE_SLOT = 'friendsList';
function saveFriendList(state: SettingsState) {
    try {
        const serialized = JSON.stringify(state);
        localStorage.setItem(SAVE_SLOT, serialized);
    } catch (e) {
        console.warn('Could not save state', e);
    }
}
function loadFriendList() {
    if(localStorage.getItem(SAVE_SLOT) == null) return initialState;
    try {
        const serialized = localStorage.getItem(SAVE_SLOT);
        if (serialized === null) return initialState;
        return JSON.parse(serialized);
    } catch (e) {
        console.warn('Could not load state', e);
        return initialState;
    }
}

const settingsSlice = createSlice({
  name: 'friends',
  initialState: loadFriendList(),
  reducers: {
    setMyID: (state, action) => {
        state.myid = action.payload;
        saveFriendList(state);
    },
    setPreferredGame: (state, action) => {
        state.game = action.payload;
        saveFriendList(state);
    },
    addFriend: (state, action) => { 
        state.list = [...state.list, action.payload];
        saveFriendList(state);
    },
    removeFriend: (state, action) => { 
        state.list = state.list.filter((x: FriendData)  => x.email != action.payload); 
        saveFriendList(state);
    }
  }
});

export const { setMyID, setPreferredGame, addFriend, removeFriend } = settingsSlice.actions;
export default settingsSlice.reducer;