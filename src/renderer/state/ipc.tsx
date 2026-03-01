import React, { useEffect, useContext, createContext, ReactNode } from 'react';
import { store } from '../utils/store';
import { debounce } from '../utils/misc';

const { ipcRenderer } = window.require('electron');

interface IpcContextValue {
  sendEventToMainProcess: (event: string, payload: unknown) => void;
  invokeEventToMainProcess: (event: string, payload: unknown) => Promise<unknown>;
}

const IpcContext = createContext<IpcContextValue | undefined>(undefined);

export const useIpc = (): IpcContextValue => {
  const ctx = useContext(IpcContext);
  if (!ctx) throw new Error('useIpc must be used within IpcProvider');
  return ctx;
};

interface IpcProviderProps {
  children: ReactNode;
}

export const IpcProvider = ({ children }: IpcProviderProps) => {
  const { dispatch } = useContext(store);

  useEffect(() => {
    const handleIpcMessage = (_event: Electron.IpcRendererEvent, arg: string) => {
      dispatch({ type: 'SET_PATH', payload: arg });
    };

    ipcRenderer.on('play-mini', handleIpcMessage);
    return () => {
      ipcRenderer.removeAllListeners('play-mini');
    };
  }, []);

  useEffect(() => {
    const handleExpandMessage = debounce((_event: Electron.IpcRendererEvent, arg: boolean) => {
      dispatch({ type: 'SET_IS_MAXIMIZED', payload: arg });
      console.log('arg', arg, _event);
    }, 200);

    ipcRenderer.on('expand-state', handleExpandMessage);
    return () => {
      ipcRenderer.removeAllListeners('expand-state');
    };
  });

  const sendEventToMainProcess = (event: string, payload: unknown): void => {
    ipcRenderer.send(event, payload);
  };

  const invokeEventToMainProcess = (event: string, payload: unknown): Promise<unknown> => {
    return ipcRenderer.invoke(event, payload);
  };

  return (
    <IpcContext.Provider value={{ sendEventToMainProcess, invokeEventToMainProcess }}>
      {children}
    </IpcContext.Provider>
  );
};
