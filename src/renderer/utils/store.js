import React, { createContext, useReducer } from 'react';
import { setTheme } from './LocStoreUtil';

const initialState = {
  isLightTheme: false,
  isMaximized: false,
  isMenuExpanded: false,
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
      case 'SET_IS_MAXIMIZED': {
        return {
          ...state,
          isMaximized: action.payload,
        };
      }
      case 'SET_MENU_EXPANDED': {
        return {
          ...state,
          isMenuExpanded: action.payload,
        };
      }
      case 'SET_CURR_TRACK': {
        return {
          ...initialState,
          path: action.payload.path,
        };
      }
      case 'SET_IS_PLAYING': {
        return {
          ...state,
          isPlaying: action.payload,
        };
      }
      case 'SET_PROGRESS': {
        return {
          ...state,
          position: action.payload,
        };
      }
      case 'CHANGE_TRACK': {
        return {
          ...initialState,
        };
      }
      default:
        return state;
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
