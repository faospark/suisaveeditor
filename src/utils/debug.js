// Debug Mode Utilities

import { DEBUG_FILE_PATH } from '../config/constants.js';

let DEBUG_MODE = localStorage.getItem('debugMode') === 'true';

export function isDebugMode() {
  return DEBUG_MODE;
}

export function setDebugMode(value) {
  DEBUG_MODE = value;
  localStorage.setItem('debugMode', value.toString());
}

export function toggleDebugMode() {
  DEBUG_MODE = !DEBUG_MODE;
  localStorage.setItem('debugMode', DEBUG_MODE.toString());
  return DEBUG_MODE;
}

export async function loadDebugFile() {
  try {
    const response = await fetch(DEBUG_FILE_PATH);
    if (!response.ok) {
      throw new Error(`Failed to load debug file: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Debug mode: Failed to load debug file:', error);
    throw error;
  }
}
