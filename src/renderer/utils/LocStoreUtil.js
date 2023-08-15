/* eslint-disable no-undef */

export function resetApp() {
  localStorage.clear();
}

export function setTheme(isLightTheme) {
  localStorage.setItem('theme_preference', isLightTheme);
  return isLightTheme === 'true';
}
export function setVolumeLevel(val) {
  localStorage.setItem('volume_level', val);
}

export function getTheme() {
  const isLightTheme = localStorage.getItem('theme_preference');
  if (isLightTheme === 'true') {
    return true;
  }
  if (isLightTheme === 'false') {
    return false;
  }
  return isLightTheme;
}
export function getVolumeLevel() {
  const val = localStorage.getItem('volume_level');
  if (val) {
    return Number(val);
  } else {
    return 30;
  }
}
