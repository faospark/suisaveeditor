// Main Application Logic

// Import configurations and utilities
import { APP_VERSION, FIELD_CONFIG, EDITOR_GROUPS, GROUP_PATHS } from './config/index.js';
import { isDebugMode, loadDebugFile, setDebugMode, toggleDebugMode, initStatusBar, updateStatusBar, updateSaveFileIndicator, extractSaveNumber, markdownToHTML } from './utils/index.js';
import GameData from './gamedata.js';
import { createBattleCharactersEditor, createPartyMembersEditor, createKeyItemsEditor, createRecruitmentEditor, createTableEditor, createBathItemsEditor } from './editors/index.js';
import { COOK_OFF_STAGES, EVENT_FLAG_INDEX } from './config/constants.js';
import { createDataValuesViewer } from './renderers/index.js';

const fileInput = document.getElementById('file-input');
const saveBtn = document.getElementById('save-btn');
const editorContainer = document.getElementById('editor-container');

let currentData = null;
let currentFileName = 'save.json';
let hasUnsavedChanges = false;

// Auto-save configuration
const AUTO_SAVE_KEY = 'suikohd_autosave_data';
const AUTO_SAVE_FILENAME_KEY = 'suikohd_autosave_filename';
const AUTO_SAVE_TIMESTAMP_KEY = 'suikohd_autosave_timestamp';

// Initialize status bar
initStatusBar();

// ============================================================================
// DIALOG UTILITIES
// ============================================================================

/**
 * Show a confirmation dialog using native HTML dialog element
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message (supports HTML)
 * @param {string} confirmText - Text for confirm button
 * @param {string} cancelText - Text for cancel button
 * @returns {Promise<boolean>} True if confirmed, false if cancelled
 */
function showConfirmDialog(title, message, confirmText = 'OK', cancelText = 'Cancel') {
  return new Promise((resolve) => {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = 'max-width: 500px; padding: 0; border: none; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);';
    
    dialog.innerHTML = `
      <article style="margin: 0; padding: 1.5rem;">
        <header style="margin-bottom: 1rem;">
          <h3 style="margin: 0; font-size: 1.25rem;">${title}</h3>
        </header>
        <div style="margin-bottom: 1.5rem; line-height: 1.6;">${message}</div>
        <footer style="display: flex; gap: 0.5rem; justify-content: flex-end; margin: 0;">
          <button class="outline" data-action="cancel">${cancelText}</button>
          <button data-action="confirm">${confirmText}</button>
        </footer>
      </article>
    `;
    
    document.body.appendChild(dialog);
    dialog.showModal();
    
    const handleClose = (confirmed) => {
      dialog.close();
      setTimeout(() => dialog.remove(), 100);
      resolve(confirmed);
    };
    
    dialog.querySelector('[data-action="confirm"]').addEventListener('click', () => handleClose(true));
    dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => handleClose(false));
    dialog.addEventListener('cancel', () => handleClose(false));
  });
}

/**
 * Show an alert dialog using native HTML dialog element
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message (supports HTML)
 * @param {string} buttonText - Text for close button
 * @returns {Promise<void>}
 */
function showAlertDialog(title, message, buttonText = 'OK') {
  return new Promise((resolve) => {
    const dialog = document.createElement('dialog');
    dialog.style.cssText = 'max-width: 500px; padding: 0; border: none; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);';
    
    dialog.innerHTML = `
      <article style="margin: 0; padding: 1.5rem;">
        <header style="margin-bottom: 1rem;">
          <h3 style="margin: 0; font-size: 1.25rem;">${title}</h3>
        </header>
        <div style="margin-bottom: 1.5rem; line-height: 1.6;">${message}</div>
        <footer style="display: flex; justify-content: flex-end; margin: 0;">
          <button data-action="close">${buttonText}</button>
        </footer>
      </article>
    `;
    
    document.body.appendChild(dialog);
    dialog.showModal();
    
    const handleClose = () => {
      dialog.close();
      setTimeout(() => dialog.remove(), 100);
      resolve();
    };
    
    dialog.querySelector('[data-action="close"]').addEventListener('click', handleClose);
    dialog.addEventListener('cancel', handleClose);
  });
}

// ============================================================================
// AUTO-SAVE & RECOVERY
// ============================================================================

/**
 * Save current data to localStorage for crash recovery
 */
function autoSaveToLocalStorage() {
  if (!currentData) return;
  try {
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(currentData));
    localStorage.setItem(AUTO_SAVE_FILENAME_KEY, currentFileName);
    localStorage.setItem(AUTO_SAVE_TIMESTAMP_KEY, Date.now().toString());
    console.log('Auto-saved to localStorage');
  } catch (err) {
    console.error('Failed to auto-save:', err);
  }
}

/**
 * Clear auto-save data from localStorage
 */
function clearAutoSave() {
  localStorage.removeItem(AUTO_SAVE_KEY);
  localStorage.removeItem(AUTO_SAVE_FILENAME_KEY);
  localStorage.removeItem(AUTO_SAVE_TIMESTAMP_KEY);
  hasUnsavedChanges = false;
  console.log('Auto-save cleared');
}

/**
 * Check for and offer to restore auto-saved data
 */
async function checkForAutoSave() {
  const savedData = localStorage.getItem(AUTO_SAVE_KEY);
  const savedFilename = localStorage.getItem(AUTO_SAVE_FILENAME_KEY);
  const savedTimestamp = localStorage.getItem(AUTO_SAVE_TIMESTAMP_KEY);
  
  if (savedData && savedFilename && savedTimestamp) {
    const saveDate = new Date(parseInt(savedTimestamp));
    const timeAgo = Math.round((Date.now() - saveDate.getTime()) / 1000 / 60); // minutes
    
    const message = `
      <p><strong>⚠️ An auto-saved editing session was found:</strong></p>
      <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
        <li><strong>File:</strong> <code>${savedFilename}</code></li>
        <li><strong>Last saved:</strong> ${timeAgo} minute(s) ago</li>
      </ul>
      <p>Would you like to restore this session?</p>
    `;
    
    const restore = await showConfirmDialog('Unsaved Work Detected', message, 'Discard', 'Restore');
    
    if (!restore) {
      try {
        currentData = JSON.parse(savedData);
        currentFileName = savedFilename;
        renderEditor(editorContainer, currentData, (newData) => {
          currentData = newData;
          hasUnsavedChanges = true;
          autoSaveToLocalStorage();
        });
        saveBtn.disabled = false;
        updateSaveFileIndicator(currentFileName);
        hasUnsavedChanges = true;
        await showAlertDialog('Session Restored', '<p>✅ <strong>Session restored successfully!</strong></p><p>Remember to save your changes.</p>');
      } catch (err) {
        await showAlertDialog('Restore Failed', `<p>❌ <strong>Failed to restore session:</strong></p><p>${err.message}</p>`);
        clearAutoSave();
      }
    } else {
      clearAutoSave();
    }
  }
}

// Check for auto-save on page load (after a short delay to let UI initialize)
setTimeout(checkForAutoSave, 500);

// Warn before leaving page if there are unsaved changes
window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges && currentData) {
    e.preventDefault();
    e.returnValue = ''; // Modern browsers show their own message
    return ''; // Legacy browsers
  }
});

// Auto-load debug file if DEBUG_MODE is enabled
if (isDebugMode()) {
  loadDebugFile()
    .then(data => {
      currentData = data;
      currentFileName = 'debug_save.json';
      renderEditor(editorContainer, currentData, (newData) => {
        currentData = newData;
        hasUnsavedChanges = true;
        autoSaveToLocalStorage();
      });
      saveBtn.disabled = false;
      console.log('Debug mode: Auto-loaded save file');
    })
    .catch(err => {
      showAlertDialog('Debug Mode Error', `<p>❌ Debug mode enabled but failed to load file.</p><p><strong>Error:</strong> ${err.message}</p>`);
    });
}

// ============================================================================
// EDITOR FACTORY
// Maps renderer types to their corresponding editor creation functions
// ============================================================================

/**
 * Factory map for editor creation functions
 * @type {Object<string, Function>}
 */
const editorFactories = {
  table: createTableEditor,
  bath_items: createBathItemsEditor,
  recruitment: createRecruitmentEditor,
  battle_characters: createBattleCharactersEditor,
  play_time: null, // Defined later
  bath_level: null, // Defined later
  cook_off_progress: null, // Defined later
  party_members: createPartyMembersEditor,
  key_items: createKeyItemsEditor,
  greenhill_aliases: null, // Defined later
  food_menu: null, // Defined later
  castle_editors_combined: null, // Defined later
  location: null // Defined later
};

/**
 * Creates an editor element using the factory pattern
 * @param {string} renderer - The renderer type
 * @param {*} value - The data value
 * @param {Object} targetData - The target data object
 * @param {Object} data - The full data object (for special cases)
 * @param {string} key - The data key
 * @param {string} label - The display label
 * @param {Object} config - The field configuration
 * @returns {HTMLElement} The created editor element
 */
function createEditorElement(renderer, value, targetData, data, key, label, config) {
  const editorFactory = editorFactories[renderer];
  
  if (!editorFactory) {
    // Default editor for unknown renderers
    return createElementForValue(value, label, (newValue) => {
      targetData[key] = newValue;
    }, targetData);
  }

  // Create onChange callback
  const onChange = (newValue) => {
    // Only update if newValue is provided (some editors modify in-place)
    if (newValue !== undefined) {
      targetData[key] = newValue;
    }
  };

  // Handle special cases
  switch (renderer) {
    case 'table':
      const columns = config.columns;
      return editorFactory(value, label, onChange, columns);
    
    case 'battle_characters':
      return editorFactory(value, label, onChange, createElementForValue, FIELD_CONFIG, data.chara_flag, data);
    
    case 'recruitment':
      // Recruitment editor needs access to full game data for special logic
      return editorFactory(value, label, onChange, data);
    
    case 'castle_editors_combined':
      return editorFactory(data, targetData);
    
    case 'cook_off_progress':
      // Cook-off progress needs access to root event_flag
      return editorFactory(data, label, onChange);
    
    case 'location':
      // Location editor updates directly, doesn't need onChange callback
      return editorFactory(data, label, () => {});
    
    default:
      return editorFactory(value, label, onChange);
  }
}

// ============================================================================
// MAIN EDITOR RENDERING
// Creates tabbed interface and routes to appropriate renderers
// ============================================================================

/**
 * Renders the JSON editor into the container.
 * @param {HTMLElement} container 
 * @param {Object|Array} data 
 * @param {Function} onUpdate Callback when data changes
 */
function renderEditor(container, data, onUpdate) {
  // Don't clear the entire container - preserve tab-panels-container and placeholder
  // Only remove the placeholder text if it exists
  const placeholder = container.querySelector('p');
  if (placeholder && placeholder.textContent.includes('Please load a JSON file')) {
    placeholder.remove();
  }

  let rootData = data;
  let isGameData = false;

  // Create Tabs with flexbox layout - use existing editor-tabs div or create new one
  let tabContainer = document.getElementById('editor-tabs');
  if (!tabContainer) {
    tabContainer = document.createElement('div');
    tabContainer.id = 'editor-tabs';
    // Insert before tab-panels-container if it exists
    const tabPanelsContainer = document.getElementById('tab-panels-container');
    if (tabPanelsContainer) {
      container.insertBefore(tabContainer, tabPanelsContainer);
    } else {
      container.appendChild(tabContainer);
    }
  }
  
  // Clear existing tabs but keep the container
  tabContainer.innerHTML = '';
  tabContainer.className = 'tabs';

  const tabsLeft = document.createElement('div');
  tabsLeft.className = 'tabs-left';

  const tabsRight = document.createElement('div');
  tabsRight.className = 'tabs-right';

  // Get or create tab panels container
  let tabPanelsContainer = document.getElementById('tab-panels-container');
  if (!tabPanelsContainer) {
    tabPanelsContainer = document.createElement('div');
    tabPanelsContainer.id = 'tab-panels-container';
    tabPanelsContainer.className = 'tab-content';
    container.appendChild(tabPanelsContainer);
  } else {
    // Clear only regular tab panels (keep special panels)
    const regularPanels = tabPanelsContainer.querySelectorAll('.tab-panel:not(.special-panel)');
    regularPanels.forEach(p => p.remove());
  }

  const groupKeys = Object.keys(EDITOR_GROUPS);
  let activeTab = groupKeys[0];
  const tabButtons = {}; // Cache tab buttons for performance
  const tabPanels = {}; // Cache tab panels
  const specialPanels = container._specialPanels || {}; // Get existing special panels or create new object

  // Create all tab panels upfront
  groupKeys.forEach(groupName => {
    const panel = document.createElement('div');
    const panelClass = `${groupName.toLowerCase().replace(/\s+/g, '-')}-panel`;
    panel.className = `tab-panel editor-panel ${panelClass}`;
    panel.id = `panel-${groupName.toLowerCase().replace(/\s+/g, '-')}`;
    panel.dataset.tabName = groupName;
    
    if (groupName === activeTab) {
      panel.classList.add('active');
    }
    
    tabPanelsContainer.appendChild(panel);
    tabPanels[groupName] = panel;
    
    // Render content into panel
    renderTabContent(panel, groupName, data, onUpdate);
  });

  // Create regular data editing tabs (left side)
  groupKeys.forEach(groupName => {
    const btn = document.createElement('button');
    btn.textContent = groupName;
    btn.className = 'tab-button outline';
    btn.id = `tab-${groupName.toLowerCase().replace(/\s+/g, '-')}`; // Add unique ID
    btn.dataset.tabName = groupName; // Store tab name for easy reference

    if (groupName === activeTab) btn.classList.remove('outline');

    tabButtons[groupName] = btn; // Cache button reference

    btn.addEventListener('click', () => {
      // Update button styles
      Object.values(tabButtons).forEach(b => b.classList.add('outline'));
      btn.classList.remove('outline');
      
      // Deactivate header buttons (Data Values, About, Changelog)
      const headerButtons = document.querySelectorAll('.tabs-right .tab-button');
      headerButtons.forEach(b => b.classList.add('outline'));

      // Hide all children in container
      Array.from(tabPanelsContainer.children).forEach(child => {
        child.style.display = 'none';
      });
      
      // Show selected tab panel
      tabPanels[groupName].style.display = 'block';
    });

    tabsLeft.appendChild(btn);
  });

  // Assemble tab container
  tabContainer.appendChild(tabsLeft);
  
  // Add save file indicator on the right
  const saveFileIndicator = document.createElement('div');
  saveFileIndicator.id = 'save-file-indicator';
  saveFileIndicator.className = 'save-file-indicator';
  saveFileIndicator.style.cssText = 'display: flex; align-items: center; padding: 0.4rem 0.8rem; font-size: 0.75rem; font-weight: 600; color: var(--pico-primary); background: rgba(var(--pico-primary-rgb, 52, 152, 219), 0.1); border-radius: 6px;';
  
  // Extract save number from filename
  const saveNumber = extractSaveNumber(currentFileName);
  saveFileIndicator.textContent = saveNumber ? `Save File #${saveNumber}` : `Editing: ${currentFileName}`;
  
  tabsRight.appendChild(saveFileIndicator);
  tabContainer.appendChild(tabsRight);
  
  // Store references for header buttons to access
  container.dataset.editorInitialized = 'true';
  container._specialPanels = specialPanels;
  container._tabPanels = tabPanels;
}

function renderTabContent(container, group, data, onUpdate) {
  container.innerHTML = '';

  // Add section title for Party Bag
  if (group === 'Party Bag') {
    const title = document.createElement('h3');
    title.textContent = 'Party Items';
    title.style.cssText = 'margin: 0 0 1rem 0; font-size: 1.1rem; font-weight: 600;';
    container.appendChild(title);
  }

  const groupPath = GROUP_PATHS[group];
  let targetData = data;

  if (groupPath) {
    targetData = data[groupPath];
    if (!targetData) {
      container.innerHTML = '<p>No data available for this section.</p>';
      return;
    }
  }

  const keys = EDITOR_GROUPS[group] || [];

  // RENDERS: General Tab - checks game_data, party_data, and root level for fields
  if (groupPath === null) {
    keys.forEach(key => {
      const config = FIELD_CONFIG[key];
      if (!config) return;

      // Special handling for location - it's a virtual grouping, not a real field
      if (key === 'location') {
        const element = createLocationEditor(data, 'Map Location', () => { });
        container.appendChild(element);
        return;
      }

      // Special handling for cook_off_progress - it's a virtual field based on event_flag
      if (key === 'cook_off_progress') {
        const element = createCookOffProgressEditor(data, 'Cook-Off Battles Won', () => { });
        container.appendChild(element);
        return;
      }

      // Check in game_data first, then party_data, then root level
      let value, sourceData;
      if (data.game_data && data.game_data[key] !== undefined) {
        value = data.game_data[key];
        sourceData = data.game_data;
      } else if (data.party_data && data.party_data[key] !== undefined) {
        value = data.party_data[key];
        sourceData = data.party_data;
      } else {
        value = data[key];
        sourceData = data;
      }

      if (value === undefined) return;

      const label = config.label || key;
      const renderer = config.renderer;

      // Skip if renderer is 'skip' (handled elsewhere)
      if (renderer === 'skip') return;

      let element;
      if (renderer) {
        element = createEditorElement(renderer, value, sourceData, data, key, label, config);
      } else {
        element = createElementForValue(value, label, (newValue) => {
          sourceData[key] = newValue;
        }, sourceData, config);
      }
      container.appendChild(element);
    });
    return;
  }

  // RENDERS: Other tabs (Items, Party Bag, Battle Characters, etc.) - uses specific data paths

  keys.forEach(key => {
    if (targetData[key] === undefined) return;

    const config = FIELD_CONFIG[key];
    if (!config) return;

    const label = config.label || key;
    const renderer = config.renderer;

    // Skip if renderer is 'skip' (handled elsewhere)
    if (renderer === 'skip') return;

    let element;
    if (renderer) {
      element = createEditorElement(renderer, targetData[key], targetData, data, key, label, config);
    } else {
      element = createElementForValue(targetData[key], label, (newValue) => {
        targetData[key] = newValue;
      }, targetData);
    }
    container.appendChild(element);
  });
}


// ============================================================================
// PLAY TIME EDITOR
// RENDERS: Play time as 3 side-by-side fields (Hours, Minutes, Seconds)
// ============================================================================

function createPlayTimeEditor(arr, key, updateCallback) {
  const div = document.createElement('div');
  div.className = 'json-item';
  div.id = 'play-time-editor';

  const label = document.createElement('label');
  label.textContent = key;
  div.appendChild(label);

  const fieldsContainer = document.createElement('div');
  fieldsContainer.style.cssText = 'display: flex; gap: 1rem; align-items: center;';

  const timeLabels = ['Hours', 'Minutes', 'Seconds'];

  timeLabels.forEach((timeLabel, i) => {
    const fieldGroup = document.createElement('div');
    fieldGroup.style.cssText = 'display: flex; flex-direction: column; gap: 0.25rem;';

    const fieldLabel = document.createElement('label');
    fieldLabel.textContent = timeLabel;
    fieldLabel.style.cssText = 'font-size: 0.85rem; margin-bottom: 0;';
    fieldGroup.appendChild(fieldLabel);

    const input = document.createElement('input');
    input.type = 'number';
    input.value = arr[i] || 0;
    input.style.cssText = 'width: 80px; margin-bottom: 0;';

    // Set min/max based on field type
    if (i === 0) {
      // Hours: 0-999
      input.min = '0';
      input.max = '999';
    } else {
      // Minutes and Seconds: 0-59
      input.min = '0';
      input.max = '59';
    }

    input.addEventListener('input', (e) => {
      let value = parseFloat(e.target.value) || 0;
      const min = parseFloat(input.min);
      const max = parseFloat(input.max);

      // Clamp value within min/max range
      if (value < min) value = min;
      if (value > max) value = max;

      // Update the input display and data
      e.target.value = value;
      arr[i] = value;
    });
    fieldGroup.appendChild(input);

    fieldsContainer.appendChild(fieldGroup);
  });

  div.appendChild(fieldsContainer);
  return div;
}

// ============================================================================
// BATH LEVEL EDITOR
// RENDERS: Bath House Level (first element of furo_info array) as read-only
// ============================================================================

function createBathLevelEditor(arr, key, updateCallback) {
  const div = document.createElement('div');
  div.className = 'json-item';
  div.id = 'bath-level-editor';

  const label = document.createElement('label');
  label.textContent = key;
  div.appendChild(label);

  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.value = arr[0] || 0;
  input.readOnly = true;
  input.style.opacity = '0.6';
  input.style.cursor = 'not-allowed';
  input.title = 'Bath House Level is read-only';

  div.appendChild(input);
  return div;
}

// ============================================================================
// GREENHILL ALIASES EDITOR
// RENDERS: First 3 Greenhill mission aliases (Hero, Nanami, Flik) with Flik read-only
// ============================================================================

function createGreenhillAliasesEditor(arr, key, updateCallback) {
  const div = document.createElement('div');
  div.className = 'json-item';
  div.id = 'greenhill-aliases-editor';

  const label = document.createElement('label');
  label.textContent = key;
  div.appendChild(label);

  const aliasesContainer = document.createElement('div');
  aliasesContainer.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem;';

  const aliasLabels = ["Hero's Alias", "Nanami's Alias", "Flik's Alias"];

  // Only show first 3 items
  for (let i = 0; i < 3 && i < arr.length; i++) {
    const aliasGroup = document.createElement('div');
    aliasGroup.style.cssText = 'display: flex; gap: 1rem; align-items: center;';

    const aliasLabel = document.createElement('label');
    aliasLabel.textContent = aliasLabels[i];
    aliasLabel.style.cssText = 'margin-bottom: 0;';
    aliasGroup.appendChild(aliasLabel);

    const input = document.createElement('input');
    input.type = 'text';
    input.value = arr[i] || '';
    input.style.cssText = 'flex: 1; margin-bottom: 0;';

    // Make Flik's name (index 2) read-only
    if (i === 2) {
      input.readOnly = true;
      input.style.opacity = '0.6';
      input.style.cursor = 'not-allowed';
      input.title = "Flik's name is read-only";
    } else {
      input.addEventListener('input', (e) => {
        arr[i] = e.target.value;
      });
    }

    aliasGroup.appendChild(input);
    aliasesContainer.appendChild(aliasGroup);
  }

  div.appendChild(aliasesContainer);
  return div;
}

// ============================================================================
// CASTLE EDITORS COMBINED
// RENDERS: Greenhill Aliases and Food Menu in a single container
// ============================================================================

function createCastleEditorsCombined(data, sourceData) {
  const wrapper = document.createElement('div');
  wrapper.className = 'castle-editors-combined';
  wrapper.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1rem; margin-top: 1rem;';

  // Create Greenhill Aliases section
  if (sourceData['kari_name']) {
    const aliasesSection = createGreenhillAliasesEditor(sourceData['kari_name'], 'Greenhill Mission Aliases', (newValue) => {
      sourceData['kari_name'] = newValue;
    });
    wrapper.appendChild(aliasesSection);
  }

  // Create Food Menu section
  if (sourceData['food_menu']) {
    const foodSection = createFoodMenuEditor(sourceData['food_menu'], 'Castle Restaurant Menu', (newValue) => {
      sourceData['food_menu'] = newValue;
    });
    wrapper.appendChild(foodSection);
  }

  return wrapper;
}


// ============================================================================
// FOOD MENU EDITOR
// RENDERS: Castle Menu Orders - recipes available at the castle restaurant
// ============================================================================

function createFoodMenuEditor(arr, key, updateCallback) {
  const div = document.createElement('div');
  div.className = 'json-item';
  div.id = 'food-menu-editor';

  const label = document.createElement('label');
  label.textContent = key;
  div.appendChild(label);

  const menuContainer = document.createElement('div');
  menuContainer.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem;';

  // Add description
  /* const description = document.createElement('p');
  description.style.cssText = 'font-size: 0.85rem; color: var(--pico-muted-color); margin: 0.5rem 0; font-style: italic;';
  description.textContent = 'Recipes available to order at the castle restaurant. Select from dropdown or use 0 for empty slots.';
  menuContainer.appendChild(description); */

  // Only show first 6 slots (7th is hidden/unused in-game)
  for (let index = 0; index < Math.min(arr.length, 6); index++) {
    const recipeId = arr[index];
    const menuGroup = document.createElement('div');
    menuGroup.className = 'json-item';
    menuGroup.style.cssText = 'margin-bottom: 0;';

    const slotLabel = document.createElement('label');
    slotLabel.textContent = `Slot ${index + 1}`;
    slotLabel.style.cssText = 'min-width: 80px;';
    menuGroup.appendChild(slotLabel);

    // Recipe ID dropdown
    const select = document.createElement('select');
    select.style.cssText = 'margin-bottom: 0;';

    // Add "None" option
    const noneOption = document.createElement('option');
    noneOption.value = 0;
    noneOption.textContent = '0: None';
    select.appendChild(noneOption);

    // Add all food recipes
    if (GameData && GameData.FOOD) {
      Object.entries(GameData.FOOD).forEach(([id, foodItem]) => {
        if (id !== '0') {
          const option = document.createElement('option');
          option.value = id;
          // Extract name from object format
          const foodName = typeof foodItem === 'string' ? foodItem : (foodItem.name || `Food ${id}`);
          option.textContent = `${id}: ${foodName}`;
          select.appendChild(option);
        }
      });
    }

    select.value = recipeId;

    select.addEventListener('change', (e) => {
      const newId = parseInt(e.target.value);
      arr[index] = newId;
    });

    menuGroup.appendChild(select);
    menuContainer.appendChild(menuGroup);
  }

  div.appendChild(menuContainer);
  return div;
}

// ============================================================================
// LOCATION EDITOR
// RENDERS: Map location fields grouped together (area_no, town_no, map_no, px, py)
// ============================================================================

function createLocationEditor(data, key, updateCallback) {
  const container = document.createElement('div');
  container.className = 'json-item location-editor';
  container.id = 'location-editor';

  const label = document.createElement('label');
  label.textContent = 'Map Location';
  label.style.cssText = 'font-weight: bold; margin-bottom: 1rem; display: block;';
  container.appendChild(label);

  const fieldsContainer = document.createElement('div');
  fieldsContainer.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; padding: 1rem; background: rgba(0,0,0,0.1); border-radius: 6px; width:100%';

  // Define location fields with their sources
  const locationFields = [
    { key: 'area_no', label: 'Area Location', source: 'game_data' },
    { key: 'town_no', label: 'Town No', source: 'game_data' },
    { key: 'map_no', label: 'Map No', source: 'game_data' },
    { key: 'px', label: 'Player X Coordinate', source: 'root' },
    { key: 'py', label: 'Player Y Coordinate', source: 'root' }
  ];

  locationFields.forEach(field => {
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'json-item';
    fieldGroup.style.cssText = 'margin-bottom: 0;';

    const fieldLabel = document.createElement('label');
    fieldLabel.textContent = field.label;
    fieldLabel.style.cssText = 'min-width: 150px;';
    fieldGroup.appendChild(fieldLabel);

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.style.cssText = 'margin-bottom: 0;';

    // Get value from appropriate source
    let value, sourceData;
    if (field.source === 'game_data') {
      sourceData = data.game_data;
      value = sourceData ? sourceData[field.key] : 0;
    } else {
      sourceData = data;
      value = sourceData[field.key];
    }

    input.value = value || 0;

    input.addEventListener('input', (e) => {
      const newValue = parseFloat(e.target.value) || 0;
      sourceData[field.key] = newValue;
    });

    fieldGroup.appendChild(input);
    fieldsContainer.appendChild(fieldGroup);
  });

  container.appendChild(fieldsContainer);
  return container;
}

// ============================================================================
// COOK-OFF PROGRESS EDITOR
// RENDERS: Cook-Off Battle progress (event_flag[153-154])
// ============================================================================

function createCookOffProgressEditor(data, key, updateCallback) {
  const container = document.createElement('div');
  container.className = 'json-item';
  container.id = 'cook-off-progress-editor';

  const label = document.createElement('label');
  label.textContent = 'Cook-Off Battles Won';
  container.appendChild(label);

  const select = document.createElement('select');
  select.style.cssText = 'margin-bottom: 0;';

  // Cook-off progress mapping: [matches won, byte152 value, byte153 value]
  const cookOffStages = [
    [0, 0, 32],    // No matches: 0x00 0x20
    [1, 1, 32],    // 1st match: 0x01 0x20
    [2, 3, 32],    // 2nd match: 0x03 0x20
    [3, 7, 32],    // 3rd match: 0x07 0x20
    [4, 15, 32],   // 4th match: 0x0F 0x20
    [5, 31, 32],   // 5th match: 0x1F 0x20
    [6, 63, 32],   // 6th match: 0x3F 0x20
    [7, 127, 32],  // 7th match: 0x7F 0x20
    [8, 255, 32],  // 8th match: 0xFF 0x20
    [9, 255, 33],  // 9th match: 0xFF 0x21
    [10, 255, 35], // 10th match: 0xFF 0x23
    [11, 255, 39], // 11th match: 0xFF 0x27
    [12, 255, 47]  // 12th match (final): 0xFF 0x2F
  ];

  // Get current values from event_flag
  const currentByte152 = data.event_flag[EVENT_FLAG_INDEX.COOK_OFF_BYTE1] || 0;
  const currentByte153 = data.event_flag[EVENT_FLAG_INDEX.COOK_OFF_BYTE2] || 32;

  // Find current stage
  let currentStage = 0;
  for (let i = 0; i < cookOffStages.length; i++) {
    const [matches, b152, b153] = cookOffStages[i];
    if (currentByte152 === b152 && currentByte153 === b153) {
      currentStage = matches;
      break;
    }
  }

  // Cook-off opponent names in order
  const opponents = [
    'Not started',
    'Match 1: Ky Yun Defeated',
    'Match 2: Goetsu Defeated',
    'Match 3: Shinki Defeated',
    'Match 4: Ryuki Defeated',
    'Match 5: Bashok Defeated',
    'Match 6: Ryuko Defeated',
    'Match 7: Antoio Defeated',
    'Match 8: Gyokuran Defeated',
    'Match 9: Retso Defeated',
    'Match 10: Lester Defeated',
    'Match 11: Retso Defeated',
    'Match 12: Jinkai Defeated (Complete!)'
  ];

  // Populate dropdown
  cookOffStages.forEach(([matches, b153, b154]) => {
    const option = document.createElement('option');
    option.value = matches;
    option.textContent = opponents[matches];
    select.appendChild(option);
  });

  select.value = currentStage;

  select.addEventListener('change', (e) => {
    const selectedMatches = parseInt(e.target.value);
    const stage = cookOffStages[selectedMatches];
    
    // Update event_flag bytes
    data.event_flag[EVENT_FLAG_INDEX.COOK_OFF_BYTE1] = stage[1];
    data.event_flag[EVENT_FLAG_INDEX.COOK_OFF_BYTE2] = stage[2];
  });

  container.appendChild(select);
  return container;
}

// Register editor factories after functions are defined
editorFactories.play_time = createPlayTimeEditor;
editorFactories.bath_level = createBathLevelEditor;
editorFactories.cook_off_progress = createCookOffProgressEditor;
editorFactories.greenhill_aliases = createGreenhillAliasesEditor;

editorFactories.food_menu = createFoodMenuEditor;
editorFactories.castle_editors_combined = createCastleEditorsCombined;
editorFactories.location = createLocationEditor;

// ============================================================================
// BATTLE CHARACTERS EDITOR
// RENDERS: Battle Characters tab with stats, runes (dropdowns), equipment (dropdowns), and accessories
// ============================================================================

/**
 * Filters runes based on character index and equipment slot
 * @param {number} characterIndex - Index of the character
 * @param {number} slotIndex - Equipment slot (0=Head, 1=Right Hand, 2=Left Hand)
 * @returns {Array} Array of allowed rune objects with id and name
 */

// ============================================================================
// ABOUT VIEWER
// RENDERS: About tab with README.md content converted to HTML
// ============================================================================

function createAboutViewer(container) {
  container.innerHTML = '';
  container.classList.add('about-content');

  // Show loading state
  const loading = document.createElement('p');
  loading.textContent = 'Loading README...';
  loading.style.cssText = 'color: var(--pico-muted-color); text-align: center; padding: 2rem;';
  container.appendChild(loading);

  // Fetch README.md
  fetch('./README.md')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load README: ${response.statusText}`);
      }
      return response.text();
    })
    .then(markdown => {
      // Clear loading state
      container.innerHTML = '';

      // Create content wrapper
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'readme-content';
      contentWrapper.style.cssText = 'max-width: 800px; margin: 0 auto; padding: 1rem;';

      // Convert markdown to HTML
      const htmlContent = markdownToHTML(markdown);
      contentWrapper.innerHTML = htmlContent;

      container.appendChild(contentWrapper);
    })
    .catch(error => {
      container.innerHTML = '';
      const errorMsg = document.createElement('p');
      errorMsg.style.cssText = 'color: var(--pico-del-color); text-align: center; padding: 2rem;';
      errorMsg.textContent = `Error loading README: ${error.message}`;
      container.appendChild(errorMsg);
    });
}

// ============================================================================
// CHANGELOG VIEWER
// RENDERS: Changelog from CHANGELOG.md with markdown parsing
// ============================================================================

function createChangelogViewer(container) {
  container.innerHTML = '<p style="text-align: center; color: var(--pico-muted-color);">Loading Changelog...</p>';

  fetch('./CHANGELOG.md')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load CHANGELOG: ${response.statusText}`);
      }
      return response.text();
    })
    .then(markdown => {
      // Clear loading state
      container.innerHTML = '';

      // Create content wrapper with both tab-content and changelog-content classes
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'tab-content changelog-content';
      contentWrapper.style.cssText = 'max-width: 800px; margin: 0 auto; padding: 1rem;';

      // Convert markdown to HTML
      const htmlContent = markdownToHTML(markdown);
      contentWrapper.innerHTML = htmlContent;

      container.appendChild(contentWrapper);
    })
    .catch(error => {
      container.innerHTML = '';
      const errorMsg = document.createElement('p');
      errorMsg.style.cssText = 'color: var(--pico-del-color); text-align: center; padding: 2rem;';
      errorMsg.textContent = `Error loading Changelog: ${error.message}`;
      container.appendChild(errorMsg);
    });
}


// ============================================================================
// GENERIC VALUE EDITORS
// RENDERS: Primitive inputs, objects, and arrays for unspecialized fields
// ============================================================================

function createElementForValue(value, key, updateCallback, parentObject, config = {}) {
  const type = Array.isArray(value) ? 'array' : typeof value;

  if (value === null) {
    const div = document.createElement('div');
    div.className = 'json-item';
    div.innerHTML = `<span class="json-key">${key}:</span> <em>null</em>`;
    return div;
  }

  switch (type) {
    case 'string':
    case 'number':
    case 'boolean':
      return createPrimitiveInput(value, key, type, updateCallback, config);
    case 'object':
      return createObjectEditor(value, key, updateCallback);
    case 'array':
      return createArrayEditor(value, key, updateCallback);
    default:
      const div = document.createElement('div');
      div.textContent = `Unknown type: ${type}`;
      return div;
  }
}

function createPrimitiveInput(value, key, type, updateCallback, config = {}) {
  const div = document.createElement('div');
  div.className = 'json-item ';

  const label = document.createElement('label');
  label.textContent = key;
  div.appendChild(label);

  let input;
  if (type === 'boolean') {
    input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = value;
    if (config.readonly) {
      input.disabled = true;
    }
    input.addEventListener('change', (e) => {
      updateCallback(e.target.checked);
    });
    div.appendChild(input);
  } else {
    input = document.createElement('input');
    input.type = type === 'number' ? 'number' : 'text';
    input.value = value;
    if (type === 'number') {
      input.min = '0';
      input.step = 'any';
    }
    if (config.readonly) {
      input.readOnly = true;
    }
    input.addEventListener('input', (e) => {
      const val = type === 'number' ? parseFloat(e.target.value) : e.target.value;
      updateCallback(val);
    });
    div.appendChild(input);
  }

  return div;
}

function createObjectEditor(obj, key, updateCallback) {
  const details = document.createElement('details');
  details.open = false; // Closed by default to save space
  details.className = 'json-object';

  const summary = document.createElement('summary');
  summary.textContent = key;
  details.appendChild(summary);

  Object.keys(obj).forEach(k => {
    const el = createElementForValue(obj[k], k, (newValue) => {
      obj[k] = newValue;
    }, obj);
    details.appendChild(el);
  });

  return details;
}

function createArrayEditor(arr, key, updateCallback) {
  const details = document.createElement('details');
  details.open = false;
  details.className = 'json-array';

  const summary = document.createElement('summary');
  summary.textContent = key + ` [${arr.length}]`;
  details.appendChild(summary);

  // Create container with CSS columns for array items
  const container = document.createElement('div');
  container.className = 'three-css-col';

  arr.forEach((item, index) => {
    const el = createElementForValue(item, index, (newValue) => {
      arr[index] = newValue;
    }, arr);
    container.appendChild(el);
  });

  details.appendChild(container);
  return details;
}

// Exit debug mode when clicking the file input
fileInput.addEventListener('click', (e) => {
  if (isDebugMode()) {
    e.preventDefault();
    console.log('File input clicked - exiting debug mode...');
    setDebugMode(false);
    updateStatusBar();
    showAlertDialog('Debug Mode', '<p>🐛 <strong>Debug Mode DISABLED</strong></p><p>Page will refresh to exit debug mode. Then you can load your file.</p>').then(() => {
      location.reload();
    });
  }
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  currentFileName = file.name;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      currentData = JSON.parse(event.target.result);
      renderEditor(editorContainer, currentData, (newData) => {
        currentData = newData;
        hasUnsavedChanges = true;
        autoSaveToLocalStorage();
      });
      saveBtn.disabled = false;
      
      // Update save file indicator
      updateSaveFileIndicator(currentFileName);
      
      // Initial auto-save
      hasUnsavedChanges = false;
      autoSaveToLocalStorage();
    } catch (err) {
      showAlertDialog('Parse Error', `<p>❌ <strong>Error parsing JSON:</strong></p><p>${err.message}</p>`);
    }
  };
  reader.readAsText(file);
});

saveBtn.addEventListener('click', () => {
  if (!currentData) return;

  // Stringify with proper Unicode escaping and CRLF line endings
  let jsonContent = JSON.stringify(currentData, (key, value) => {
    // Ensure proper JSON serialization
    return value;
  }, 2);
  
  // Escape non-ASCII Unicode characters (for game compatibility)
  jsonContent = jsonContent.replace(/[\u0080-\uFFFF]/g, (ch) => {
    return '\\u' + ('0000' + ch.charCodeAt(0).toString(16).toUpperCase()).slice(-4);
  });
  
  // Normalize to CRLF (Windows) line endings
  jsonContent = jsonContent.replace(/\r?\n/g, '\r\n');
  
  // Add UTF-8 BOM (EF BB BF)
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const textEncoder = new TextEncoder();
  const jsonBytes = textEncoder.encode(jsonContent);
  
  // Combine BOM + content
  const fileContent = new Uint8Array(bom.length + jsonBytes.length);
  fileContent.set(bom, 0);
  fileContent.set(jsonBytes, bom.length);
  
  const blob = new Blob([fileContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = currentFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Clear auto-save since file was successfully saved
  clearAutoSave();
  showAlertDialog('File Saved', '<p>✅ <strong>File saved successfully!</strong></p><p>Auto-save backup has been cleared.</p>');
});

// Hotkey: Ctrl+D to toggle debug mode
document.addEventListener('keydown', (e) => {
  // Ignore keyboard shortcuts when user is typing in input/textarea/select
  const activeElement = document.activeElement;
  const isTyping = activeElement && (
    activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.tagName === 'SELECT' ||
    activeElement.isContentEditable
  );
  
  if (isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
    return; // Don't intercept normal typing
  }

  // Check for Ctrl+D (or Cmd+D on Mac)
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault(); // Prevent default browser behavior

    // Toggle debug mode
    const newDebugMode = toggleDebugMode();
    updateStatusBar(); // Update status bar

    if (newDebugMode) {
      console.log('Debug mode ENABLED - Loading debug file...');

      // Load debug file
      loadDebugFile()
        .then(data => {
          currentData = data;
          currentFileName = 'debug_save.json';
          renderEditor(editorContainer, currentData, (newData) => {
            currentData = newData;
          });
          saveBtn.disabled = false;
          console.log('Debug mode: Auto-loaded save file');

          // Show notification
          showAlertDialog('Debug Mode Enabled', '<p>🐛 <strong>Debug Mode ENABLED</strong></p><p>Debug save file loaded successfully!</p>');
        })
        .catch(err => {
          console.error('Debug mode: Failed to load debug file:', err);
          showAlertDialog('Debug Mode Error', `<p>❌ Debug mode enabled but failed to load file.</p><p><strong>Error:</strong> ${err.message}</p>`);
          setDebugMode(false); // Revert if loading fails
          updateStatusBar(); // Update status bar
        });
    } else {
      console.log('Debug mode DISABLED');
      showAlertDialog('Debug Mode Disabled', '<p>🐛 <strong>Debug Mode DISABLED</strong></p><p>Page will refresh to return to normal mode.</p>').then(() => {
        location.reload(); // Refresh the page
      });
    }
  }
});

// Header button functionality - Data Values, About, Changelog
document.addEventListener('DOMContentLoaded', () => {
  // Display version number
  const versionElement = document.getElementById('app-version');
  if (versionElement) {
    versionElement.textContent = `v${APP_VERSION}`;
  }

  const headerDataValuesBtn = document.getElementById('tab-data-values');
  const headerAboutBtn = document.getElementById('tab-about');
  const headerChangelogBtn = document.getElementById('tab-changelog');
  const editorContainer = document.getElementById('editor-container');
  
  // Get tab panels container (already exists in HTML)
  const tabPanelsContainer = document.getElementById('tab-panels-container');
  
  // Initialize special panels storage
  if (!editorContainer._specialPanels) {
    editorContainer._specialPanels = {};
  }
  if (!editorContainer._tabPanels) {
    editorContainer._tabPanels = {};
  }

  if (headerDataValuesBtn) {
    headerDataValuesBtn.addEventListener('click', () => {
      const tabPanelsContainer = document.getElementById('tab-panels-container');
      if (!tabPanelsContainer) return;
      
      // Deactivate all editor tab buttons
      document.querySelectorAll('.tabs .tab-button').forEach(b => b.classList.add('outline'));
      
      // Deactivate other header buttons and activate this one
      if (headerAboutBtn) headerAboutBtn.classList.add('outline');
      if (headerChangelogBtn) headerChangelogBtn.classList.add('outline');
      headerDataValuesBtn.classList.remove('outline');
      
      // Hide all children in container
      Array.from(tabPanelsContainer.children).forEach(child => {
        child.style.display = 'none';
      });
      
      // Show or create Data Values
      let dataValuesDiv = tabPanelsContainer.querySelector('.data-values-content');
      if (!dataValuesDiv) {
        dataValuesDiv = document.createElement('div');
        dataValuesDiv.className = 'data-values-content';
        tabPanelsContainer.appendChild(dataValuesDiv);
        createDataValuesViewer(dataValuesDiv);
      }
      dataValuesDiv.style.display = 'block';
    });
  }

  if (headerAboutBtn) {
    headerAboutBtn.addEventListener('click', () => {
      const tabPanelsContainer = document.getElementById('tab-panels-container');
      if (!tabPanelsContainer) return;
      
      // Deactivate all editor tab buttons
      document.querySelectorAll('.tabs .tab-button').forEach(b => b.classList.add('outline'));
      
      // Deactivate other header buttons and activate this one
      if (headerDataValuesBtn) headerDataValuesBtn.classList.add('outline');
      if (headerChangelogBtn) headerChangelogBtn.classList.add('outline');
      headerAboutBtn.classList.remove('outline');
      
      // Hide all children in container
      Array.from(tabPanelsContainer.children).forEach(child => {
        child.style.display = 'none';
      });
      
      // Show or create About
      let aboutDiv = tabPanelsContainer.querySelector('.about-content');
      if (!aboutDiv) {
        aboutDiv = document.createElement('div');
        aboutDiv.className = 'about-content';
        tabPanelsContainer.appendChild(aboutDiv);
        createAboutViewer(aboutDiv);
      }
      aboutDiv.style.display = 'block';
    });
  }

  if (headerChangelogBtn) {
    headerChangelogBtn.addEventListener('click', () => {
      const tabPanelsContainer = document.getElementById('tab-panels-container');
      if (!tabPanelsContainer) return;
      
      // Deactivate all editor tab buttons
      document.querySelectorAll('.tabs .tab-button').forEach(b => b.classList.add('outline'));
      
      // Deactivate other header buttons and activate this one
      if (headerDataValuesBtn) headerDataValuesBtn.classList.add('outline');
      if (headerAboutBtn) headerAboutBtn.classList.add('outline');
      headerChangelogBtn.classList.remove('outline');
      
      // Hide all children in container
      Array.from(tabPanelsContainer.children).forEach(child => {
        child.style.display = 'none';
      });
      
      // Show or create Changelog
      let changelogDiv = tabPanelsContainer.querySelector('.changelog-content');
      if (!changelogDiv) {
        changelogDiv = document.createElement('div');
        changelogDiv.className = 'changelog-content';
        tabPanelsContainer.appendChild(changelogDiv);
        createChangelogViewer(changelogDiv);
      }
      changelogDiv.style.display = 'block';
    });
  }
});
