// Status Bar Management

import { isDebugMode } from './debug.js';

export function updateStatusBar() {
  const statusBar = document.querySelector('.status-bar');
  if (!statusBar) return;

  const isOffline = !navigator.onLine;
  const debugMode = isDebugMode();
  
  if (debugMode && isOffline) {
    statusBar.className = 'status-bar active offline-debug-mode';
    statusBar.textContent = '🐛📡 DEBUG MODE + OFFLINE - Using debug save file without internet';
  } else if (debugMode) {
    statusBar.className = 'status-bar active debug-mode';
    statusBar.textContent = '🐛 DEBUG MODE ACTIVE - Using debug save file';
  } else if (isOffline) {
    statusBar.className = 'status-bar active offline-mode';
    statusBar.textContent = '📡 OFFLINE MODE - Working without internet connection';
  } else {
    statusBar.className = 'status-bar';
    statusBar.textContent = '';
  }
}

export function initStatusBar() {
  updateStatusBar();
  
  // Listen for online/offline events
  window.addEventListener('online', updateStatusBar);
  window.addEventListener('offline', updateStatusBar);
}
