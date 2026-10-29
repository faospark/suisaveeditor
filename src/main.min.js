// Main Application Logic

// Import configurations and utilities
import { APP_VERSION, FIELD_CONFIG, EDITOR_GROUPS, GROUP_PATHS } from './config/index.js';
import { isDebugMode, loadDebugFile, setDebugMode, toggleDebugMode, initStatusBar, updateStatusBar, updateSaveFileIndicator, extractSaveNumber, markdownToHTML } from './utils/index.js';
import GameData from './gamedata.js';
import {
  createBattleCharactersEditor,
  createPartyMembersEditor,
  createKeyItemsEditor,
  createRecruitmentEditor,
  createTableEditor,
  createBathItemsEditor,
  createKnownRecipesEditor,
  createLibraryBooksEditor,
  createCastleFlagsEditor,
  createCastleFlagsRawEditor,
  createRichmondDetectiveEditor,
  createTreasureChestsEditor,
  createWarRoomEditor,
  createSideQuestsAndCountersEditor,
  createFishingRecordsEditor,
  createKitchenStockEditor,
  createGuardianDeityEditor
} from './editors/index.js';
import { COOK_OFF_STAGES, EVENT_FLAG_INDEX, CLIVE_MILESTONES } from './config/constants.js';
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
    
    const restore = await showConfirmDialog('Unsaved Work Detected', message, 'Restore', 'Discard');
    
    if (restore) {
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
  food_menu: createFoodMenuEditor,
  castle_editors_combined: null, // Defined later
  location: null, // Defined later
  known_recipes: createKnownRecipesEditor,
  library_books: createLibraryBooksEditor,
  guardian_deity: createGuardianDeityEditor,
  castle_flags: createCastleFlagsEditor,
  castle_flags_raw: createCastleFlagsRawEditor,
  richmond_detective: createRichmondDetectiveEditor,
  treasure_chests: createTreasureChestsEditor,
  war_room: createWarRoomEditor,
  side_quests: createSideQuestsAndCountersEditor,
  fishing_records: createFishingRecordsEditor,
  kitchen_stock: createKitchenStockEditor
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
    return createElementForValue(value, label, (newValue) => {
      targetData[key] = newValue;
    }, targetData);
  }

  const onChange = (newValue) => {
    if (newValue !== undefined) {
      targetData[key] = newValue;
    }
  };

  switch (renderer) {
    case 'table':
      const columns = config.columns;
      return editorFactory(value, label, onChange, columns);
    
    case 'battle_characters':
      const charaFlag = data.chara_flag || data.game_data?.chara_flag;
      return editorFactory(value, label, onChange, createElementForValue, FIELD_CONFIG, charaFlag, data);
    
    case 'recruitment':
      return editorFactory(value, label, onChange, data);
    
    case 'castle_editors_combined':
      return editorFactory(data, targetData);
    
    case 'cook_off_progress':
      return editorFactory(data, label, onChange);
    
    case 'location':
      return editorFactory(data, label, () => {});

    case 'library_books':
      return editorFactory(value, label, onChange, targetData);

    case 'guardian_deity':
      return editorFactory(value, label, onChange, targetData);

    case 'richmond_detective':
      return editorFactory(value, label, onChange, data);

    case 'fishing_records':
      return editorFactory(value, label, onChange, data);

    case 'kitchen_stock':
      return editorFactory(value, label, onChange, data);

    case 'side_quests':
      return editorFactory(data, onChange);

    case 'castle_flags_raw':
      return editorFactory(value, label, onChange);
    
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
  const placeholder = container.querySelector('p');
  if (placeholder && placeholder.textContent.includes('Please load a JSON file')) {
    placeholder.remove();
  }

  let tabContainer = document.getElementById('editor-tabs');
  if (!tabContainer) {
    tabContainer = document.createElement('div');
    tabContainer.id = 'editor-tabs';
    const tabPanelsContainer = document.getElementById('tab-panels-container');
    if (tabPanelsContainer) {
      container.insertBefore(tabContainer, tabPanelsContainer);
    } else {
      container.appendChild(tabContainer);
    }
  }
  
  tabContainer.innerHTML = '';
  tabContainer.className = 'tabs';

  const tabsLeft = document.createElement('div');
  tabsLeft.className = 'tabs-left';

  const tabsRight = document.createElement('div');
  tabsRight.className = 'tabs-right';

  let tabPanelsContainer = document.getElementById('tab-panels-container');
  if (!tabPanelsContainer) {
    tabPanelsContainer = document.createElement('div');
    tabPanelsContainer.id = 'tab-panels-container';
    tabPanelsContainer.className = 'tab-content';
    container.appendChild(tabPanelsContainer);
  } else {
    const regularPanels = tabPanelsContainer.querySelectorAll('.tab-panel:not(.special-panel)');
    regularPanels.forEach(p => p.remove());
  }

  const groupKeys = Object.keys(EDITOR_GROUPS);
  let activeTab = groupKeys[0];
  const tabButtons = {};
  const tabPanels = {};
  const specialPanels = container._specialPanels || {};

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
    
    renderTabContent(panel, groupName, data, onUpdate);
  });

  groupKeys.forEach(groupName => {
    const btn = document.createElement('button');
    btn.textContent = groupName;
    btn.className = 'tab-button outline';
    btn.id = `tab-${groupName.toLowerCase().replace(/\s+/g, '-')}`;
    btn.dataset.tabName = groupName;

    if (groupName === activeTab) btn.classList.remove('outline');

    tabButtons[groupName] = btn;

    btn.addEventListener('click', () => {
      Object.values(tabButtons).forEach(b => b.classList.add('outline'));
      btn.classList.remove('outline');
      
      const headerButtons = document.querySelectorAll('.tabs-right .tab-button');
      headerButtons.forEach(b => b.classList.add('outline'));

      Array.from(tabPanelsContainer.children).forEach(child => {
        child.style.display = 'none';
      });
      
      tabPanels[groupName].style.display = 'block';
    });

    tabsLeft.appendChild(btn);
  });

  tabContainer.appendChild(tabsLeft);
  
  const saveFileIndicator = document.createElement('div');
  saveFileIndicator.id = 'save-file-indicator';
  saveFileIndicator.className = 'save-file-indicator';
  saveFileIndicator.style.cssText = 'display: flex; align-items: center; padding: 0.4rem 0.8rem; font-size: 0.75rem; font-weight: 600; color: var(--pico-primary); background: rgba(var(--pico-primary-rgb, 52, 152, 219), 0.1); border-radius: 6px;';
  
  const saveNumber = extractSaveNumber(currentFileName);
  saveFileIndicator.textContent = saveNumber ? `Save File #${saveNumber}` : `Editing: ${currentFileName}`;
  
  tabsRight.appendChild(saveFileIndicator);
  tabContainer.appendChild(tabsRight);
  
  container.dataset.editorInitialized = 'true';
  container._specialPanels = specialPanels;
  container._tabPanels = tabPanels;
}

function renderTabContent(container, group, data, onUpdate) {
  container.innerHTML = '';

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

  // RENDERS: General / Experimental Tabs - checks game_data, party_data, and root level for fields
  if (groupPath === null) {
    if (group === 'General') {
      renderGeneralTab(container, data);
      return;
    }
    keys.forEach(key => {
      const config = FIELD_CONFIG[key];
      if (!config) return;

      if (key === 'location') {
        const element = createLocationEditor(data, 'Map Location', () => { });
        container.appendChild(element);
        return;
      }

      if (key === 'cook_off_progress') {
        const element = createCookOffProgressEditor(data, 'Cook-Off Battles Won', () => { });
        container.appendChild(element);
        return;
      }

      if (key === 'side_quests') {
        const element = createSideQuestsAndCountersEditor(data, () => { });
        container.appendChild(element);
        return;
      }

      let value, sourceData;
      if (key === 'hon_flag_raw') {
        value = data.hon_flag || data.game_data?.hon_flag;
        sourceData = data.hon_flag ? data : data.game_data;
      } else if (data.game_data && data.game_data[key] !== undefined) {
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

  keys.forEach(key => {
    if (targetData[key] === undefined) return;

    const config = FIELD_CONFIG[key];
    if (!config) return;

    const label = config.label || key;
    const renderer = config.renderer;

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
// GENERAL TAB - INVESTIGATION STYLE & THEME
// RENDERS: Unified cohesive card layouts matching the Investigations tab aesthetic
// ============================================================================

function renderGeneralTab(container, data) {
  const gd = data.game_data || {};
  const pd = data.party_data || {};

  const getFieldInfo = (key) => {
    if (gd && gd[key] !== undefined) return { obj: gd, val: gd[key] };
    if (pd && pd[key] !== undefined) return { obj: pd, val: pd[key] };
    if (data && data[key] !== undefined) return { obj: data, val: data[key] };
    return { obj: gd, val: undefined };
  };

  const CARD_STYLE = 'padding: 0.75rem 1rem; border: 1px solid var(--pico-muted-border-color); border-radius: 6px; background: rgba(0,0,0,0.12); margin-bottom: 1rem;';
  const HEADER_STYLE = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; border-bottom: 1px solid var(--pico-muted-border-color); padding-bottom: 0.4rem; flex-wrap: wrap; gap: 0.5rem;';
  const CHIP_STYLE = 'padding: 0.45rem 0.65rem; background: rgba(0,0,0,0.15); border-radius: 4px; border: 1px solid var(--pico-muted-border-color); display: flex; flex-direction: column; gap: 0.25rem;';
  const LABEL_STYLE = 'font-size: 0.73rem; font-weight: bold; margin-bottom: 0; color: var(--pico-color);';
  const INPUT_STYLE = 'margin-bottom: 0; font-size: 0.8rem; padding: 0.25rem 0.45rem;';

  const createCard = (titleHtml, rightElement = null) => {
    const card = document.createElement('div');
    card.className = 'json-object general-card';
    card.style.cssText = CARD_STYLE;

    const header = document.createElement('div');
    header.style.cssText = HEADER_STYLE;

    const title = document.createElement('strong');
    title.style.fontSize = '0.85rem';
    title.innerHTML = titleHtml;
    header.appendChild(title);

    if (rightElement) {
      header.appendChild(rightElement);
    }

    card.appendChild(header);
    return card;
  };

  const createChip = (labelStr, inputEl) => {
    const chip = document.createElement('div');
    chip.style.cssText = CHIP_STYLE;

    const lbl = document.createElement('label');
    lbl.textContent = labelStr;
    lbl.style.cssText = LABEL_STYLE;
    chip.appendChild(lbl);

    chip.appendChild(inputEl);
    return chip;
  };

  // 1. Party Members Card
  const partyInfo = getFieldInfo('party_cha_no');
  const partyArr = partyInfo.val;
  if (Array.isArray(partyArr)) {
    const badge = document.createElement('span');
    badge.style.cssText = 'font-size: 0.8rem; color: var(--pico-primary); font-weight: bold; margin-left: auto;';
    badge.textContent = '6 Battle + 2 Convoy Slots';

    const card = createCard('⚔️ Active Party Members & Convoy (party_cha_no)', badge);

    const desc = document.createElement('div');
    desc.style.cssText = 'font-size: 0.75rem; color: var(--pico-muted-color); margin-bottom: 0.6rem;';
    desc.textContent = 'First 6 slots are battle combatants (IDs 1–83); last 2 slots are convoy members (full roster IDs 1–124).';
    card.appendChild(desc);

    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.6rem;';

    const maxSlots = Math.min(partyArr.length, 8);
    for (let i = 0; i < maxSlots; i++) {
      const isBattle = i < 6;
      const slotTitle = isBattle ? `⚔️ Battle Slot ${i + 1}` : `🛡️ Convoy Slot ${i - 5}`;

      const sel = document.createElement('select');
      sel.style.cssText = INPUT_STYLE;

      const noneOpt = document.createElement('option');
      noneOpt.value = 0;
      noneOpt.textContent = '0: None';
      sel.appendChild(noneOpt);

      if (GameData && GameData.CHARACTERS) {
        const maxId = isBattle ? 83 : 124;
        for (let id = 1; id <= maxId; id++) {
          const char = GameData.CHARACTERS[id];
          if (char) {
            const opt = document.createElement('option');
            opt.value = id;
            const name = typeof char === 'string' ? char : (char.name || `Char ${id}`);
            opt.textContent = `${id}: ${name}`;
            sel.appendChild(opt);
          }
        }
      }

      sel.value = partyArr[i] || 0;
      sel.addEventListener('change', (e) => {
        partyArr[i] = parseInt(e.target.value) || 0;
      });

      grid.appendChild(createChip(slotTitle, sel));
    }

    card.appendChild(grid);
    container.appendChild(card);
  }

  // 2. World Location Card
  const locCard = createCard('🗺️ World & Map Location');
  const locGrid = document.createElement('div');
  locGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 0.6rem;';

  const locFields = [
    { label: 'Area Location', key: 'area_no' },
    { label: 'Town No', key: 'town_no' },
    { label: 'Map No', key: 'map_no' },
    { label: 'Player X Coord', key: 'px' },
    { label: 'Player Y Coord', key: 'py' }
  ];

  locFields.forEach(f => {
    const fInfo = getFieldInfo(f.key);
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.value = fInfo.val !== undefined ? fInfo.val : 0;
    inp.style.cssText = INPUT_STYLE;
    inp.addEventListener('input', (e) => {
      fInfo.obj[f.key] = parseFloat(e.target.value) || 0;
    });
    locGrid.appendChild(createChip(f.label, inp));
  });

  locCard.appendChild(locGrid);
  container.appendChild(locCard);

  // 3. Play Time & Clive Quest Card
  const timeInfo = getFieldInfo('play_time');
  const timeArr = timeInfo.val;
  if (Array.isArray(timeArr)) {
    const btnGroup = document.createElement('div');
    btnGroup.style.cssText = 'display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;';

    const resetCliveBtn = document.createElement('button');
    resetCliveBtn.type = 'button';
    resetCliveBtn.className = 'outline';
    resetCliveBtn.textContent = '⏱️ Set Hours = 1';
    resetCliveBtn.title = 'Sets play time hours to 1 to make all quest cutoffs viable';
    resetCliveBtn.style.cssText = 'font-size: 0.72rem; padding: 0.25rem 0.5rem; margin-bottom: 0;';

    const completeCliveBtn = document.createElement('button');
    completeCliveBtn.type = 'button';
    completeCliveBtn.className = 'outline';
    completeCliveBtn.textContent = '✅ Toggle All Done (Flag 94)';
    completeCliveBtn.title = 'Toggles all Clive quest milestones as completed (event_flag[94] = 255 / 0)';
    completeCliveBtn.style.cssText = 'font-size: 0.72rem; padding: 0.25rem 0.5rem; margin-bottom: 0;';

    btnGroup.appendChild(resetCliveBtn);
    btnGroup.appendChild(completeCliveBtn);

    const timeCard = createCard('⏱️ Play Time & Clive Quest Tracker', btnGroup);

    const timeGrid = document.createElement('div');
    timeGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.6rem; margin-bottom: 0.6rem;';

    const timeLabels = ['Hours (0–999)', 'Minutes (0–59)', 'Seconds (0–59)'];
    const timeInputs = [];

    const cliveBox = document.createElement('div');
    cliveBox.style.cssText = 'display: flex; flex-direction: column; gap: 0.4rem; padding: 0.5rem 0.65rem; background: rgba(0,0,0,0.15); border-radius: 4px; border: 1px solid var(--pico-muted-border-color);';

    const updateCliveBadges = () => {
      const hrs = timeArr[0] || 0;
      const flagIdx = EVENT_FLAG_INDEX.CLIVE_QUEST || 94;
      const flags = Array.isArray(data.event_flag) ? data.event_flag : [];
      const currentMask = Number(flags[flagIdx] || 0);

      cliveBox.innerHTML = '';

      const topRow = document.createElement('div');
      topRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.2rem;';

      const labelStrong = document.createElement('strong');
      labelStrong.style.fontSize = '0.74rem';
      labelStrong.innerHTML = `⏱️ Clive Quest Cutoffs & Milestones <span style="font-weight: normal; font-size: 0.68rem; color: var(--pico-muted-color);">(event_flag[${flagIdx}]: 0x${currentMask.toString(16).padStart(2, '0').toUpperCase()} / ${currentMask})</span>`;
      topRow.appendChild(labelStrong);

      const hintSpan = document.createElement('span');
      hintSpan.style.cssText = 'font-size: 0.68rem; color: var(--pico-muted-color);';
      hintSpan.textContent = '💡 Click any milestone to toggle Done/Open';
      topRow.appendChild(hintSpan);
      cliveBox.appendChild(topRow);

      const badgeGrid = document.createElement('div');
      badgeGrid.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center;';

      const milestones = CLIVE_MILESTONES || [
        { bit: 0x01, name: 'Muse', label: 'Muse (<3h)', limit: 3, desc: 'Elza encounter at Muse City entrance gate' },
        { bit: 0x02, name: 'South Window', label: 'South Window (Join)', limit: null, desc: 'Clive recruited into party' },
        { bit: 0x04, name: 'Lakewest', label: 'Lakewest (<11h)', limit: 11, desc: "Elza's letter at Lakewest Inn" },
        { bit: 0x08, name: 'Forest Village', label: 'Forest Village (<13h)', limit: 13, desc: "Elza lookalike at Village Elder's house" },
        { bit: 0x10, name: 'Rockaxe', label: 'Rockaxe (Info)', limit: null, desc: 'Guild pursuit intelligence gathered' },
        { bit: 0x20, name: 'Radat', label: 'Radat (<14h)', limit: 14, desc: 'Hostage standoff at Radat Tavern' },
        { bit: 0x40, name: 'Muse Hill', label: 'Muse Hill (<15h)', limit: 15, desc: 'Jowston Hill confrontation after Muse liberation' },
        { bit: 0x80, name: 'Sajah Finale', label: 'Sajah Finale (<20h)', limit: 20, desc: 'Final duel and conclusion with Elza' }
      ];

      milestones.forEach(m => {
        const isDone = (currentMask & m.bit) !== 0;
        const isExpired = !isDone && m.limit !== null && hrs >= m.limit;

        const badge = document.createElement('button');
        badge.type = 'button';

        let icon = '⏳';
        let statusText = 'Open';
        let bg = 'rgba(52, 152, 219, 0.15)';
        let borderCol = 'rgba(52, 152, 219, 0.4)';
        let textCol = '#3498db';

        if (isDone) {
          icon = '✓';
          statusText = 'Done';
          bg = 'rgba(46, 204, 113, 0.18)';
          borderCol = 'rgba(46, 204, 113, 0.45)';
          textCol = 'var(--pico-ins-color)';
        } else if (isExpired) {
          icon = '✗';
          statusText = 'Expired';
          bg = 'rgba(231, 76, 60, 0.15)';
          borderCol = 'rgba(231, 76, 60, 0.4)';
          textCol = 'var(--pico-del-color)';
        }

        badge.innerHTML = `<span style="font-weight: 700; margin-right: 0.2rem;">${icon}</span> ${m.label} <span style="font-size: 0.65rem; opacity: 0.85; padding-left: 0.15rem;">[${statusText}]</span>`;
        badge.style.cssText = `font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600; background: ${bg}; border: 1px solid ${borderCol}; color: ${textCol}; cursor: pointer; margin-bottom: 0; line-height: 1.2; transition: filter 0.15s ease;`;
        badge.title = `${m.name}: ${m.desc}\nStatus: ${statusText}\nBit: 0x${m.bit.toString(16).toUpperCase()} (${m.bit})\nClick to toggle completion`;

        badge.addEventListener('mouseenter', () => { badge.style.filter = 'brightness(1.25)'; });
        badge.addEventListener('mouseleave', () => { badge.style.filter = 'none'; });

        badge.addEventListener('click', () => {
          if (!Array.isArray(data.event_flag)) {
            data.event_flag = new Array(256).fill(0);
          }
          data.event_flag[flagIdx] = (Number(data.event_flag[flagIdx]) || 0) ^ m.bit;
          hasUnsavedChanges = true;
          autoSaveToLocalStorage();
          updateCliveBadges();
        });

        badgeGrid.appendChild(badge);
      });

      cliveBox.appendChild(badgeGrid);
    };

    timeLabels.forEach((labelStr, i) => {
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.min = '0';
      if (i > 0) inp.max = '59';
      inp.value = timeArr[i] || 0;
      inp.style.cssText = INPUT_STYLE;
      inp.addEventListener('input', (e) => {
        timeArr[i] = Math.max(0, parseInt(e.target.value) || 0);
        hasUnsavedChanges = true;
        autoSaveToLocalStorage();
        updateCliveBadges();
      });
      timeInputs.push(inp);
      timeGrid.appendChild(createChip(labelStr, inp));
    });

    const dateInfo = getFieldInfo('date_time_now');
    if (dateInfo.val !== undefined) {
      const dateInp = document.createElement('input');
      dateInp.type = 'text';
      dateInp.value = dateInfo.val || '';
      dateInp.style.cssText = INPUT_STYLE;
      dateInp.addEventListener('input', (e) => {
        dateInfo.obj['date_time_now'] = e.target.value;
        hasUnsavedChanges = true;
        autoSaveToLocalStorage();
      });
      timeGrid.appendChild(createChip('Last Saved (In-Game)', dateInp));
    }

    resetCliveBtn.addEventListener('click', () => {
      timeArr[0] = 1;
      if (timeInputs[0]) timeInputs[0].value = 1;
      hasUnsavedChanges = true;
      autoSaveToLocalStorage();
      updateCliveBadges();
    });

    completeCliveBtn.addEventListener('click', () => {
      const flagIdx = EVENT_FLAG_INDEX.CLIVE_QUEST || 94;
      if (!Array.isArray(data.event_flag)) {
        data.event_flag = new Array(256).fill(0);
      }
      const cur = Number(data.event_flag[flagIdx]) || 0;
      data.event_flag[flagIdx] = cur === 255 ? 0 : 255;
      hasUnsavedChanges = true;
      autoSaveToLocalStorage();
      updateCliveBadges();
    });

    updateCliveBadges();
    timeCard.appendChild(timeGrid);
    timeCard.appendChild(cliveBox);
    container.appendChild(timeCard);
  }

  // 4. Hero & Legacy Names Card
  const namesCard = createCard('👤 Hero & Legacy Identifiers');
  const namesGrid = document.createElement('div');
  namesGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.6rem;';

  const nameFields = [
    { label: 'Hero Name (Suikoden II)', key: 'bozu_name' },
    { label: 'Hero Real Name', key: 'bozu_name2' },
    { label: 'Hero Name (Suikoden I)', key: 'macd_name' },
    { label: 'HQ Name (Suikoden I)', key: 'm_base_name' }
  ];

  nameFields.forEach(f => {
    const fInfo = getFieldInfo(f.key);
    if (fInfo.val !== undefined) {
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.value = fInfo.val || '';
      inp.style.cssText = INPUT_STYLE;
      inp.addEventListener('input', (e) => {
        fInfo.obj[f.key] = e.target.value;
      });
      namesGrid.appendChild(createChip(f.label, inp));
    }
  });

  namesCard.appendChild(namesGrid);
  container.appendChild(namesCard);

  // 5. Castle Headquarters, Army & Facilities Card
  const maxPotchBtn = document.createElement('button');
  maxPotchBtn.type = 'button';
  maxPotchBtn.className = 'outline';
  maxPotchBtn.textContent = '💰 Max Potch (999,999)';
  maxPotchBtn.style.cssText = 'font-size: 0.72rem; padding: 0.25rem 0.55rem; margin-bottom: 0;';

  const castleCard = createCard('🏰 Castle Headquarters, Army & Finances', maxPotchBtn);
  const castleGrid = document.createElement('div');
  castleGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.6rem;';

  let goldInputRef = null;

  const baseNameInfo = getFieldInfo('base_name');
  if (baseNameInfo.val !== undefined) {
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = baseNameInfo.val || '';
    inp.style.cssText = INPUT_STYLE;
    inp.addEventListener('input', (e) => { baseNameInfo.obj.base_name = e.target.value; });
    castleGrid.appendChild(createChip('Castle Name', inp));
  }

  const teamNameInfo = getFieldInfo('team_name');
  if (teamNameInfo.val !== undefined) {
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.value = teamNameInfo.val || '';
    inp.style.cssText = INPUT_STYLE;
    inp.addEventListener('input', (e) => { teamNameInfo.obj.team_name = e.target.value; });
    castleGrid.appendChild(createChip('Army / Unit Name', inp));
  }

  const goldInfo = getFieldInfo('gold');
  if (goldInfo.val !== undefined) {
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.min = '0';
    inp.max = '999999';
    inp.value = goldInfo.val || 0;
    inp.style.cssText = INPUT_STYLE;
    inp.addEventListener('input', (e) => { goldInfo.obj.gold = Math.max(0, parseInt(e.target.value) || 0); });
    goldInputRef = inp;
    castleGrid.appendChild(createChip('Potch (Gold)', inp));
  }

  const baseLvInfo = getFieldInfo('base_lv');
  if (baseLvInfo.val !== undefined) {
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.min = '1';
    inp.max = '4';
    inp.value = baseLvInfo.val || 1;
    inp.style.cssText = INPUT_STYLE;
    inp.addEventListener('input', (e) => { baseLvInfo.obj.base_lv = parseInt(e.target.value) || 1; });
    castleGrid.appendChild(createChip('Castle Level (1–4)', inp));
  }

  const ninkiInfo = getFieldInfo('ninki');
  if (ninkiInfo.val !== undefined) {
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.min = '0';
    inp.value = ninkiInfo.val || 0;
    inp.style.cssText = INPUT_STYLE;
    inp.addEventListener('input', (e) => {
      ninkiInfo.obj.ninki = parseInt(e.target.value) || 0;
    });
    castleGrid.appendChild(createChip('Popularity (ninki)', inp));
  }

  const furoInfo = getFieldInfo('furo_info');
  if (Array.isArray(furoInfo.val)) {
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.value = furoInfo.val[0] || 0;
    inp.readOnly = true;
    inp.style.cssText = INPUT_STYLE + ' opacity: 0.65; cursor: not-allowed;';
    inp.title = 'Bath House Level is derived from game data';
    castleGrid.appendChild(createChip('Bath House Level (furo_info)', inp));
  }

  const kajiInfo = getFieldInfo('kaji_lv');
  if (kajiInfo.val !== undefined) {
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.min = '1';
    inp.max = '16';
    inp.value = kajiInfo.val || 1;
    inp.style.cssText = INPUT_STYLE;
    inp.addEventListener('input', (e) => {
      kajiInfo.obj.kaji_lv = parseInt(e.target.value) || 1;
    });
    castleGrid.appendChild(createChip('Blacksmith Level (kaji_lv)', inp));
  }

  const nakamInfo = getFieldInfo('nakam_1_num');
  if (nakamInfo.val !== undefined) {
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.value = nakamInfo.val || 0;
    inp.readOnly = true;
    inp.style.cssText = INPUT_STYLE + ' opacity: 0.65; cursor: not-allowed;';
    inp.title = 'Suikoden 1 Stars count loaded from transferred save';
    castleGrid.appendChild(createChip('S1 Stars Recruited ⭐', inp));
  }

  maxPotchBtn.addEventListener('click', () => {
    goldInfo.obj.gold = 999999;
    if (goldInputRef) goldInputRef.value = 999999;
  });

  castleCard.appendChild(castleGrid);
  container.appendChild(castleCard);

  // 6. Greenhill Mission Aliases Card
  const aliasesInfo = getFieldInfo('kari_name');
  const aliasesArr = aliasesInfo.val;
  if (Array.isArray(aliasesArr) && aliasesArr.length > 0) {
    const aliasesCard = createCard('🎓 Greenhill Mission Aliases (kari_name)');

    const desc = document.createElement('div');
    desc.style.cssText = 'font-size: 0.75rem; color: var(--pico-muted-color); margin-bottom: 0.6rem;';
    desc.textContent = 'Cover names used during the Greenhill Academy infiltration mission.';
    aliasesCard.appendChild(desc);

    const aliasesGrid = document.createElement('div');
    aliasesGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.6rem;';

    const aliasLabels = ["Hero's Alias", "Nanami's Alias", "Flik's Alias (Fixed)"];
    for (let i = 0; i < Math.min(aliasesArr.length, 3); i++) {
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.value = aliasesArr[i] || '';
      inp.style.cssText = INPUT_STYLE;

      if (i === 2) {
        inp.readOnly = true;
        inp.style.cssText += ' opacity: 0.65; cursor: not-allowed;';
        inp.title = "Flik's alias is hardcoded/read-only in game";
      } else {
        inp.addEventListener('input', (e) => {
          aliasesArr[i] = e.target.value;
        });
      }

      aliasesGrid.appendChild(createChip(aliasLabels[i] || `Alias ${i + 1}`, inp));
    }

    aliasesCard.appendChild(aliasesGrid);
    container.appendChild(aliasesCard);
  }

  // 7. Side-Quests, Beasts & Battle Counters Card
  const sideCard = createCard('🎖️ Side-Quests, Beasts & Battle Counters');
  const sideGrid = document.createElement('div');
  sideGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.6rem;';

  const gordonInfo = getFieldInfo('trade_transaction_total');
  if (gordonInfo.val !== undefined) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display: flex; gap: 0.4rem; align-items: center;';

    const inp = document.createElement('input');
    inp.type = 'number';
    inp.min = '0';
    inp.value = gordonInfo.val || 0;
    inp.style.cssText = INPUT_STYLE + ' flex: 1;';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'outline';
    btn.textContent = 'Set 50k';
    btn.style.cssText = 'font-size: 0.7rem; padding: 0.25rem 0.5rem; margin-bottom: 0; white-space: nowrap;';

    const badge = document.createElement('span');
    badge.style.cssText = 'font-size: 0.7rem; font-weight: bold; white-space: nowrap;';

    const updateGordon = () => {
      const val = gordonInfo.obj.trade_transaction_total || 0;
      if (val >= 50000) {
        badge.textContent = '✓ Eligible';
        badge.style.color = 'var(--pico-ins-color)';
      } else {
        badge.textContent = `${val.toLocaleString()} / 50k`;
        badge.style.color = '#f39c12';
      }
    };

    inp.addEventListener('input', (e) => {
      gordonInfo.obj.trade_transaction_total = Math.max(0, parseInt(e.target.value) || 0);
      updateGordon();
    });

    btn.addEventListener('click', () => {
      gordonInfo.obj.trade_transaction_total = 50000;
      inp.value = 50000;
      updateGordon();
    });

    updateGordon();
    wrap.appendChild(inp);
    wrap.appendChild(btn);
    wrap.appendChild(badge);
    sideGrid.appendChild(createChip("Gordon's Trading Volume", wrap));
  }

  const beastsInfo = getFieldInfo('l_mon_no');
  if (Array.isArray(beastsInfo.val)) {
    const beastOptions = [
      { id: 0, name: '0: None' },
      { id: 49, name: '49: Abizboah (Kraken)' },
      { id: 50, name: '50: Feather (Griffin)' },
      { id: 72, name: '72: Siegfried (Unicorn)' },
      { id: 74, name: '74: Rulodia (Kraken Wife)' },
      { id: 79, name: '79: Chuchara (Baby Kraken)' }
    ];

    for (let slot = 0; slot < Math.min(beastsInfo.val.length, 2); slot++) {
      const sel = document.createElement('select');
      sel.style.cssText = INPUT_STYLE;

      beastOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = String(opt.id);
        option.textContent = opt.name;
        sel.appendChild(option);
      });

      const currentVal = beastsInfo.val[slot] || 0;
      if (currentVal && !beastOptions.some(b => b.id === currentVal)) {
        const extraOpt = document.createElement('option');
        extraOpt.value = String(currentVal);
        const charName = GameData?.CHARACTERS?.[currentVal]?.name || 'Unknown Monster';
        extraOpt.textContent = String(currentVal) + ': ' + String(charName);
        sel.appendChild(extraOpt);
      }
      sel.value = String(currentVal);
      sel.addEventListener('change', (e) => {
        beastsInfo.val[slot] = parseInt(e.target.value) || 0;
      });

      sideGrid.appendChild(createChip(`Listening Crystal Beast #${slot + 1}`, sel));
    }
  }

  const nigeInfo = getFieldInfo('nige_cnt');
  if (nigeInfo.val !== undefined) {
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.min = '0';
    inp.value = nigeInfo.val || 0;
    inp.style.cssText = INPUT_STYLE;
    inp.addEventListener('input', (e) => {
      nigeInfo.obj.nige_cnt = Math.max(0, parseInt(e.target.value) || 0);
    });
    sideGrid.appendChild(createChip('Escaped Battles (nige_cnt)', inp));
  }

  const suriInfo = getFieldInfo('suri_potch');
  if (suriInfo.val !== undefined) {
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.min = '0';
    inp.value = suriInfo.val || 0;
    inp.style.cssText = INPUT_STYLE;
    inp.addEventListener('input', (e) => {
      suriInfo.obj.suri_potch = Math.max(0, parseInt(e.target.value) || 0);
    });
    sideGrid.appendChild(createChip('Pickpocketed Potch (suri_potch)', inp));
  }

  const lukaInfo = getFieldInfo('luka_hp');
  if (lukaInfo.val !== undefined) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display: flex; gap: 0.4rem; align-items: center;';

    const inp = document.createElement('input');
    inp.type = 'number';
    inp.min = '0';
    inp.value = lukaInfo.val || 0;
    inp.style.cssText = INPUT_STYLE + ' flex: 1;';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'outline';
    btn.textContent = 'Set 0 (Instant Kill)';
    btn.style.cssText = 'font-size: 0.7rem; padding: 0.25rem 0.5rem; margin-bottom: 0; white-space: nowrap;';

    inp.addEventListener('input', (e) => {
      lukaInfo.obj.luka_hp = Math.max(0, parseInt(e.target.value) || 0);
    });

    btn.addEventListener('click', () => {
      lukaInfo.obj.luka_hp = 0;
      inp.value = 0;
    });

    wrap.appendChild(inp);
    wrap.appendChild(btn);
    sideGrid.appendChild(createChip('Luca Blight Ambush HP (luka_hp)', wrap));
  }

  sideCard.appendChild(sideGrid);
  container.appendChild(sideCard);
}

// ============================================================================
// PLAY TIME & CLIVE QUEST TIMER EDITOR
// RENDERS: Play time (Hours, Minutes, Seconds) + Live Clive Quest Milestone Badges
// ============================================================================

function createPlayTimeEditor(arr, key, updateCallback) {
  const div = document.createElement('div');
  div.className = 'json-item';
  div.id = 'play-time-editor';
  div.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; background: rgba(0,0,0,0.1); border-radius: 6px; margin-bottom: 1rem;';

  const topRow = document.createElement('div');
  topRow.style.cssText = 'display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem;';

  const label = document.createElement('label');
  label.textContent = key;
  label.style.cssText = 'font-weight: bold; margin-bottom: 0;';
  topRow.appendChild(label);

  const fieldsContainer = document.createElement('div');
  fieldsContainer.style.cssText = 'display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end;';

  const timeLabels = ['Hours', 'Minutes', 'Seconds'];
  const inputs = [];

  // Clive Quest Milestone Status Strip
  const cliveBox = document.createElement('div');
  cliveBox.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; font-size: 0.72rem; padding-top: 0.5rem; border-top: 1px solid var(--pico-muted-border-color);';

  const cliveMilestones = [
    { name: 'Muse (<3h)', limit: 3 },
    { name: 'Lakewest (<11h)', limit: 11 },
    { name: 'Forest Village (<13h)', limit: 13 },
    { name: 'Radat (<14h)', limit: 14 },
    { name: 'Muse Hill (<15h)', limit: 15 },
    { name: 'Sajah Finale (<20h)', limit: 20 }
  ];

  const updateCliveStatus = () => {
    const hrs = arr[0] || 0;
    cliveBox.innerHTML = '<strong style="margin-right: 0.25rem;">⏱️ Clive Quest Cutoffs:</strong>';
    cliveMilestones.forEach(m => {
      const ok = hrs < m.limit;
      const badge = document.createElement('span');
      badge.textContent = `${ok ? '✓' : '✗'} ${m.name}`;
      badge.style.cssText = `padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 600; background: rgba(0,0,0,0.2); color: ${ok ? 'var(--pico-ins-color)' : 'var(--pico-del-color)'};`;
      cliveBox.appendChild(badge);
    });
  };

  timeLabels.forEach((timeLabel, i) => {
    const fieldGroup = document.createElement('div');
    fieldGroup.style.cssText = 'display: flex; flex-direction: column; gap: 0.25rem;';

    const fieldLabel = document.createElement('label');
    fieldLabel.textContent = timeLabel;
    fieldLabel.style.cssText = 'font-size: 0.8rem; margin-bottom: 0;';
    fieldGroup.appendChild(fieldLabel);

    const input = document.createElement('input');
    input.type = 'number';
    input.value = arr[i] || 0;
    input.style.cssText = 'width: 85px; margin-bottom: 0;';

    if (i === 0) {
      input.min = '0';
      input.max = '999';
    } else {
      input.min = '0';
      input.max = '59';
    }

    input.addEventListener('input', (e) => {
      let value = parseFloat(e.target.value) || 0;
      const min = parseFloat(input.min);
      const max = parseFloat(input.max);
      if (value < min) value = min;
      if (value > max) value = max;
      e.target.value = value;
      arr[i] = value;
      if (i === 0) updateCliveStatus();
    });

    inputs.push(input);
    fieldGroup.appendChild(input);
    fieldsContainer.appendChild(fieldGroup);
  });

  const resetCliveBtn = document.createElement('button');
  resetCliveBtn.type = 'button';
  resetCliveBtn.className = 'outline';
  resetCliveBtn.textContent = '⏱️ Set Hours = 1 (Unlock All Clive Cutoffs)';
  resetCliveBtn.style.cssText = 'font-size: 0.75rem; padding: 0.4rem 0.75rem; margin-bottom: 0;';
  resetCliveBtn.addEventListener('click', () => {
    arr[0] = 1;
    if (inputs[0]) inputs[0].value = 1;
    updateCliveStatus();
  });
  fieldsContainer.appendChild(resetCliveBtn);

  updateCliveStatus();
  topRow.appendChild(fieldsContainer);
  div.appendChild(topRow);
  div.appendChild(cliveBox);
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
  wrapper.style.cssText = 'margin-bottom: 1rem; margin-top: 1rem;';

  if (sourceData['kari_name']) {
    const aliasesSection = createGreenhillAliasesEditor(sourceData['kari_name'], 'Greenhill Mission Aliases', (newValue) => {
      sourceData['kari_name'] = newValue;
    });
    wrapper.appendChild(aliasesSection);
  }

  return wrapper;
}


// ============================================================================
// FOOD MENU EDITOR
// RENDERS: Castle Restaurant Menu (food_menu) on Cooking Tab
// ============================================================================

function createFoodMenuEditor(arr, key, updateCallback) {
  const card = document.createElement('div');
  card.className = 'json-object food-menu-editor';
  card.style.cssText = 'padding: 0.75rem 1rem; border: 1px solid var(--pico-muted-border-color); border-radius: 6px; background: rgba(0,0,0,0.12); margin-bottom: 1rem;';

  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; border-bottom: 1px solid var(--pico-muted-border-color); padding-bottom: 0.4rem;';

  const title = document.createElement('strong');
  title.style.fontSize = '0.85rem';
  title.textContent = '📋 ' + (key || 'Castle Restaurant Menu (food_menu)');
  header.appendChild(title);

  const clearAllBtn = document.createElement('button');
  clearAllBtn.type = 'button';
  clearAllBtn.className = 'secondary outline';
  clearAllBtn.textContent = '✗ Clear Menu (All None)';
  clearAllBtn.style.cssText = 'font-size: 0.72rem; padding: 0.25rem 0.55rem; margin-bottom: 0;';
  header.appendChild(clearAllBtn);
  card.appendChild(header);

  const menuContainer = document.createElement('div');
  menuContainer.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0.6rem;';

  const selects = [];
  const slotCount = (arr && Array.isArray(arr) && arr.length > 0) ? arr.length : 7;

  for (let index = 0; index < slotCount; index++) {
    const recipeId = (arr && arr[index] !== undefined) ? arr[index] : 0;
    const menuGroup = document.createElement('div');
    menuGroup.style.cssText = 'display: flex; flex-direction: column; gap: 0.25rem; padding: 0.4rem 0.6rem; background: rgba(0,0,0,0.15); border-radius: 4px;';

    const slotLabel = document.createElement('label');
    slotLabel.textContent = `Course Slot ${index + 1}:`;
    slotLabel.style.cssText = 'font-size: 0.73rem; font-weight: bold; margin-bottom: 0;';
    menuGroup.appendChild(slotLabel);

    const select = document.createElement('select');
    select.style.cssText = 'margin-bottom: 0; font-size: 0.75rem; padding: 0.3rem 0.5rem;';

    const noneOption = document.createElement('option');
    noneOption.value = 0;
    noneOption.textContent = '0: None';
    select.appendChild(noneOption);

    if (GameData && GameData.FOOD) {
      Object.entries(GameData.FOOD).forEach(([id, foodItem]) => {
        if (id !== '0') {
          const option = document.createElement('option');
          option.value = id;
          const foodName = typeof foodItem === 'string' ? foodItem : (foodItem.name || `Food ${id}`);
          option.textContent = `${id}: ${foodName}`;
          select.appendChild(option);
        }
      });
    }

    select.value = recipeId;

    select.addEventListener('change', (e) => {
      const newId = parseInt(e.target.value) || 0;
      if (arr) {
        arr[index] = newId;
        if (updateCallback) updateCallback(arr);
      }
    });

    selects.push(select);
    menuGroup.appendChild(select);
    menuContainer.appendChild(menuGroup);
  }

  clearAllBtn.addEventListener('click', () => {
    if (arr) {
      for (let i = 0; i < slotCount; i++) {
        arr[i] = 0;
        if (selects[i]) selects[i].value = 0;
      }
      if (updateCallback) updateCallback(arr);
    }
  });

  card.appendChild(menuContainer);
  return card;
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
// RENDERS: Cook-Off Battle progress (event_flag[152-153])
// ============================================================================

function createCookOffProgressEditor(data, key, updateCallback) {
  const container = document.createElement('div');
  container.className = 'json-object cook-off-progress-card';
  container.id = 'cook-off-progress-editor';
  container.style.cssText = 'padding: 0.75rem 1rem; border: 1px solid var(--pico-muted-border-color); border-radius: 6px; background: rgba(0,0,0,0.12); margin-bottom: 1rem;';

  const header = document.createElement('div');
  header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; border-bottom: 1px solid var(--pico-muted-border-color); padding-bottom: 0.4rem;';
  const title = document.createElement('strong');
  title.style.fontSize = '0.85rem';
  title.textContent = '🍳 Hai Yo\'s Cook-Off Battles Won (cook_off_progress)';
  header.appendChild(title);
  container.appendChild(header);

  const label = document.createElement('label');
  label.textContent = 'Current Match Status:';
  label.style.cssText = 'font-size: 0.75rem; font-weight: bold; margin-bottom: 0.35rem;';
  container.appendChild(label);

  const select = document.createElement('select');
  select.style.cssText = 'margin-bottom: 0;';

  const cookOffStages = [
    [0, 0, 32],
    [1, 1, 32],
    [2, 3, 32],
    [3, 7, 32],
    [4, 15, 32],
    [5, 31, 32],
    [6, 63, 32],
    [7, 127, 32],
    [8, 255, 32],
    [9, 255, 33],
    [10, 255, 35],
    [11, 255, 39],
    [12, 255, 47]
  ];

  const currentByte152 = data.event_flag[EVENT_FLAG_INDEX.COOK_OFF_BYTE1] || 0;
  const currentByte153 = data.event_flag[EVENT_FLAG_INDEX.COOK_OFF_BYTE2] || 32;

  let currentStage = 0;
  for (let i = 0; i < cookOffStages.length; i++) {
    const [matches, b152, b153] = cookOffStages[i];
    if (currentByte152 === b152 && currentByte153 === b153) {
      currentStage = matches;
      break;
    }
  }

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

  cookOffStages.forEach(([matches]) => {
    const option = document.createElement('option');
    option.value = matches;
    option.textContent = opponents[matches];
    select.appendChild(option);
  });

  select.value = currentStage;

  select.addEventListener('change', (e) => {
    const selectedMatches = parseInt(e.target.value);
    const stage = cookOffStages[selectedMatches];
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
// ABOUT VIEWER
// RENDERS: About tab with README.md content converted to HTML
// ============================================================================

function createAboutViewer(container) {
  container.innerHTML = '';
  container.classList.add('about-content');

  const loading = document.createElement('p');
  loading.textContent = 'Loading README...';
  loading.style.cssText = 'color: var(--pico-muted-color); text-align: center; padding: 2rem;';
  container.appendChild(loading);

  fetch('./README.md')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load README: ${response.statusText}`);
      }
      return response.text();
    })
    .then(markdown => {
      container.innerHTML = '';
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'readme-content';
      contentWrapper.style.cssText = 'max-width: 800px; margin: 0 auto; padding: 1rem;';
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
      container.innerHTML = '';
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'tab-content changelog-content';
      contentWrapper.style.cssText = 'max-width: 800px; margin: 0 auto; padding: 1rem;';
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
  details.open = false;
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
      updateSaveFileIndicator(currentFileName);
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

  let jsonContent = JSON.stringify(currentData, (key, value) => {
    return value;
  }, 2);
  
  jsonContent = jsonContent.replace(/[\u0080-\uFFFF]/g, (ch) => {
    return '\\u' + ('0000' + ch.charCodeAt(0).toString(16).toUpperCase()).slice(-4);
  });
  
  jsonContent = jsonContent.replace(/\r?\n/g, '\r\n');
  
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const textEncoder = new TextEncoder();
  const jsonBytes = textEncoder.encode(jsonContent);
  
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
  
  clearAutoSave();
  showAlertDialog('File Saved', '<p>✅ <strong>File saved successfully!</strong></p><p>Auto-save backup has been cleared.</p>');
});

// Hotkey: Ctrl+D to toggle debug mode
document.addEventListener('keydown', (e) => {
  const activeElement = document.activeElement;
  const isTyping = activeElement && (
    activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.tagName === 'SELECT' ||
    activeElement.isContentEditable
  );
  
  if (isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.stopPropagation();
    return;
  }

  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault();
    const newDebugMode = toggleDebugMode();
    updateStatusBar();

    if (newDebugMode) {
      console.log('Debug mode ENABLED - Loading debug file...');
      loadDebugFile()
        .then(data => {
          currentData = data;
          currentFileName = 'debug_save.json';
          renderEditor(editorContainer, currentData, (newData) => {
            currentData = newData;
          });
          saveBtn.disabled = false;
          console.log('Debug mode: Auto-loaded save file');
          showAlertDialog('Debug Mode Enabled', '<p>🐛 <strong>Debug Mode ENABLED</strong></p><p>Debug save file loaded successfully!</p>');
        })
        .catch(err => {
          console.error('Debug mode: Failed to load debug file:', err);
          showAlertDialog('Debug Mode Error', `<p>❌ Debug mode enabled but failed to load file.</p><p><strong>Error:</strong> ${err.message}</p>`);
          setDebugMode(false);
          updateStatusBar();
        });
    } else {
      console.log('Debug mode DISABLED');
      showAlertDialog('Debug Mode Disabled', '<p>🐛 <strong>Debug Mode DISABLED</strong></p><p>Page will refresh to return to normal mode.</p>').then(() => {
        location.reload();
      });
    }
  }
});

// Header button functionality - Data Values, About, Changelog
document.addEventListener('DOMContentLoaded', () => {
  const versionElement = document.getElementById('app-version');
  if (versionElement) {
    versionElement.textContent = `v${APP_VERSION}`;
  }

  const headerDataValuesBtn = document.getElementById('tab-data-values');
  const headerAboutBtn = document.getElementById('tab-about');
  const headerChangelogBtn = document.getElementById('tab-changelog');
  const editorContainer = document.getElementById('editor-container');
  
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
      
      document.querySelectorAll('.tabs .tab-button').forEach(b => b.classList.add('outline'));
      if (headerAboutBtn) headerAboutBtn.classList.add('outline');
      if (headerChangelogBtn) headerChangelogBtn.classList.add('outline');
      headerDataValuesBtn.classList.remove('outline');
      
      Array.from(tabPanelsContainer.children).forEach(child => {
        child.style.display = 'none';
      });
      
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
      
      document.querySelectorAll('.tabs .tab-button').forEach(b => b.classList.add('outline'));
      if (headerDataValuesBtn) headerDataValuesBtn.classList.add('outline');
      if (headerChangelogBtn) headerChangelogBtn.classList.add('outline');
      headerAboutBtn.classList.remove('outline');
      
      Array.from(tabPanelsContainer.children).forEach(child => {
        child.style.display = 'none';
      });
      
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
      
      document.querySelectorAll('.tabs .tab-button').forEach(b => b.classList.add('outline'));
      if (headerDataValuesBtn) headerDataValuesBtn.classList.add('outline');
      if (headerAboutBtn) headerAboutBtn.classList.add('outline');
      headerChangelogBtn.classList.remove('outline');
      
      Array.from(tabPanelsContainer.children).forEach(child => {
        child.style.display = 'none';
      });
      
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
