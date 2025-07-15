import { createSlice } from "@reduxjs/toolkit";

type GamePlayers = [string | null, string | null];
type GameState = {
    status: string;
    players: GamePlayers;
}

const initialState: GameState = {
    status: "none",
    players: [null, null],
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    joinGame: (state, action) => {

    }
  }
});

export const { joinGame } = gameSlice.actions;
export default gameSlice.reducer;