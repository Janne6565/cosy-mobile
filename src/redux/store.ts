import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import instanceReducer from './slices/instanceSlice';
import serverReducer from './slices/serverSlice';

const instancePersistConfig = {
  key: 'cosy-instances',
  storage: AsyncStorage,
  whitelist: ['instances', 'activeInstanceId'],
};

const persistedInstanceReducer = persistReducer(instancePersistConfig, instanceReducer);

export const store = configureStore({
  reducer: {
    instance: persistedInstanceReducer,
    server: serverReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store, null, () => {
  store.dispatch({ type: 'instance/setHasHydrated', payload: true });
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
