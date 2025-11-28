// Main Application Logic

// Debug Mode Configuration
let DEBUG_MODE = false; // Set to true to enable auto-load from debug folder
const DEBUG_FILE_PATH = './debug/save.json'; // Path to debug save file

const fileInput = document.getElementById('file-input');
const saveBtn = document.getElementById('save-btn');
const editorContainer = document.getElementById('editor-container');

let currentData = null;
let currentFileName = 'save.json';

// Auto-load debug file if DEBUG_MODE is enable0d
if (DEBUG_MODE) {
  fetch(DEBUG_FILE_PATH)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load debug file: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      currentData = data;
      currentFileName = 'debug_save.json';
      renderEditor(editorContainer, currentData, (newData) => {
        currentData = newData;
      });
      saveBtn.disabled = false;
      console.log('Debug mode: Auto-loaded save file from', DEBUG_FILE_PATH);
    })
    .catch(err => {
      console.error('Debug mode: Failed to load debug file:', err);
      alert('Debug mode enabled but failed to load file from: ' + DEBUG_FILE_PATH + '\n\nError: ' + err.message);
    });
}
// ============================================================================
// SCHEMA DEFINITIONS
// Defines labels, groupings, and rendering strategies for save file data
// ============================================================================

const Schema = {
  labels: {
    'bozu_name': 'Hero Name (Suikoden 2)',
    'bozu_name2': 'Hero Name (Real)',
    'macd_name': 'Hero Name (Suikoden 1)',
    'base_name': 'Castle Name',
    'm_base_name': 'Suikoden 1 HQ Name',
    'kari_name': 'Greenhill Mission Aliases',
    'team_name': 'Army Name',
    'play_time': 'Play Time',
    'base_lv': 'Castle Level',
    'kaji_lv': 'Blacksmith Level',
    'ninki': 'Popularity',
    'gold': 'Potch',
    'money': 'Potch',
    'base_item': 'Warehouse Items',
    'furo_item': 'Bath Items',
    'room_item': 'Room Items',
    'version': 'Save Version',
    'chara_data': 'Character Data',
    'war_data': 'War Battle Data',
    'nakam_1_num': 'Recruited Stars',
    'nige_cnt': 'Escaped Battles',
    'item_no': 'Item ID',
    'use_cnt': 'Count',
    'ckd_info': 'Character Status List',
    'leader_no': 'War Leader IDs',
    'sub_no': 'War Sub-Unit IDs',
    'sub_to_leader': 'Sub-Unit Assignment',
    'chara_flag': 'Recruited Characters',
    'party_item': 'Party Bag (30 items)',
    'area_no': 'Area Location',
    'town_no': 'Town No',
    'map_no': 'Map No',
    'px': 'Player X Coordinate',
    'py': 'Player Y Coordinate',
    'date_time_now': 'Last Modified (In-Game)',
    'c_varia_dat': 'Battle Character Data',
    'para': 'Stats',
    'mon_eqp': 'Runes',
    'item_eqp': 'Accessories',
    'bogu_eqp': 'Equipment',
    'level': 'Level',
    'exp': 'Experience',
    'now_hp': 'Current HP',
    'max_hp': 'Max HP',
    'now_mp': 'Current MP',
    'max_mp': 'Max MP',
    'buki_lv': 'Weapon Level',
    'buki_mon': 'Weapon Rune',
    'todome': 'Killed Enemies',
    'mp': 'MP',
  },
  groups: {
    'General': ['bozu_name', 'bozu_name2', 'macd_name', 'base_name', 'm_base_name', 'team_name', 'base_lv', 'kaji_lv', 'ninki', 'gold', 'play_time', 'location', 'date_time_now', 'kari_name'],
    'Battle Characters': ['c_varia_dat'],
    'Party Bag': ['party_item'],
    'Warehouse': ['base_item', 'room_item'],
    'Bath': ['furo_item'],
    'Recruited Characters': ['chara_flag'],
    'System': ['version', 'win_typ', 'win_col', 'msg_spd', 'opt_bit']
  },
  renderers: {
    'base_item': 'table',
    'furo_item': 'bath_items',
    'room_item': 'room_items',
    'party_item': 'table',
    'chara_flag': 'recruitment',
    'c_varia_dat': 'battle_characters',
    'play_time': 'play_time',
    'kari_name': 'greenhill_aliases',
    'location': 'location'
  },
  tableColumns: {
    'base_item': ['item_no', 'use_cnt'],
    'furo_item': ['item_no', 'use_cnt'],
    'room_item': ['item_no', 'use_cnt'],
    'party_item': ['item_no', 'use_cnt']
  }
};

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
  container.innerHTML = '';

  let rootData = data;
  let isGameData = false;

  // Initialize group paths once
  if (!Schema.groupPaths) {
    Schema.groupPaths = {
      'General': null,  // General has mixed sources: game_data + root level fields
      'Warehouse': 'game_data',
      'Bath': 'game_data',
      'Party Bag': 'party_data',
      'Recruited Characters': null,
      'Battle Characters': 'chara_data',
      'System': 'game_data'
    };
  }

  // Create Tabs with flexbox layout - left and right containers
  const tabContainer = document.createElement('div');
  tabContainer.className = 'tabs';
  tabContainer.id = 'editor-tabs';

  const tabsLeft = document.createElement('div');
  tabsLeft.className = 'tabs-left';

  const tabsRight = document.createElement('div');
  tabsRight.className = 'tabs-right';

  const contentContainer = document.createElement('div');
  contentContainer.className = 'tab-content';
  contentContainer.id = 'editor-content';

  const groupKeys = Object.keys(Schema.groups);
  let activeTab = groupKeys[0];
  const tabButtons = {}; // Cache tab buttons for performance

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
      // Optimize: only update changed buttons
      Object.values(tabButtons).forEach(b => b.classList.add('outline'));
      // Also update Data Values tab if it exists
      if (dataValuesBtn) dataValuesBtn.classList.add('outline');

      btn.classList.remove('outline');

      // Update content container ID to reflect current tab
      contentContainer.id = `content-${groupName.toLowerCase().replace(/\s+/g, '-')}`;

      renderTabContent(contentContainer, groupName, data, onUpdate);
    });

    tabsLeft.appendChild(btn);
  });

  // Create Data Values tab (right side)
  const dataValuesBtn = document.createElement('button');
  dataValuesBtn.textContent = 'Data Values';
  dataValuesBtn.className = 'tab-button outline data-values-tab';
  dataValuesBtn.id = 'tab-data-values';
  dataValuesBtn.dataset.tabName = 'Data Values';

  dataValuesBtn.addEventListener('click', () => {
    // Deactivate all regular tabs
    Object.values(tabButtons).forEach(b => b.classList.add('outline'));
    dataValuesBtn.classList.remove('outline');

    // Update content container
    contentContainer.id = 'content-data-values';

    // Render Data Values viewer
    createDataValuesViewer(contentContainer);
  });

  tabsRight.appendChild(dataValuesBtn);

  // Assemble tab container
  tabContainer.appendChild(tabsLeft);
  tabContainer.appendChild(tabsRight);

  container.appendChild(tabContainer);
  container.appendChild(contentContainer);

  // Set initial content ID and render first tab
  contentContainer.id = `content-${activeTab.toLowerCase().replace(/\s+/g, '-')}`;
  renderTabContent(contentContainer, activeTab, data, onUpdate);
}

function renderTabContent(container, group, data, onUpdate) {
  container.innerHTML = '';

  const groupPath = Schema.groupPaths[group];
  let targetData = data;

  if (groupPath) {
    targetData = data[groupPath];
    if (!targetData) {
      container.innerHTML = '<p>No data available for this section.</p>';
      return;
    }
  }

  const keys = Schema.groups[group] || [];

  // RENDERS: General Tab - checks game_data, party_data, and root level for fields
  if (groupPath === null) {
    keys.forEach(key => {
      // Special handling for location - it's a virtual grouping, not a real field
      if (key === 'location') {
        const element = createLocationEditor(data, 'Map Location', () => { });
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

      const label = Schema.labels[key] || key;
      const renderer = Schema.renderers ? Schema.renderers[key] : null;

      let element;
      if (renderer === 'table') {
        const columns = Schema.tableColumns[key];
        element = createTableEditor(value, label, (newValue) => {
          sourceData[key] = newValue;
        }, columns);
      } else if (renderer === 'bath_items') {
        element = createBathItemsEditor(value, label, (newValue) => {
          sourceData[key] = newValue;
        });
      } else if (renderer === 'room_items') {
        element = createRoomItemsEditor(value, label, (newValue) => {
          sourceData[key] = newValue;
        });
      } else if (renderer === 'recruitment') {
        element = createRecruitmentEditor(value, label, (newValue) => {
          sourceData[key] = newValue;
        });
      } else if (renderer === 'battle_characters') {
        element = createBattleCharactersEditor(value, label, (newValue) => {
          sourceData[key] = newValue;
        });
      } else if (renderer === 'play_time') {
        element = createPlayTimeEditor(value, label, (newValue) => {
          sourceData[key] = newValue;
        });
      } else if (renderer === 'greenhill_aliases') {
        element = createGreenhillAliasesEditor(value, label, (newValue) => {
          sourceData[key] = newValue;
        });
      } else if (renderer === 'location') {
        // Special handling for location - pass the entire data object
        element = createLocationEditor(data, label, (newValue) => {
          // Update callback not needed as location editor updates directly
        });
      } else {
        element = createElementForValue(value, label, (newValue) => {
          sourceData[key] = newValue;
        }, sourceData);
      }
      container.appendChild(element);
    });
    return;
  }

  // RENDERS: Other tabs (Items, Party Bag, Battle Characters, etc.) - uses specific data paths

  keys.forEach(key => {
    if (targetData[key] === undefined) return;

    const label = Schema.labels[key] || key;
    const renderer = Schema.renderers ? Schema.renderers[key] : null;

    let element;
    if (renderer === 'table') {
      const columns = Schema.tableColumns[key];
      element = createTableEditor(targetData[key], label, (newValue) => {
        targetData[key] = newValue;
      }, columns);
    } else if (renderer === 'bath_items') {
      element = createBathItemsEditor(targetData[key], label, (newValue) => {
        targetData[key] = newValue;
      });
    } else if (renderer === 'room_items') {
      element = createRoomItemsEditor(targetData[key], label, (newValue) => {
        targetData[key] = newValue;
      });
    } else if (renderer === 'recruitment') {
      element = createRecruitmentEditor(targetData[key], label, (newValue) => {
        targetData[key] = newValue;
      });
    } else if (renderer === 'battle_characters') {
      element = createBattleCharactersEditor(targetData[key], label, (newValue) => {
        targetData[key] = newValue;
      });
    } else if (renderer === 'play_time') {
      element = createPlayTimeEditor(targetData[key], label, (newValue) => {
        targetData[key] = newValue;
      });
    } else if (renderer === 'greenhill_aliases') {
      element = createGreenhillAliasesEditor(targetData[key], label, (newValue) => {
        targetData[key] = newValue;
      });
    } else {
      element = createElementForValue(targetData[key], label, (newValue) => {
        targetData[key] = newValue;
      }, targetData);
    }
    container.appendChild(element);
  });
}

// ============================================================================
// TABLE EDITOR
// RENDERS: Items tables (Warehouse, Bath, Room, Party Bag) with Item Type column
// ============================================================================

function createTableEditor(arr, key, updateCallback, columns) {
  const details = document.createElement('details');
  details.open = true;
  details.className = 'json-array';

  const summary = document.createElement('summary');
  summary.textContent = key + ` [${arr.length}]`;
  details.appendChild(summary);

  // Add description for Party Bag and warehouse items explaining use_cnt classification
  if (key.includes('Party Bag') || key.includes('Warehouse')) {
    const description = document.createElement('p');
    description.id = `${key.toLowerCase().replace(/\s+/g, '-')}-description`;
    description.style.cssText = 'font-size: 0.85rem; color: var(--pico-muted-color); margin-bottom: 1rem;';
    description.innerHTML = `<strong>Item Type Classification by Count:</strong><br>
      • 0-9: Regular Items<br>
      • 16: Equipment (Helmet, Armor, Shield, Accessories)<br>
      • 32: Runes<br>
      • 48: Farming Items<br>
      • 64: Trade Items / Bath Items<br>
      • 80: Base/Warehouse Items<br>
      • 99+: Food Items [has specific values so be careful when it comes to use count]`;
    details.appendChild(description);
  }

  const table = document.createElement('table');
  table.className = 'striped';
  table.id = `table-${key.toLowerCase().replace(/\s+/g, '-')}`;

  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');

  // Cache lookup table determination
  let lookupTable = null;
  if (typeof GameData !== 'undefined') {
    if (key.includes('Warehouse')) lookupTable = GameData.BASE_ITEM;
    else if (key.includes('Bath')) lookupTable = GameData.ITEMS;
    else if (key.includes('Room')) lookupTable = GameData.ITEMS;
  }

  // Helper function to get the correct lookup table based on use_cnt
  function getItemLookup(useCnt) {
    if (!GameData) return null;
    if (useCnt === 16) {
      // use_cnt 16 is used for HELMET, ARMOR, SHIELD, and OTHER_EQUIP
      // We need to check the item_no to determine which category
      // For now, return a combined lookup (will be handled per item)
      return null; // Will handle specially below
    }
    if (useCnt === 32) return GameData.RUNES;
    if (useCnt === 48) return GameData.FARMING;
    if (useCnt === 64) return GameData.TRADE;
    if (useCnt === 80) return GameData.BASE_ITEM;
    if (useCnt >= 99) return GameData.FOOD;
    return GameData.ITEMS; // Default fallback for use_cnt 0-9
  }

  // Helper function to get item type name based on use_cnt
  function getItemTypeName(useCnt) {
    if (useCnt === 16) return 'Equipment';
    if (useCnt === 32) return 'Rune';
    if (useCnt === 48) return 'Farming';
    if (useCnt === 64) return 'Trade';
    if (useCnt === 80) return 'Base Item';
    if (useCnt >= 99) return 'Food';
    return 'Regular Item';
  }

  // Helper function to get equipment name based on item_no (for use_cnt 16)
  function getEquipmentName(itemNo) {
    if (!GameData) return null;

    // Helper to extract name from either string or object format
    const extractName = (value) => {
      if (typeof value === 'string') return value;
      if (typeof value === 'object' && value !== null && value.name) return value.name;
      return null;
    };

    // Check each equipment category by item_no ranges
    if (GameData.HELMET[itemNo]) return extractName(GameData.HELMET[itemNo]);
    if (GameData.ARMOR[itemNo]) return extractName(GameData.ARMOR[itemNo]);
    if (GameData.SHIELD[itemNo]) return extractName(GameData.SHIELD[itemNo]);
    if (GameData.OTHER_EQUIP_GEAR && GameData.OTHER_EQUIP_GEAR[itemNo]) return extractName(GameData.OTHER_EQUIP_GEAR[itemNo]);
    return null;
  }

  // Add Item Name column if we have a lookup
  if (lookupTable || arr.length > 0) {
    const th = document.createElement('th');
    th.textContent = 'Item Name';
    trHead.appendChild(th);
  }

  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = Schema.labels[col] || col;
    trHead.appendChild(th);

    // Add Item Type column before use_cnt column
    if (col === 'use_cnt') {
      const typeHeader = document.createElement('th');
      typeHeader.textContent = 'Item Type';
      trHead.insertBefore(typeHeader, th);
    }
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  // Optimize: limit rendering and use fragment for better performance
  const fragment = document.createDocumentFragment();
  const maxItems = Math.min(arr.length, 200);

  for (let index = 0; index < maxItems; index++) {
    const item = arr[index];
    const tr = document.createElement('tr');
    tr.id = `${key.toLowerCase().replace(/\s+/g, '-')}-row-${index}`;

    // Cache values for performance
    const itemUseCnt = item['use_cnt'] || 0;
    const itemId = item['item_no'] || 0;
    const itemLookup = getItemLookup(itemUseCnt);

    // Add item name cell
    const td = document.createElement('td');

    let itemName;
    if (itemUseCnt === 16) {
      // Special handling for equipment (use_cnt 16)
      itemName = getEquipmentName(itemId);
      td.textContent = itemName ? `${itemId}: ${itemName}` : `Unknown Equipment (${itemId})`;
    } else if (itemLookup) {
      const lookupValue = itemLookup[itemId];
      // Handle both string format and object format (for RUNES)
      if (typeof lookupValue === 'object' && lookupValue !== null && lookupValue.name) {
        td.textContent = `${itemId}: ${lookupValue.name}`;
      } else if (typeof lookupValue === 'string') {
        td.textContent = `${itemId}: ${lookupValue}`;
      } else {
        td.textContent = `Unknown (${itemId})`;
      }
    } else {
      td.textContent = `ID: ${itemId}`;
    }
    td.style.fontStyle = 'italic';
    td.style.color = 'var(--pico-muted-color)';
    tr.appendChild(td);

    columns.forEach(col => {
      // Add Item Type column before use_cnt
      if (col === 'use_cnt') {
        const typeTd = document.createElement('td');
        typeTd.textContent = getItemTypeName(item['use_cnt'] || 0);
        typeTd.style.fontStyle = 'italic';
        typeTd.style.fontSize = '0.85rem';
        typeTd.id = `type-${index}`; // Add ID for updating
        tr.appendChild(typeTd);
      }

      const td = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'number';
      input.value = item[col];
      input.style.marginBottom = '0';
      input.style.padding = '0.25rem';
      input.addEventListener('input', (e) => {
        item[col] = parseFloat(e.target.value);
        // Update item name display if this is the item_no or use_cnt column
        if ((col === 'item_no' || col === 'use_cnt')) {
          const nameCell = tr.cells[0];
          const newId = item['item_no'] || 0;
          const newUseCnt = item['use_cnt'] || 0;

          // Update item type if use_cnt changed
          if (col === 'use_cnt') {
            const typeCell = document.getElementById(`type-${index}`);
            if (typeCell) {
              typeCell.textContent = getItemTypeName(newUseCnt);
            }
          }

          if (newUseCnt === 16) {
            // Special handling for equipment
            const newName = getEquipmentName(newId);
            nameCell.textContent = newName || `Unknown Equipment (${newId})`;
          } else {
            const newLookup = getItemLookup(newUseCnt);
            if (newLookup) {
              nameCell.textContent = newLookup[newId] || `Unknown (${newId})`;
            } else {
              nameCell.textContent = `ID: ${newId}`;
            }
          }
        }
      });
      td.appendChild(input);
      tr.appendChild(td);
    });
    fragment.appendChild(tr);
  }

  tbody.appendChild(fragment); // Batch DOM update

  if (arr.length > 200) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = columns.length + 1; // +1 for item name column
    td.textContent = `... and ${arr.length - 200} more items (hidden)`;
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  details.appendChild(table);

  return details;
}

// ============================================================================
// BATH ITEMS EDITOR
// RENDERS: Bath items with custom dropdowns and automatic use_cnt=64
// ============================================================================

function createBathItemsEditor(arr, key, updateCallback) {
  const details = document.createElement('details');
  details.open = true;
  details.className = 'json-array';

  const summary = document.createElement('summary');
  summary.textContent = key + ` [${arr.length}]`;
  details.appendChild(summary);

  // Add description
  const description = document.createElement('p');
  description.style.cssText = 'font-size: 0.85rem; color: var(--pico-muted-color); margin-bottom: 1rem;';
  description.innerHTML = `<strong>Bath Items:</strong> All items use Trade category (use_cnt: 64). Paintings for indices 2 & 5, ornaments for other slots.`;
  details.appendChild(description);

  // Define item groups
  const paintingItems = [{ id: 0, name: 'None' }];

  // Dynamically load paintings from GameData.TRADE
  if (typeof GameData !== 'undefined' && GameData.TRADE) {
    // Original paintings (18-22)
    for (let id = 18; id <= 22; id++) {
      if (GameData.TRADE[id]) {
        paintingItems.push({ id: id, name: GameData.TRADE[id] });
      }
    }
    // New Karen paintings (42-44)
    for (let id = 42; id <= 44; id++) {
      if (GameData.TRADE[id]) {
        paintingItems.push({ id: id, name: GameData.TRADE[id] });
      }
    }
  }

  // Ornament items (exclude paintings 18-22, 42-44 and consumables 23-41)
  const ornamentItems = [];
  if (typeof GameData !== 'undefined' && GameData.TRADE) {
    for (let id in GameData.TRADE) {
      const numId = parseInt(id);
      // Include: 0, 1-17 (ornaments), 45-50 (statues and vases)
      if (numId === 0 || (numId >= 1 && numId <= 17) || (numId >= 45 && numId <= 50)) {
        ornamentItems.push({ id: numId, name: GameData.TRADE[id] });
      }
    }
  }

  // Create grouped sections
  const sections = [
    { title: 'Paintings', indices: [2, 5], items: paintingItems, standalone: true },
    { title: "Girl's Side (Left Ornaments)", indices: [0, 1, 3], items: ornamentItems, standalone: false },
    { title: "Boy's Side (Right Ornaments)", indices: [4, 6, 7], items: ornamentItems, standalone: false }
  ];

  // Add Paintings section (standalone)
  const paintingsSection = sections[0];
  const paintingDiv = document.createElement('div');
  paintingDiv.style.cssText = 'margin-bottom: 1.5rem; padding: 0.75rem; background: rgba(0,0,0,0.1); border-radius: 6px;';

  const paintingTitle = document.createElement('h4');
  paintingTitle.textContent = paintingsSection.title;
  paintingTitle.style.cssText = 'margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--pico-primary);';
  paintingDiv.appendChild(paintingTitle);

  paintingsSection.indices.forEach(index => {
    if (index >= arr.length) return;

    const item = arr[index];
    const itemDiv = document.createElement('div');
    itemDiv.className = 'json-item';
    itemDiv.style.cssText = 'margin-bottom: 0.5rem;';

    const label = document.createElement('label');
    label.textContent = `Slot ${index}`;
    label.style.cssText = 'min-width: 80px; font-weight: 600;';
    itemDiv.appendChild(label);

    // Create dropdown
    const select = document.createElement('select');
    select.style.cssText = 'flex: 1; margin-bottom: 0;';

    // Add options
    paintingsSection.items.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.id;
      option.textContent = `${opt.id}: ${opt.name}`;
      if (item.item_no === opt.id) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      item.item_no = parseInt(e.target.value);
      item.use_cnt = 64; // Automatically set use_cnt to 64
    });

    itemDiv.appendChild(select);
    paintingDiv.appendChild(itemDiv);

    // Ensure use_cnt is 64
    if (item.use_cnt !== 64) {
      item.use_cnt = 64;
    }
  });

  details.appendChild(paintingDiv);

  // Create container for Girl's and Boy's Side (responsive grid)
  const ornamentsContainer = document.createElement('div');
  ornamentsContainer.style.cssText = 'display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 1rem;';
  ornamentsContainer.className = 'bath-ornaments-grid';

  // Add Girl's and Boy's Side sections
  for (let i = 1; i < sections.length; i++) {
    const section = sections[i];
    const sectionDiv = document.createElement('div');
    sectionDiv.style.cssText = 'padding: 0.75rem; background: rgba(0,0,0,0.1); border-radius: 6px;';

    const sectionTitle = document.createElement('h4');
    sectionTitle.textContent = section.title;
    sectionTitle.style.cssText = 'margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--pico-primary);';
    sectionDiv.appendChild(sectionTitle);

    section.indices.forEach(index => {
      if (index >= arr.length) return;

      const item = arr[index];
      const itemDiv = document.createElement('div');
      itemDiv.className = 'json-item';
      itemDiv.style.cssText = 'margin-bottom: 0.5rem;';

      const label = document.createElement('label');
      label.textContent = `Slot ${index}`;
      label.style.cssText = 'min-width: 80px; font-weight: 600;';
      itemDiv.appendChild(label);

      // Create dropdown
      const select = document.createElement('select');
      select.style.cssText = 'flex: 1; margin-bottom: 0;';

      // Add options
      section.items.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.id;
        option.textContent = `${opt.id}: ${opt.name}`;
        if (item.item_no === opt.id) {
          option.selected = true;
        }
        select.appendChild(option);
      });

      select.addEventListener('change', (e) => {
        item.item_no = parseInt(e.target.value);
        item.use_cnt = 64; // Automatically set use_cnt to 64
      });

      itemDiv.appendChild(select);
      sectionDiv.appendChild(itemDiv);

      // Ensure use_cnt is 64
      if (item.use_cnt !== 64) {
        item.use_cnt = 64;
      }
    });

    ornamentsContainer.appendChild(sectionDiv);
  }

  details.appendChild(ornamentsContainer);

  return details;
}

// ============================================================================
// ROOM ITEMS EDITOR
// RENDERS: Room items with same structure as bath items (for testing)
// ============================================================================

function createRoomItemsEditor(arr, key, updateCallback) {
  const details = document.createElement('details');
  details.open = true;
  details.className = 'json-array';

  const summary = document.createElement('summary');
  summary.textContent = key + ` [${arr.length}]`;
  details.appendChild(summary);

  // Add warning description
  const description = document.createElement('p');
  description.style.cssText = 'font-size: 0.85rem; color: var(--pico-color-amber-500); margin-bottom: 1rem; padding: 0.5rem; background: rgba(255, 193, 7, 0.1); border-left: 3px solid var(--pico-color-amber-500); border-radius: 4px;';
  description.innerHTML = `<strong>⚠️ Testing Only:</strong> Room items functionality is experimental. We don't know how this affects the game, but these values exist in the save file. All items use Trade category (use_cnt: 64).`;
  details.appendChild(description);

  // Ornament items (exclude paintings 18-22 and consumables 23-41)
  const ornamentItems = [];
  if (typeof GameData !== 'undefined' && GameData.TRADE) {
    for (let id in GameData.TRADE) {
      const numId = parseInt(id);
      if (numId === 0 || (numId >= 1 && numId <= 17) || (numId >= 42 && numId <= 50)) {
        ornamentItems.push({ id: numId, name: GameData.TRADE[id] });
      }
    }
  }

  // Create grouped sections (for army leader room)
  const sections = [
    { title: "", indices: [0, 1, 3], items: ornamentItems },
    { title: "", indices: [4, 6, 7], items: ornamentItems }
  ];

  // Create container for responsive grid
  const ornamentsContainer = document.createElement('div');
  ornamentsContainer.style.cssText = 'display: grid; grid-template-columns: 1fr; gap: 1rem; margin-bottom: 1rem;';
  ornamentsContainer.className = 'bath-ornaments-grid';

  // Add sections without titles
  sections.forEach(section => {
    const sectionDiv = document.createElement('div');
    sectionDiv.style.cssText = 'padding: 0.75rem; background: rgba(0,0,0,0.1); border-radius: 6px;';

    section.indices.forEach(index => {
      if (index >= arr.length) return;

      const item = arr[index];
      const itemDiv = document.createElement('div');
      itemDiv.className = 'json-item';
      itemDiv.style.cssText = 'margin-bottom: 0.5rem;';

      const label = document.createElement('label');
      label.textContent = `Slot ${index}`;
      label.style.cssText = 'min-width: 80px; font-weight: 600;';
      itemDiv.appendChild(label);

      // Create dropdown
      const select = document.createElement('select');
      select.style.cssText = 'flex: 1; margin-bottom: 0;';

      // Add options
      section.items.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.id;
        option.textContent = `${opt.id}: ${opt.name}`;
        if (item.item_no === opt.id) {
          option.selected = true;
        }
        select.appendChild(option);
      });

      select.addEventListener('change', (e) => {
        item.item_no = parseInt(e.target.value);
        item.use_cnt = 64; // Automatically set use_cnt to 64
      });

      itemDiv.appendChild(select);
      sectionDiv.appendChild(itemDiv);

      // Ensure use_cnt is 64
      if (item.use_cnt !== 64) {
        item.use_cnt = 64;
      }
    });

    ornamentsContainer.appendChild(sectionDiv);
  });

  details.appendChild(ornamentsContainer);

  return details;
}

// ============================================================================
// RECRUITMENT EDITOR
// RENDERS: Recruited Characters tab with character names and recruitment flags
// ============================================================================

function createRecruitmentEditor(arr, key, updateCallback) {
  const details = document.createElement('details');
  details.open = true;
  details.className = 'json-array';

  const summary = document.createElement('summary');
  summary.textContent = key + ` [${arr.length} characters]`;
  details.appendChild(summary);

  // Add description for recruitment status values
  const description = document.createElement('p');
  description.style.cssText = 'font-size: 0.85rem; color: var(--pico-muted-color); margin-bottom: 1rem;';
  description.innerHTML = `<strong>Recruitment Status Values:</strong><br>
    • 1: Spoke to<br>
    • 70: Auto Join<br>
    • 71: Manual Recruit<br>
    • 212: Deceased<br>
    • 213: On Leave`;
  details.appendChild(description);

  const table = document.createElement('table');
  table.className = 'striped';
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');

  const headers = ['Index', 'Character Name', 'Recruitment Flag'];
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  // Use character names for recruitment display to avoid redundant tables
  const lookupTable = typeof GameData !== 'undefined' ? GameData.CHARACTERS : null;

  arr.forEach((flagValue, index) => {
    // Skip index 0 (not a valid character)
    if (index === 0) return;

    const tr = document.createElement('tr');

    // Index column
    const tdIndex = document.createElement('td');
    tdIndex.textContent = index;
    tdIndex.style.fontWeight = 'bold';
    tdIndex.style.width = '60px';
    tr.appendChild(tdIndex);

    // Character name column
    const tdName = document.createElement('td');
    const charEntry = lookupTable && lookupTable[index];
    tdName.textContent = charEntry ? (typeof charEntry === 'string' ? charEntry : (charEntry.name || `Character ${index}`)) : `Character ${index}`;
    tdName.style.fontStyle = 'italic';
    tdName.style.color = 'var(--pico-muted-color)';
    tr.appendChild(tdName);

    // Flag value input column
    const tdFlag = document.createElement('td');
    const input = document.createElement('input');
    input.type = 'number';
    input.value = flagValue;
    input.style.marginBottom = '0';
    input.style.padding = '0.25rem';
    input.style.width = '80px';
    input.addEventListener('input', (e) => {
      arr[index] = parseFloat(e.target.value);
    });
    tdFlag.appendChild(input);
    tr.appendChild(tdFlag);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  details.appendChild(table);

  return details;
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
    aliasLabel.style.cssText = 'min-width: 120px; margin-bottom: 0;';
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
  fieldsContainer.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem; background: rgba(0,0,0,0.1); border-radius: 6px;';

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
// BATTLE CHARACTERS EDITOR
// RENDERS: Battle Characters tab with stats, runes (dropdowns), equipment (dropdowns), and accessories
// ============================================================================

/**
 * Filters runes based on character index and equipment slot
 * @param {number} characterIndex - Index of the character
 * @param {number} slotIndex - Equipment slot (0=Head, 1=Right Hand, 2=Left Hand)
 * @returns {Array} Array of allowed rune objects with id and name
 */
function filterRunesForCharacter(characterIndex, slotIndex) {
  if (!GameData || !GameData.RUNES) return [];

  const slotTypes = ['HR', 'RH', 'LH']; // Head, Right Hand, Left Hand
  const currentSlotType = slotTypes[slotIndex];

  const allowedRunes = [];

  Object.entries(GameData.RUNES).forEach(([id, runeData]) => {
    // Handle both old string format and new object format
    const runeName = typeof runeData === 'string' ? runeData : runeData.name;
    const attrs = runeData.attrs || [];

    // Always include "None" (ID 0)
    if (id === '0') {
      allowedRunes.push({ id: 0, name: runeName, attrs: attrs });
      return;
    }

    // Exclude weapon-exclusive runes (ExR)
    if (attrs.includes('ExR')) return;

    // Check if rune has slot-specific attributes
    const hasSlotAttr = attrs.includes('HR') || attrs.includes('RH') || attrs.includes('LH');

    // Check if rune has the required slot type attribute
    let passesSlotCheck = false;

    if (slotIndex === 0) { // Head slot
      // Must have HR, N, or no slot restrictions (character-specific only)
      passesSlotCheck = attrs.includes('HR') || attrs.includes('N') || !hasSlotAttr;
    } else if (slotIndex === 1) { // Right Hand
      // Must have RH, N, Wep, or no slot restrictions (but not LH exclusive)
      if (attrs.includes('LH') && !attrs.includes('RH') && !attrs.includes('N')) {
        passesSlotCheck = false;
      } else {
        passesSlotCheck = attrs.includes('RH') || attrs.includes('N') || attrs.includes('Wep') || !hasSlotAttr;
      }
    } else if (slotIndex === 2) { // Left Hand
      // Must have LH, N, Wep, or no slot restrictions (but not RH exclusive)
      if (attrs.includes('RH') && !attrs.includes('LH') && !attrs.includes('N')) {
        passesSlotCheck = false;
      } else {
        passesSlotCheck = attrs.includes('LH') || attrs.includes('N') || attrs.includes('Wep') || !hasSlotAttr;
      }
    }

    if (!passesSlotCheck) return;

    // Check character index match
    const hasCharacterMatch = attrs.includes('N') ||
      attrs.some(attr => {
        const num = parseInt(attr);
        return !isNaN(num) && num === characterIndex;
      });

    // For runes with character-specific attributes, only show if character matches
    const hasCharacterSpecificAttr = attrs.some(attr => {
      const num = parseInt(attr);
      return !isNaN(num);
    });

    if (hasCharacterSpecificAttr && !hasCharacterMatch) return;

    // If we got here, the rune passed all checks
    allowedRunes.push({ id: parseInt(id), name: runeName, attrs: attrs });
  });

  return allowedRunes;
}

function createBattleCharactersEditor(arr, key, updateCallback) {
  const details = document.createElement('details');
  details.open = true;
  details.className = 'json-array';

  const summary = document.createElement('summary');
  summary.textContent = key + ` [${Math.min(arr.length, 84)} playable characters]`;
  details.appendChild(summary);

  const lookupTable = typeof GameData !== 'undefined' ? GameData.CHARACTERS : null;

  // Add filter dropdown
  const filterContainer = document.createElement('div');
  filterContainer.style.cssText = 'margin-bottom: 1.5rem; padding: 1rem; background: rgba(0,0,0,0.1); border-radius: 6px;';

  const filterLabel = document.createElement('label');
  filterLabel.textContent = 'Filter by Character Type:';
  filterLabel.style.cssText = 'display: block; margin-bottom: 0.5rem; font-weight: bold; font-size: 0.75rem;';
  filterContainer.appendChild(filterLabel);

  const filterSelect = document.createElement('select');
  filterSelect.style.cssText = 'width: 100%; max-width: 200px; margin-bottom: 0; font-size: 0.75rem;';
  filterSelect.id = 'character-type-filter';

  // Add filter options
  const filterOptions = [
    { value: 'all', label: 'All Characters' },
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
    { value: 'K', label: 'Kobold' },
    { value: 'W', label: 'Winger' },
    { value: 'Z', label: 'Monster' },
    { value: 'N', label: 'Noble' }
  ];

  filterOptions.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    filterSelect.appendChild(option);
  });

  filterContainer.appendChild(filterSelect);
  details.appendChild(filterContainer);

  // Only show first 84 characters (1-83) as those are playable, skip index 0 (N/A)
  const maxIndex = Math.min(arr.length, 84);

  // Stat labels for para array
  const statLabels = ['Strength', 'Dexterity', 'Protection', 'Magic', 'Magic Defense', 'Speed', 'Luck'];

  // Equipment labels for mon_eqp array
  const equipmentLabels = ['Head Rune', 'Right Hand Rune', 'Left Hand Rune'];

  for (let index = 1; index < maxIndex; index++) {
    const charData = arr[index];
    const entry = lookupTable && lookupTable[index];
    const charName = entry ? (typeof entry === 'string' ? entry : (entry.name || `Character ${index}`)) : `Character ${index}`;

    // Skip characters with empty or N/A names
    if (!charName || charName === 'N/A' || charName === '' || charName.trim() === '') {
      continue;
    }

    // Get character attributes for filtering
    const charAttrs = entry && entry.attrs ? entry.attrs : [];

    const charDetails = document.createElement('details');
    charDetails.open = false;
    charDetails.className = 'json-object';

    // Add data attributes for filtering
    charDetails.dataset.charIndex = index;
    if (charAttrs.includes('M')) charDetails.dataset.isMale = 'true';
    if (charAttrs.includes('F')) charDetails.dataset.isFemale = 'true';
    if (charAttrs.includes('K')) charDetails.dataset.isKobold = 'true';
    if (charAttrs.includes('W')) charDetails.dataset.isWinger = 'true';
    if (charAttrs.includes('Z')) charDetails.dataset.isMonster = 'true';
    if (charAttrs.includes('N')) charDetails.dataset.isNoble = 'true';

    const charSummary = document.createElement('summary');
    charSummary.innerHTML = `<strong>${index}:</strong> ${charName}`;
    charDetails.appendChild(charSummary);

    // Create 2-column layout container
    const columnsContainer = document.createElement('div');
    //columnsContainer.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;';
    columnsContainer.className = 'grid g-2-col';

    // Left column: Stats and other properties
    const leftColumn = document.createElement('div');
    leftColumn.style.cssText = 'display: flex; flex-direction: column; gap: 1rem;';

    // Right column: Runes, Equipment, Accessories
    const rightColumn = document.createElement('div');
    rightColumn.style.cssText = 'display: flex; flex-direction: column; gap: 1rem;';

    // Render all properties of this character
    Object.keys(charData).forEach(prop => {
      // Skip MP array entirely
      if (prop === 'mp') return;

      let el;

      // Special handling for para (stats) array - NON-COLLAPSIBLE
      if (prop === 'para' && Array.isArray(charData[prop])) {
        const paraContainer = document.createElement('div');
        paraContainer.className = 'battle-character-stats';
        paraContainer.id = `char-${index}-stats`;

        const statsTitle = document.createElement('h4');
        statsTitle.textContent = 'Stats';
        statsTitle.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1rem;';
        paraContainer.appendChild(statsTitle);

        charData[prop].forEach((value, i) => {
          if (i < statLabels.length) {
            const statDiv = document.createElement('div');
            statDiv.className = 'json-item';
            const label = document.createElement('label');
            label.textContent = statLabels[i];
            statDiv.appendChild(label);

            const input = document.createElement('input');
            input.type = 'number';
            input.value = value;
            input.addEventListener('input', (e) => {
              charData[prop][i] = parseFloat(e.target.value);
            });
            statDiv.appendChild(input);
            paraContainer.appendChild(statDiv);
          }
        });

        leftColumn.appendChild(paraContainer);
        return; // Don't add to el
      }
      // Special handling for mon_eqp (runes) array - NON-COLLAPSIBLE
      else if (prop === 'mon_eqp' && Array.isArray(charData[prop])) {
        const eqpContainer = document.createElement('div');
        eqpContainer.className = 'runes-equiped-section';
        eqpContainer.id = `char-${index}-runes`;

        const runesTitle = document.createElement('h4');
        runesTitle.textContent = 'Runes';
        runesTitle.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1rem;';
        eqpContainer.appendChild(runesTitle);

        charData[prop].forEach((value, i) => {
          if (i < equipmentLabels.length) {
            const eqpDiv = document.createElement('div');
            eqpDiv.className = 'json-item runes';
            eqpDiv.style.display = 'flex';
            eqpDiv.style.gap = '1rem';
            eqpDiv.style.alignItems = 'center';

            const slotLabel = document.createElement('span');
            slotLabel.textContent = `${equipmentLabels[i]}:`;
            slotLabel.style.fontWeight = 'bold';
            slotLabel.style.minWidth = '120px';
            eqpDiv.appendChild(slotLabel);

            // Create dropdown for rune selection
            const select = document.createElement('select');
            select.style.marginBottom = '0';
            select.style.flex = '1';

            // Get filtered runes for this character and slot
            const allowedRunes = filterRunesForCharacter(index, i);

            // Check if current rune has X (locked) attribute
            let isLocked = false;
            if (value && GameData && GameData.RUNES && GameData.RUNES[value]) {
              const currentRuneData = GameData.RUNES[value];
              const currentAttrs = currentRuneData.attrs || [];
              isLocked = currentAttrs.includes('X');
            }

            // Populate dropdown with filtered runes
            allowedRunes.forEach(rune => {
              const option = document.createElement('option');
              option.value = rune.id;
              option.textContent = `${rune.id}: ${rune.name}`;
              if (value === rune.id) {
                option.selected = true;
              }
              select.appendChild(option);
            });

            // If rune is locked, disable the dropdown
            if (isLocked && value !== 0) {
              select.disabled = true;
              select.style.opacity = '0.6';
              select.style.cursor = 'not-allowed';
              select.title = 'This rune is locked and cannot be changed';
            } else {
              // Set current value
              select.value = value || 0;

              // Update handler
              select.addEventListener('change', (e) => {
                charData[prop][i] = parseInt(e.target.value);
              });
            }

            eqpDiv.appendChild(select);
            eqpContainer.appendChild(eqpDiv);
          }
        });

        rightColumn.appendChild(eqpContainer); // Add to right column
        return; // Don't add to el
      }
      // Special handling for bogu_eqp (equipment worn) array - NON-COLLAPSIBLE
      else if (prop === 'bogu_eqp' && Array.isArray(charData[prop])) {
        const boguContainer = document.createElement('div');
        boguContainer.className = 'equipment-worn-section';
        boguContainer.id = `char-${index}-equipment`;

        const equipmentTitle = document.createElement('h4');
        equipmentTitle.textContent = 'Equipment';
        equipmentTitle.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1rem;';
        boguContainer.appendChild(equipmentTitle);

        // Check if this character is a beast/monster (cannot equip any armor)
        const isBeast = GameData && GameData.BEASTS && GameData.BEASTS.includes(index);

        // Equipment slot labels and corresponding GameData categories
        const equipmentSlots = [
          { label: 'Helmet', category: 'HELMET' },
          { label: 'Armor', category: 'ARMOR' },
          { label: 'Shield', category: 'SHIELD' }
        ];

        charData[prop].forEach((value, i) => {
          if (i < equipmentSlots.length) {
            const boguDiv = document.createElement('div');
            boguDiv.className = 'json-item equipment';
            boguDiv.style.display = 'flex';
            boguDiv.style.gap = '1rem';
            boguDiv.style.alignItems = 'center';

            const slotLabel = document.createElement('span');
            slotLabel.textContent = `${equipmentSlots[i].label}:`;
            slotLabel.style.fontWeight = 'bold';
            slotLabel.style.minWidth = '80px';
            boguDiv.appendChild(slotLabel);

            // Create dropdown for equipment selection
            const select = document.createElement('select');
            select.style.marginBottom = '0';
            select.style.flex = '1';

            // Get the appropriate equipment category
            const categoryData = GameData && GameData[equipmentSlots[i].category] ? GameData[equipmentSlots[i].category] : {};

            // Characters that can equip shields
            const shieldUsers = [2, 5, 7, 9, 12, 13, 23, 28, 33, 35, 39, 64];
            const isShieldSlot = i === 2; // Shield is the 3rd slot (index 2)
            const canEquipShield = shieldUsers.includes(index);

            // If character is a beast/monster, disable all equipment
            if (isBeast) {
              // Create disabled dropdown with only "None" option
              const option = document.createElement('option');
              option.value = 0;
              option.textContent = '0: None (Beast/Monster - Cannot equip)';
              option.selected = true;
              select.appendChild(option);
              select.disabled = true;
              select.style.opacity = '0.6';
              select.style.cursor = 'not-allowed';

              // Force value to 0
              charData[prop][i] = 0;
            }
            // If this is a shield slot and character can't equip shields, disable it
            else if (isShieldSlot && !canEquipShield) {
              // Create disabled dropdown with only "None" option
              const option = document.createElement('option');
              option.value = 0;
              option.textContent = '0: None (Cannot equip shields)';
              option.selected = true;
              select.appendChild(option);
              select.disabled = true;
              select.style.opacity = '0.6';
              select.style.cursor = 'not-allowed';

              // Force value to 0
              charData[prop][i] = 0;
            } else {
              // Get character attributes for equipment filtering
              const charEntry = lookupTable && lookupTable[index];
              const charAttrs = charEntry && charEntry.attrs ? charEntry.attrs : [];

              Object.entries(categoryData).forEach(([id, itemData]) => {
                let itemName, itemAttrs;
                if (typeof itemData === 'string') {
                  itemName = itemData;
                  itemAttrs = null;
                } else if (typeof itemData === 'object' && itemData.name) {
                  itemName = itemData.name;
                  itemAttrs = itemData.attrs || [];
                } else {
                  return;
                }

                // For armor slot, filter by character attributes
                if (equipmentSlots[i].category === 'ARMOR' && itemAttrs && itemAttrs.length > 0) {
                  const hasMatchingAttr = itemAttrs.some(attr => charAttrs.includes(attr));
                  if (!hasMatchingAttr && id !== '0') {
                    return;
                  }
                }
                // For helmet slot, filter by character attributes
                if (equipmentSlots[i].category === 'HELMET' && itemAttrs && itemAttrs.length > 0) {
                  const hasMatchingAttr = itemAttrs.some(attr => charAttrs.includes(attr));
                  if (!hasMatchingAttr && id !== '0') {
                    return;
                  }
                }

                const option = document.createElement('option');
                option.value = id;
                option.textContent = itemName;
                select.appendChild(option);
              });

              // Set current value
              select.value = value || 0;

              // Update handler
              select.addEventListener('change', (e) => {
                charData[prop][i] = parseInt(e.target.value);
              });
            }

            boguDiv.appendChild(select);
            boguContainer.appendChild(boguDiv);
          }
        });

        rightColumn.appendChild(boguContainer); // Add to right column
        return; // Don't add to el
      }
      // Special handling for item_eqp (accessories) array - NON-COLLAPSIBLE
      else if (prop === 'item_eqp' && Array.isArray(charData[prop])) {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'equip-accessories-section';
        itemContainer.id = `char-${index}-accessories`;

        // Check if this character is a beast/monster (cannot equip any accessories)
        const isBeast = GameData && GameData.BEASTS && GameData.BEASTS.includes(index);

        const accessoriesTitle = document.createElement('h4');
        accessoriesTitle.textContent = `Accessories [${charData[prop].length}]`;
        accessoriesTitle.style.cssText = 'margin: 0 0 0.5rem 0; font-size: 1rem;';
        itemContainer.appendChild(accessoriesTitle);

        // If beast/monster, show a disabled message
        if (isBeast) {
          const disabledMsg = document.createElement('p');
          disabledMsg.textContent = 'Beast/Monster character - Cannot equip accessories';
          disabledMsg.style.cssText = 'color: var(--pico-muted-color); font-style: italic; margin: 0.5rem 0;';
          itemContainer.appendChild(disabledMsg);
          rightColumn.appendChild(itemContainer);
          return;
        }

        // Add note about upcoming dropdown
        const note = document.createElement('p');
        note.textContent = 'A Smart dropdown will be added later. In the meantime, check the Data Values tab to guide you in editing the values below.';
        note.style.cssText = 'font-size: 0.85rem; color: var(--pico-muted-color); font-style: italic; margin: 0.5rem 0;';
        itemContainer.appendChild(note);

        charData[prop].forEach((item, i) => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'json-item';
          itemDiv.style.display = 'flex';
          itemDiv.style.gap = '1rem';
          itemDiv.style.alignItems = 'center';

          const slotLabel = document.createElement('span');
          slotLabel.textContent = `Slot ${i + 1}:`;
          slotLabel.style.fontWeight = 'bold';
          slotLabel.style.minWidth = '60px';
          itemDiv.appendChild(slotLabel);

          // Item name display - check different sources based on use_cnt
          const itemName = document.createElement('span');
          itemName.style.fontStyle = 'italic';
          itemName.style.color = 'var(--pico-muted-color)';
          itemName.style.minWidth = '150px';
          const itemId = item.item_no || 0;
          const useCnt = item.use_cnt || 0;

          // Helper function to get item name based on use_cnt
          const getItemName = (id, cnt) => {
            if (cnt === 16 && GameData && GameData.OTHER_EQUIP_GEAR && GameData.OTHER_EQUIP_GEAR[id]) {
              return GameData.OTHER_EQUIP_GEAR[id];
            } else if (cnt <= 9 && GameData && GameData.ITEMS && GameData.ITEMS[id]) {
              return GameData.ITEMS[id];
            } else if (cnt >= 100 && GameData && GameData.FOOD && GameData.FOOD[id]) {
              return GameData.FOOD[id];
            }
            return `Item ${id}`;
          };

          itemName.textContent = getItemName(itemId, useCnt);
          itemDiv.appendChild(itemName);

          // Item ID input
          const idInput = document.createElement('input');
          idInput.type = 'number';
          idInput.value = item.item_no;
          idInput.style.width = '80px';
          idInput.style.marginBottom = '0';
          idInput.addEventListener('input', (e) => {
            item.item_no = parseFloat(e.target.value);
            const newId = parseFloat(e.target.value);
            itemName.textContent = getItemName(newId, item.use_cnt);
          });
          itemDiv.appendChild(idInput);

          // Use count input
          const cntLabel = document.createElement('label');
          cntLabel.textContent = 'use_cnt';
          cntLabel.style.marginBottom = '0';
          cntLabel.style.fontSize = '0.85rem';
          itemDiv.appendChild(cntLabel);

          const cntInput = document.createElement('input');
          cntInput.type = 'number';
          cntInput.value = item.use_cnt;
          cntInput.style.width = '60px';
          cntInput.style.marginBottom = '0';
          cntInput.addEventListener('input', (e) => {
            item.use_cnt = parseFloat(e.target.value);
            // Update item name display when use_cnt changes
            itemName.textContent = getItemName(item.item_no, parseFloat(e.target.value));
          });
          itemDiv.appendChild(cntInput);

          itemContainer.appendChild(itemDiv);
        });

        rightColumn.appendChild(itemContainer); // Add to right column
        return; // Don't add to el
      }
      // Special handling for buki_mon (Weapon Runes) - DROPDOWN
      else if (prop === 'buki_mon') {
        const weaponRuneDiv = document.createElement('div');
        weaponRuneDiv.className = 'json-item';

        const label = document.createElement('label');
        label.textContent = Schema.labels[prop] || prop;
        weaponRuneDiv.appendChild(label);

        // Check if this character is a beast/monster (cannot equip weapon runes)
        const isBeast = GameData && GameData.BEASTS && GameData.BEASTS.includes(index);

        const select = document.createElement('select');
        select.style.marginBottom = '0';

        if (isBeast) {
          // Create disabled dropdown with only "None" option for beasts/monsters
          const option = document.createElement('option');
          option.value = 0;
          option.textContent = '0: None (Beast/Monster - Cannot equip)';
          option.selected = true;
          select.appendChild(option);
          select.disabled = true;
          select.style.opacity = '0.6';
          select.style.cursor = 'not-allowed';

          // Force value to 0
          charData[prop] = 0;
        } else {
          // Weapon rune options for normal characters
          const weaponRunes = [
            { id: 0, name: 'None' },
            { id: 1, name: 'Fire Orb' },
            { id: 2, name: 'Rage Orb' },
            { id: 3, name: 'Water Orb' },
            { id: 4, name: 'Flowing Orb' },
            { id: 5, name: 'Wind Orb' },
            { id: 6, name: 'Cyclone Orb' },
            { id: 7, name: 'Earth Orb' },
            { id: 8, name: 'Mother Earth Orb' },
            { id: 9, name: 'Lightning Orb' },
            { id: 10, name: 'Thunder Orb' },
            { id: 94, name: 'Hunter Orb' },
            { id: 95, name: 'Technique Orb' },
            { id: 96, name: 'Silence Orb' },
            { id: 97, name: 'Poison Orb' },
            { id: 98, name: 'Knockdown Orb' },
            { id: 99, name: 'Sleep Orb' },
            { id: 100, name: 'Friendship Orb' },
            { id: 101, name: 'Solitude Orb' },
            { id: 102, name: 'Kindness Orb' },
            { id: 103, name: 'Exertion Orb' }
          ];

          weaponRunes.forEach(rune => {
            const option = document.createElement('option');
            option.value = rune.id;
            option.textContent = `${rune.id}: ${rune.name}`;
            if (charData[prop] === rune.id) {
              option.selected = true;
            }
            select.appendChild(option);
          });

          select.addEventListener('change', (e) => {
            charData[prop] = parseInt(e.target.value);
          });
        }

        weaponRuneDiv.appendChild(select);
        leftColumn.appendChild(weaponRuneDiv);
        return; // Don't add to el
      }
      else {
        // Use schema label if available, otherwise use property name
        const displayLabel = Schema.labels[prop] || prop;
        el = createElementForValue(charData[prop], displayLabel, (newValue) => {
          charData[prop] = newValue;
        }, charData);

        // Add to left column
        leftColumn.appendChild(el);
        return; // Don't add to el
      }
    });

    // Add both columns to the container
    columnsContainer.appendChild(leftColumn);
    columnsContainer.appendChild(rightColumn);
    charDetails.appendChild(columnsContainer);

    details.appendChild(charDetails);
  }

  if (arr.length > 84) {
    const note = document.createElement('p');
    note.textContent = `Note: Showing only first 84 playable characters. ${arr.length - 84} non-playable characters hidden.`;
    note.style.fontStyle = 'italic';
    note.style.color = 'var(--pico-muted-color)';
    details.appendChild(note);
  }

  // Add filter event listener
  filterSelect.addEventListener('change', (e) => {
    const filterValue = e.target.value;
    const allCharDetails = details.querySelectorAll('.json-object');

    allCharDetails.forEach(charDetail => {
      if (filterValue === 'all') {
        charDetail.style.display = '';
      } else {
        // Check if character has the selected attribute
        let shouldShow = false;
        if (filterValue === 'M' && charDetail.dataset.isMale === 'true') shouldShow = true;
        if (filterValue === 'F' && charDetail.dataset.isFemale === 'true') shouldShow = true;
        if (filterValue === 'K' && charDetail.dataset.isKobold === 'true') shouldShow = true;
        if (filterValue === 'W' && charDetail.dataset.isWinger === 'true') shouldShow = true;
        if (filterValue === 'Z' && charDetail.dataset.isMonster === 'true') shouldShow = true;
        if (filterValue === 'N' && charDetail.dataset.isNoble === 'true') shouldShow = true;

        charDetail.style.display = shouldShow ? '' : 'none';
      }
    });
  });

  return details;
}

// ============================================================================
// DATA VALUES VIEWER
// RENDERS: GameData reference tables for easy lookup with donate button
// ============================================================================

function createDataValuesViewer(container) {
  container.innerHTML = '';
  container.className = 'tab-content data-values-content';

  if (typeof GameData === 'undefined') {
    container.innerHTML = '<p>GameData not loaded.</p>';
    return;
  }

  // Add intro text
  const intro = document.createElement('p');
  intro.style.cssText = 'margin-bottom: 1rem; color: var(--pico-muted-color);';
  intro.innerHTML = '<strong>Reference Data:</strong> Item IDs, character names, and use_cnt classifications for the save file editor.';
  container.appendChild(intro);

  // Define categories with their use_cnt information
  const categories = [
    { name: 'CHARACTERS', data: GameData.CHARACTERS, info: 'Character names by index (0-125)' },
    { name: 'ITEMS', data: GameData.ITEMS, info: 'Consumable items (use_cnt: 0-9)' },
    { name: 'FARMING', data: GameData.FARMING, info: 'Farm items (use_cnt: 48)' },
    { name: 'TRADE', data: GameData.TRADE, info: 'Trade goods (use_cnt: 64)' },
    { name: 'BASE_ITEM', data: GameData.BASE_ITEM, info: 'Warehouse items (use_cnt: 80)' },
    { name: 'FOOD', data: GameData.FOOD, info: 'Food recipes (use_cnt: 99+)' },
    { name: 'RUNES', data: GameData.RUNES, info: 'Rune orbs (use_cnt: 32)' },
    { name: 'HELMET', data: GameData.HELMET, info: 'Helmets (use_cnt: 16)' },
    { name: 'ARMOR', data: GameData.ARMOR, info: 'Armor (use_cnt: 16)' },
    { name: 'SHIELD', data: GameData.SHIELD, info: 'Shields (use_cnt: 16)' },
    { name: 'OTHER_EQUIP_GEAR', data: GameData.OTHER_EQUIP_GEAR, info: 'Accessories (use_cnt: 16)' }
  ];

  categories.forEach(category => {
    if (!category.data) return;

    const details = document.createElement('details');
    details.className = 'json-object';

    const summary = document.createElement('summary');
    summary.innerHTML = `<strong>${category.name}</strong> - ${category.info}`;
    details.appendChild(summary);

    const listContainer = document.createElement('div');
    listContainer.className = 'data-values-list';

    const entries = Object.entries(category.data);
    entries.forEach(([id, itemData]) => {
      const item = document.createElement('div');
      item.className = 'data-values-item';

      const idSpan = document.createElement('span');
      idSpan.className = 'id';
      idSpan.textContent = id + ':';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'name';

      // Handle both object format (CHARACTERS, ARMOR) and string format (other items)
      if (typeof itemData === 'object' && itemData !== null && itemData.name) {
        // Object format with name property
        nameSpan.textContent = itemData.name;

        // Optionally show attributes for CHARACTERS and ARMOR
        if (itemData.attrs && itemData.attrs.length > 0) {
          const attrsSpan = document.createElement('span');
          attrsSpan.className = 'attrs';
          attrsSpan.style.cssText = 'margin-left: 0.5rem; font-size: 0.85rem; color: var(--pico-muted-color); font-style: italic;';
          attrsSpan.textContent = `[${itemData.attrs.join(', ')}]`;
          nameSpan.appendChild(attrsSpan);
        }
      } else {
        // Simple string format
        nameSpan.textContent = itemData;
      }

      item.appendChild(idSpan);
      item.appendChild(nameSpan);
      listContainer.appendChild(item);
    });

    details.appendChild(listContainer);
    container.appendChild(details);
  });

  // Add PayPal Donate Button at the bottom
  const donateContainer = document.createElement('div');
  donateContainer.style.cssText = 'text-align: center; margin-top: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #f5d020 0%, #f0b90b 100%); border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);';

  const donateText = document.createElement('p');
  donateText.style.cssText = 'margin: 0 0 1rem 0; font-size: 0.9rem; color: #000; font-weight: 600;';
  donateText.textContent = '☕ Enjoying this editor? Support development!';
  donateContainer.appendChild(donateText);

  const donateButton = document.createElement('a');
  donateButton.href = 'https://paypal.me/thefaospark?country.x=PH&locale.x=en_US';
  donateButton.target = '_blank';
  donateButton.rel = 'noopener noreferrer';
  donateButton.textContent = '💛 Donate via PayPal';
  donateButton.style.cssText = 'display: inline-block; padding: 0.75rem 2rem; background: #000; color: #f5d020; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 1rem; transition: all 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2);';

  donateButton.addEventListener('mouseenter', () => {
    donateButton.style.transform = 'translateY(-2px)';
    donateButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
  });

  donateButton.addEventListener('mouseleave', () => {
    donateButton.style.transform = 'translateY(0)';
    donateButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
  });

  donateContainer.appendChild(donateButton);
  container.appendChild(donateContainer);
}

// ============================================================================
// GENERIC VALUE EDITORS
// RENDERS: Primitive inputs, objects, and arrays for unspecialized fields
// ============================================================================

function createElementForValue(value, key, updateCallback, parentObject) {
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
      return createPrimitiveInput(value, key, type, updateCallback);
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

function createPrimitiveInput(value, key, type, updateCallback) {
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
    input.addEventListener('change', (e) => {
      updateCallback(e.target.checked);
    });
    div.appendChild(input);
  } else {
    input = document.createElement('input');
    input.type = type === 'number' ? 'number' : 'text';
    input.value = value;
    if (type === 'number') {
      input.step = 'any';
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

  // Optimization: If array is huge, maybe don't render all?
  // For now render all
  arr.forEach((item, index) => {
    const el = createElementForValue(item, index, (newValue) => {
      arr[index] = newValue;
    }, arr);
    details.appendChild(el);
  });

  return details;
}


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
      });
      saveBtn.disabled = false;
    } catch (err) {
      alert('Error parsing JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
});

saveBtn.addEventListener('click', () => {
  if (!currentData) return;

  const blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = currentFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Hotkey: Ctrl+T to toggle debug mode
document.addEventListener('keydown', (e) => {
  // Check for Ctrl+T (or Cmd+T on Mac)
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault(); // Prevent default browser behavior (new tab)

    // Toggle debug mode
    DEBUG_MODE = !DEBUG_MODE;

    if (DEBUG_MODE) {
      console.log('Debug mode ENABLED - Loading debug file...');

      // Load debug file
      fetch(DEBUG_FILE_PATH)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load debug file: ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          currentData = data;
          currentFileName = 'debug_save.json';
          renderEditor(editorContainer, currentData, (newData) => {
            currentData = newData;
          });
          saveBtn.disabled = false;
          console.log('Debug mode: Auto-loaded save file from', DEBUG_FILE_PATH);

          // Show notification
          alert('🐛 Debug Mode ENABLED\n\nDebug save file loaded from:\n' + DEBUG_FILE_PATH);
        })
        .catch(err => {
          console.error('Debug mode: Failed to load debug file:', err);
          alert('Debug mode enabled but failed to load file from:\n' + DEBUG_FILE_PATH + '\n\nError: ' + err.message);
          DEBUG_MODE = false; // Revert if loading fails
        });
    } else {
      console.log('Debug mode DISABLED');
      alert('🐛 Debug Mode DISABLED\n\nYou can now load files normally.');
    }
  }
});
