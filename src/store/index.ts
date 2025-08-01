
import { configureStore} from '@reduxjs/toolkit';
import friendsReducer from './settingsSlice';
import chessReducer from './chessSlice';
import { chessStorageMiddleware } from '@/middleware/persistence';

export const store = configureStore({
  reducer: {
    friends: friendsReducer,
    chess: chessReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(chessStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;