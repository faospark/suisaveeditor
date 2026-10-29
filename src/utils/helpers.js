// Helper Utilities

import { SAVE_FILE_PATTERNS } from '../config/constants.js';

/**
 * Extract save file number from filename
 * Examples: 
 *   "_decrypted_gsd2_Data1.json" -> "1"
 *   "gsd2_Data10.json" -> "10"
 *   "save_3.json" -> "3"
 */
export function extractSaveNumber(filename) {
  if (!filename) return null;
  
  for (const pattern of SAVE_FILE_PATTERNS) {
    const match = filename.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Update the save file indicator in the editor tabs
 */
export function updateSaveFileIndicator(filename) {
  const indicator = document.getElementById('save-file-indicator');
  if (indicator) {
    const saveNumber = extractSaveNumber(filename);
    indicator.textContent = saveNumber ? `Save File #${saveNumber}` : `Editing: ${filename}`;
  }

  const badge = document.getElementById('file-status-badge');
  if (badge) {
    if (filename) {
      badge.classList.add('has-file');
      const saveNumber = extractSaveNumber(filename);
      badge.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #22c55e; flex-shrink: 0;">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span class="file-name" style="font-family: monospace; font-weight: 600;">${filename}</span>
        ${saveNumber ? `<span class="slot-tag">Slot #${saveNumber}</span>` : ''}
      `;
    } else {
      badge.classList.remove('has-file');
      badge.innerHTML = `<span class="file-status-text">No file chosen</span>`;
    }
  }

  const uploadLabel = document.getElementById('file-upload-label');
  if (uploadLabel && filename) {
    const span = uploadLabel.querySelector('span');
    if (span) span.textContent = 'Change File';
  }
}
