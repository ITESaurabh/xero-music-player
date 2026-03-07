const { ipcRenderer } = window.require('electron');

export function sendMessageToNode(message: string, payload: unknown): void {
  ipcRenderer.send(message, payload);
}
