
import { configureStore} from '@reduxjs/toolkit';
import friendsReducer, { loadSettings } from './settingsSlice';
import chessReducer from './chessSlice';
import { settingsMiddleware } from '@/middleware/settings-mid';
import { chessAIMiddleware, chessStorageMiddleware } from '@/middleware/chess-mid';



export const store = configureStore({
  reducer: {
    friends: friendsReducer,
    chess: chessReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(
    settingsMiddleware,
    chessStorageMiddleware, 
    chessAIMiddleware, 
  )
});
store.dispatch(loadSettings());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;