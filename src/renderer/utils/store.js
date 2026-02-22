import React, { createContext, useReducer } from 'react';
import { setTheme, setQueueState, getQueueState } from './LocStoreUtil';

const initialState = (() => {
  const saved = getQueueState();
  return {
    isLightTheme: true,
    isMaximized: false,
    isMenuExpanded: true,
    path: null,
    track: saved?.track || null,
    isPlaying: false,
    position: 0,
    searchEnabled: false,
    queue: saved?.queue || [],
    queueIndex: saved?.queueIndex || 0,
    originalQueue: saved?.queue || [], // Store original queue order
    repeatMode: 'off', // 'off', 'all', 'one'
    isShuffle: false,
    isPlayerBarVisible: true,
  };
})();
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
      case 'SET_SEARCH_ENABLED': {
        return {
          ...state,
          searchEnabled: action.payload,
        };
      }
      case 'SET_MENU_EXPANDED': {
        return {
          ...state,
          isMenuExpanded: action.payload,
        };
      }
      case 'SET_QUEUE': {
        setQueueState(action.payload.queue, action.payload.index || 0, state.track);
        return {
          ...state,
          queue: action.payload.queue,
          queueIndex: action.payload.index || 0,
          originalQueue: action.payload.queue, // Store original queue
        };
      }
      case 'SET_PATH': {
        return {
          ...state,
          path: action.payload,
        };
      }
      case 'SET_CURR_TRACK': {
        setQueueState(state.queue, state.queueIndex, action.payload);
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
      case 'NEXT_TRACK': {
        let nextIndex = state.queueIndex + 1;
        if (state.repeatMode === 'all' && nextIndex >= state.queue.length) nextIndex = 0;
        if (nextIndex < state.queue.length) {
          setQueueState(state.queue, nextIndex, state.queue[nextIndex]);
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
        if (state.repeatMode === 'all' && prevIndex < 0) prevIndex = state.queue.length - 1;
        if (prevIndex >= 0) {
          setQueueState(state.queue, prevIndex, state.queue[prevIndex]);
          return {
            ...state,
            queueIndex: prevIndex,
            track: state.queue[prevIndex],
            isPlaying: true,
          };
        }
        return state;
      }
      case 'SET_REPEAT_MODE': {
        return {
          ...state,
          repeatMode: action.payload,
        };
      }
      case 'SET_PLAYER_BAR_VISIBLE': {
        return {
          ...state,
          isPlayerBarVisible: action.payload,
        };
      }
      case 'SET_SHUFFLE': {
        if (action.payload) {
          // Turning shuffle ON
          const currentTrack = state.track;
          const currentQueue = state.isShuffle ? state.queue : [...state.queue];
          
          // Remove current track from queue
          const otherTracks = currentQueue.filter(track => track.Id !== currentTrack?.Id);
          
          // Shuffle the other tracks
          for (let i = otherTracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [otherTracks[i], otherTracks[j]] = [otherTracks[j], otherTracks[i]];
          }
          
          // Put current track at the beginning
          const shuffledQueue = currentTrack ? [currentTrack, ...otherTracks] : otherTracks;
          
          return {
            ...state,
            isShuffle: true,
            queue: shuffledQueue,
            queueIndex: 0,
          };
        } else {
          // Turning shuffle OFF - restore original queue
          const currentTrack = state.track;
          const originalQueue = [...state.originalQueue];
          
          // Find the current track's position in the original queue
          const originalIndex = currentTrack 
            ? originalQueue.findIndex(track => track.Id === currentTrack.Id)
            : 0;
          
          return {
            ...state,
            isShuffle: false,
            queue: originalQueue,
            queueIndex: originalIndex >= 0 ? originalIndex : 0,
          };
        }
      }
      default:
        return state;
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
