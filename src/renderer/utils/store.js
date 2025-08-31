import React, { createContext, useReducer } from 'react';
import { setTheme } from './LocStoreUtil';

const initialState = {
  isLightTheme: false,
  isMaximized: false,
  isMenuExpanded: false,
  path: null,
  track: null,
  isPlaying: false,
  position: 0,
  queue: [],
  queueIndex: 0,
  isLoop: false,
  isShuffle: false,
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
          ...state,
          track: action.payload,
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
      case 'SET_QUEUE': {
        return {
          ...state,
          queue: action.payload.queue,
          queueIndex: action.payload.index || 0,
        };
      }
      case 'NEXT_TRACK': {
        let nextIndex = state.queueIndex + 1;
        if (state.isLoop && nextIndex >= state.queue.length) nextIndex = 0;
        if (nextIndex < state.queue.length) {
          return {
            ...state,
            queueIndex: nextIndex,
            track: state.queue[nextIndex],
            isPlaying: true,
          };
        }
        return state;
      }
      case 'PREV_TRACK': {
        let prevIndex = state.queueIndex - 1;
        if (state.isLoop && prevIndex < 0) prevIndex = state.queue.length - 1;
        if (prevIndex >= 0) {
          return {
            ...state,
            queueIndex: prevIndex,
            track: state.queue[prevIndex],
            isPlaying: true,
          };
        }
        return state;
      }
      case 'SET_LOOP': {
        return {
          ...state,
          isLoop: action.payload,
        };
      }
      case 'SET_SHUFFLE': {
        let shuffledQueue = [...state.queue];
        if (action.payload) {
          for (let i = shuffledQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledQueue[i], shuffledQueue[j]] = [shuffledQueue[j], shuffledQueue[i]];
          }
        } else {
          shuffledQueue = state.queue.sort((a, b) => a.Id - b.Id);
        }
        return {
          ...state,
          isShuffle: action.payload,
          queue: shuffledQueue,
          queueIndex: 0,
          track: shuffledQueue[0],
        };
      }
      default:
        return state;
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
