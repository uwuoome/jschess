import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export type FriendData = {name: string, handle: string}
export type SettingsState = {
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

export const loadSettings = createAsyncThunk(
    'settings/loadInitialState',
    async () => {
        try {
            const serialized = localStorage.getItem('friendsList');
            if (serialized == null) return initialState;
            return JSON.parse(serialized);
        } catch (e) {
            console.warn('Could not load state', e);
            return initialState;
        }
    }
);

// TODO: move state saving from store to middleware
const settingsSlice = createSlice({
    name: 'friends',
    initialState,
    reducers: {
        setMyID: (state, action) => {
            if(action.payload == null){ /// delete id
                state.myid = "";
                state.mytoken = "";
                return;
            }
            if(! (action.payload.id && action.payload.token)){
                return;
            }
            state.myid = action.payload.id;
            state.mytoken = action.payload.token;
        },
        setPreferredGame: (state, action) => {
            state.game = action.payload;
        },
        addFriend: (state, action) => { 
            const name = action.payload.name?.trim();
            const handle = action.payload.handle?.trim();
            if(! (name && handle)) throw Error("Friend added requires both name and email set");
            state.list = [...state.list, {name, handle}];
        },
        removeFriend: (state, action) => { 
            const target = action.payload.toLowerCase();
            state.list = state.list.filter((x: FriendData)  => x.handle != target); 
        }
    },
    extraReducers: (builder) => {
        // When the 'loadSettings' thunk successfully completes
        // the payload from the thunk is passed to this reducer, so return the new state.
        builder.addCase(loadSettings.fulfilled, (_state, action) => {
            return action.payload;
        });
        builder.addCase(loadSettings.rejected, (_state, _action) => {
            console.error("Failed to load settings from localStorage.");
        });
    },
});

export const { setMyID, setPreferredGame, addFriend, removeFriend } = settingsSlice.actions;
export default settingsSlice.reducer;