import { createSlice } from '@reduxjs/toolkit';


export type FriendData = {name: string, email: string}
type SettingsState = {
    myid: string;
    mytoken: string;
    game: string;
    list: FriendData[];
};
const initialState: SettingsState = {
    myid: "",
    mytoken: "",
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

// TODO: move state saving from store to middleware
const settingsSlice = createSlice({
  name: 'friends',
  initialState: loadFriendList(),
  reducers: {
    setMyID: (state, action) => {
        if(action.payload == null){ /// delete id
            state.myid = "";
            state.token = "";
            saveFriendList(state);
            return;
        }
        if(! (action.payload.id && action.payload.token)){
            return;
        }
        state.myid = action.payload.id;
        state.mytoken = action.payload.token;
        saveFriendList(state); 
    },
    setPreferredGame: (state, action) => {
        state.game = action.payload;
        saveFriendList(state);
    },
    addFriend: (state, action) => { 
        const name = action.payload.name?.trim();
        const email = action.payload.email?.trim().toLowerCase();
        if(! (name && email)) throw Error("Friend added requires both name and email set");

        state.list = [...state.list, {name, email}];
        saveFriendList(state);
    },
    removeFriend: (state, action) => { 
        const target = action.payload.toLowerCase();
        state.list = state.list.filter((x: FriendData)  => x.email != target); 
        saveFriendList(state);
    }
  }
});

export const { setMyID, setPreferredGame, addFriend, removeFriend } = settingsSlice.actions;
export default settingsSlice.reducer;