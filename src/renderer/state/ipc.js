import React from 'react';
import { useEffect, useContext } from 'react';
import { store } from '../utils/store';
import { debounce } from '../utils/misc';
const { ipcRenderer } = window.require('electron');

const IpcContext = React.createContext();

export const useIpc = () => useContext(IpcContext);

export const IpcProvider = ({ children }) => {
  const { _state, dispatch } = useContext(store);
  useEffect(() => {
    const handleIpcMessage = (event, arg) => {
      // Handle the IPC message — set path so MiniPlayerView can load and play the file
      dispatch({ type: 'SET_PATH', payload: arg });
      // console.log('arg', arg, event);
    };

    ipcRenderer.on('play-mini', handleIpcMessage);
    return () => {
      // Clean up IPC event listeners
      ipcRenderer.removeAllListeners('play-mini');
    };
  }, []);
  useEffect(() => {
    const handleExpandMessage = debounce((event, arg) => {
      dispatch({ type: 'SET_IS_MAXIMIZED', payload: arg });
      console.log('arg', arg, event);
    }, 200);

    // IPC event listeners
    ipcRenderer.on('expand-state', handleExpandMessage);

    return () => {
      // Clean up IPC event listeners
      ipcRenderer.removeAllListeners('expand-state');
    };
  });

  const sendEventToMainProcess = (event, payload) => {
    ipcRenderer.send(event, payload);
  };

  const invokeEventToMainProcess = (event, payload) => {
    return ipcRenderer.invoke(event, payload);
  };

  return (
    <IpcContext.Provider value={{ sendEventToMainProcess, invokeEventToMainProcess }}>
      {children}
    </IpcContext.Provider>
  );
};
