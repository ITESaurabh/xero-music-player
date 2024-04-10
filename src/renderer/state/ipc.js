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
      // Handle the IPC message
      dispatch({ type: 'SET_CURR_TRACK', payload: { path: arg } });
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

  const sendMessageToMainProcess = (message, payload) => {
    ipcRenderer.send(message, payload);
  };

  return <IpcContext.Provider value={{ sendMessageToMainProcess }}>{children}</IpcContext.Provider>;
};
