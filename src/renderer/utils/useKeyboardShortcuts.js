import { useEffect } from 'react';

/**
 * Custom hook for managing keyboard shortcuts
 * @param {Array} shortcuts - Array of shortcut objects
 * @param {Object} deps - Dependencies object (e.g., { dispatch, state })
 * 
 * @example
 * useKeyboardShortcuts([
 *   {
 *     key: 'k',
 *     ctrl: true,
 *     action: () => dispatch({ type: 'SET_SEARCH_ENABLED', payload: true }),
 *     description: 'Open search dialog'
 *   },
 *   {
 *     key: 'Escape',
 *     action: () => dispatch({ type: 'SET_SEARCH_ENABLED', payload: false }),
 *     description: 'Close search dialog'
 *   }
 * ], { dispatch });
 */
export const useKeyboardShortcuts = (shortcuts, deps = {}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      shortcuts.forEach((shortcut) => {
        const {
          key,
          ctrl = false,
          alt = false,
          shift = false,
          meta = false,
          action,
          preventDefault = true,
        } = shortcut;

        // Check if the key matches
        const keyMatches = event.key.toLowerCase() === key.toLowerCase();
        
        // Check if modifiers match
        const ctrlMatches = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const altMatches = alt ? event.altKey : !event.altKey;
        const shiftMatches = shift ? event.shiftKey : !event.shiftKey;
        const metaMatches = meta ? event.metaKey : true; // Meta is optional unless specified

        // If all conditions match, execute the action
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
 * @param {Object} shortcut - Shortcut object
 * @returns {string} Formatted shortcut string (e.g., "Ctrl+K")
 */
export const formatShortcut = (shortcut) => {
  const parts = [];
  
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.meta) parts.push('Meta');
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join('+');
};

/**
 * Predefined keyboard shortcuts configuration
 * Can be imported and used across the application
 */
export const SHORTCUTS = {
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
