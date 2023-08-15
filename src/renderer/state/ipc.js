import React from 'react';
import { useEffect, useContext } from 'react';
import { store } from '../utils/store';
const { ipcRenderer } = window.require('electron');

const IpcContext = React.createContext();

export const useIpc = () => useContext(IpcContext);

export const IpcProvider = ({ children }) => {
  const { state, dispatch } = useContext(store);
  useEffect(() => {
    // IPC event listeners
    const handleIpcMessage = (event, arg) => {
      // alert('REC' + JSON.stringify(state));
      // Handle the IPC message
      // console.log(state.path, typeof state.path, typeof arg);
      dispatch({ type: 'SET_CURR_TRACK', payload: { path: arg } });
      // console.log('arg', arg, event);
    };

    ipcRenderer.on('play-mini', handleIpcMessage);

    return () => {
      // Clean up IPC event listeners
      ipcRenderer.removeAllListeners('play-mini');
    };
  }, []);

  const sendMessageToMainProcess = (message, payload) => {
    ipcRenderer.send(message, payload);
  };

  return <IpcContext.Provider value={{ sendMessageToMainProcess }}>{children}</IpcContext.Provider>;
};
