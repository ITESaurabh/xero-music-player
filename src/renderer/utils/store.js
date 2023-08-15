import React, { createContext, useReducer } from 'react';
import { setTheme } from './LocStoreUtil';

const initialState = {
  isLightTheme: true,
  path: null,
  isPlaying: false,
  position: 0,
};
const store = createContext(initialState);
const { Provider } = store;

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'SET_THEME': {
        setTheme(action.payload);
        return {
          ...state,
          isLightTheme: action.payload,
        };
      }
      case 'SET_CURR_TRACK': {
        // console.log('STATEINGr');
        return {
          ...initialState,
          path: action.payload.path,
          // isLightTheme: action.payload,
        };
      }
      case 'SET_IS_PLAYING': {
        // console.log('STATEINGr');
        return {
          ...state,
          isPlaying: action.payload,
          // isLightTheme: action.payload,
        };
      }
      case 'SET_PROGRESS': {
        // console.log('STATEINGr');
        return {
          ...state,
          position: action.payload,
          // isLightTheme: action.payload,
        };
      }
      case 'CHANGE_TRACK': {
        // console.log('STATEINGr');
        return {
          ...initialState,
          // isLightTheme: action.payload,
        };
      }
      default:
        return state;
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
