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
}
