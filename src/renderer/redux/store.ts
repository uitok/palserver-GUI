// redux
import { combineReducers, legacy_createStore as createStore } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { selectedServerInstance } from './selectedServerInstance/selectedServerInstance.reducer';
import { isRunningServers } from './isRunningServers/isRunningServers.reducer';

// reducers
const reducer = combineReducers({
  selectedServerInstance,
  isRunningServers,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: [] as string[],
};

const persistedReducer = persistReducer(persistConfig, reducer);

const store = createStore(persistedReducer);

export type RootState = ReturnType<typeof store.getState>;

const persistor = persistStore(store);

export { store, persistor };
