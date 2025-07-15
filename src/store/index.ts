
import { configureStore } from '@reduxjs/toolkit';
import friendsReducer from './friendsSlice';
import gameReducer from './gameSlice';

export const store = configureStore({
  reducer: {
    friends: friendsReducer,
    game: gameReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;