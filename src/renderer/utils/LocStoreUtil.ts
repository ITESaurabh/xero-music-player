export interface QueueState {
  queue: unknown[];
  queueIndex: number;
  track: unknown;
}

export function resetApp(): void {
  localStorage.clear();
}

export function setTheme(isLightTheme: boolean): boolean {
  localStorage.setItem('theme_preference', String(isLightTheme));
  return isLightTheme === true;
}

export function setVolumeLevel(val: number): void {
  localStorage.setItem('volume_level', String(val));
}

export function getTheme(): boolean | null {
  const isLightTheme = localStorage.getItem('theme_preference');
  if (isLightTheme === 'true') {
    return true;
  }
  if (isLightTheme === 'false') {
    return false;
  }
  return null;
}

export function getVolumeLevel(): number {
  const val = localStorage.getItem('volume_level');
  if (val) {
    return Number(val);
  } else {
    return 30;
  }
}

export function setQueueState(queue: unknown[], queueIndex: number, track: unknown): void {
  localStorage.setItem('queue_state', JSON.stringify({ queue, queueIndex, track }));
}

export function getQueueState(): QueueState | null {
  const state = localStorage.getItem('queue_state');
  return state ? (JSON.parse(state) as QueueState) : null;
}
