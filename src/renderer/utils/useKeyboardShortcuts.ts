import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  action: (event: KeyboardEvent) => void;
  preventDefault?: boolean;
  description?: string;
}

export interface ShortcutDeps {
  [key: string]: unknown;
}

/**
 * Custom hook for managing keyboard shortcuts
 * @param shortcuts - Array of shortcut objects
 * @param deps - Dependencies object (e.g., { dispatch, state })
 */
export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  deps: ShortcutDeps = {}
): void => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      shortcuts.forEach(shortcut => {
        const {
          key,
          ctrl = false,
          alt = false,
          shift = false,
          action,
          preventDefault = true,
        } = shortcut;

        const keyMatches = event.key.toLowerCase() === key.toLowerCase();

        const ctrlMatches = ctrl
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey;
        const altMatches = alt ? event.altKey : !event.altKey;
        const shiftMatches = shift ? event.shiftKey : !event.shiftKey;

        if (keyMatches && ctrlMatches && altMatches && shiftMatches) {
          if (preventDefault) {
            event.preventDefault();
          }
          action(event);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, deps]);
};

/**
 * Utility function to format keyboard shortcut for display
 * @param shortcut - Shortcut object
 * @returns Formatted shortcut string (e.g., "Ctrl+K")
 */
export const formatShortcut = (
  shortcut: Pick<KeyboardShortcut, 'key' | 'ctrl' | 'alt' | 'shift' | 'meta'>
): string => {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.meta) parts.push('Meta');

  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
};

export interface ShortcutDefinition {
  key: string;
  ctrl?: boolean;
  description: string;
}

/**
 * Predefined keyboard shortcuts configuration
 */
export const SHORTCUTS: Record<string, ShortcutDefinition> = {
  SEARCH: {
    key: 'k',
    ctrl: true,
    description: 'Open search dialog',
  },
  ESCAPE: {
    key: 'Escape',
    description: 'Close dialogs / Go back',
  },
};
