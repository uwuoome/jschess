
import { configureStore } from '@reduxjs/toolkit';
import friendsReducer from './settingsSlice';
import chessReducer from './chessSlice';

export const store = configureStore({
  reducer: {
    friends: friendsReducer,
    chess: chessReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;